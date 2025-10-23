import { promisify } from 'util';
import { exec } from 'child_process';
import axios from 'axios';
import { testEnv } from './test-env.ts';
import { logger } from './test-logger.ts';

const execAsync = promisify(exec);

async function cleanupDocker(): Promise<void> {
  try {
    logger.debug('Cleaning up test containers...');
    await execAsync('docker compose -f docker-compose.test.yml down --remove-orphans');
    logger.debug('Test containers removed');
  } catch (error) {
    logger.warn('Warning while cleaning test containers:', error);
  }
}

export async function setupTestEnvironment(): Promise<string> {
  try {
    await cleanupDocker();

    logger.info('Starting test environment...');
    const { stdout, stderr } = await execAsync('docker compose -f docker-compose.test.yml up -d');

    const realError = stderr && !stderr.includes('Creating') && !stderr.includes('Starting');
    if (realError) {
      logger.error('Docker Compose error:', stderr);
    } else if (stdout || stderr) {
      logger.dockerProgress(stdout || stderr);
    }

    logger.info('Waiting for Directus to be ready...');
    await waitForBootstrap();

    const loginResponse = await axios.post(`${testEnv.DIRECTUS_PUBLIC_URL}/auth/login`, {
      email: testEnv.DIRECTUS_ADMIN_EMAIL,
      password: testEnv.DIRECTUS_ADMIN_PASSWORD,
    });

    const accessToken = loginResponse.data.data.access_token;
    logger.info(`Token de admin obtido com sucesso: ${accessToken.slice(0, 10)}...`);

    logger.info('Configurando permissões...');
    await configurePermissions(accessToken);

    logger.info('Aguardando 20 segundos para processamento completo do Directus...');
    await new Promise((resolve) => setTimeout(resolve, 20000));

    logger.info('✅ Configuração concluída. Iniciando testes...');
    return accessToken;
  } catch (error) {
    logger.error('Failed to setup test environment:', error);
    throw error;
  }
}

export async function teardownTestEnvironment(): Promise<void> {
  try {
    logger.info('Shutting down test environment...');
    await execAsync('docker compose -f docker-compose.test.yml down --remove-orphans');
  } catch (error) {
    logger.error('Erro ao finalizar ambiente de teste:', error);
    throw error;
  }
}

async function waitForBootstrap(retries = 90, delay = 3000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      logger.debug(`Connection attempt ${i + 1}/${retries}`);

      const healthCheck = await axios.get(`${testEnv.DIRECTUS_PUBLIC_URL}/server/health`);
      if (healthCheck.data.status !== 'ok') {
        throw new Error('Health check failed');
      }

      try {
        await axios.post(`${testEnv.DIRECTUS_PUBLIC_URL}/auth/login`, {
          email: testEnv.DIRECTUS_ADMIN_EMAIL,
          password: testEnv.DIRECTUS_ADMIN_PASSWORD,
        });
        logger.info('Directus is ready and accepting authentication');
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Atraso extra de 5s
        return;
      } catch (authError) {
        throw new Error('System not ready for authentication');
      }
    } catch (error) {
      if (i === retries - 1) {
        logger.error('Failed to connect to Directus', error);
        throw new Error('Directus failed to start');
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function configurePermissions(token: string): Promise<void> {
  const baseURL = testEnv.DIRECTUS_PUBLIC_URL;
  const headers = { Authorization: `Bearer ${token}` };
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const roleResponse = await axios.get(`${baseURL}/roles`, { headers });
      let adminRole =
        roleResponse.data.data.find((role: any) => role.admin_access === true) ||
        roleResponse.data.data.find((role: any) => role.name === 'Administrator');

      if (!adminRole) {
        const newRoleResponse = await axios.post(
          `${baseURL}/roles`,
          { name: 'Administrator', admin_access: true, ip_access: null },
          { headers }
        );
        adminRole = newRoleResponse.data.data;
        logger.info(`✅ Role Administrator criada com ID: ${adminRole.id}`);
      } else if (!adminRole.admin_access) {
        await axios.patch(`${baseURL}/roles/${adminRole.id}`, { admin_access: true }, { headers });
        logger.info(`✅ Admin access habilitado para role ID: ${adminRole.id}`);
      }

      const userResponse = await axios.get(`${baseURL}/users`, { headers });
      const adminUser = userResponse.data.data.find(
        (user: any) => user.email === testEnv.DIRECTUS_ADMIN_EMAIL
      );
      if (adminUser) {
        if (adminUser.role !== adminRole.id) {
          try {
            await axios.patch(
              `${baseURL}/users/${adminUser.id}`,
              { role: adminRole.id },
              { headers }
            );
            logger.info(`✅ Usuário admin associado à role ID: ${adminRole.id}`);
          } catch (error: any) {
            if (error.response && error.response.status === 422) {
              logger.warn(
                `❌ Erro 422 ao atualizar role do usuário. Usando role existente com admin_access.`
              );
              adminRole = roleResponse.data.data.find((role: any) => role.admin_access === true);
              if (adminRole) {
                logger.info(`✅ Usando role existente com ID: ${adminRole.id}`);
              } else {
                throw new Error('Nenhum role com admin_access disponível');
              }
            } else {
              throw error;
            }
          }
        } else {
          logger.info(`✅ Usuário admin já associado à role ID: ${adminRole.id}`);
        }
      }

      // Configurar permissões para directus_collections
      const response1 = await axios.post(
        `${baseURL}/permissions`,
        {
          role: adminRole.id,
          collection: 'directus_collections',
          action: 'create',
          permissions: {
            create: ['*'],
            read: ['*'],
            update: ['*'],
            delete: ['*'],
          },
          policy: {
            name: 'admin_full_access',
            _and: [],
          },
          validation: null,
          presets: null,
        },
        { headers }
      );
      logger.info(
        `✅ Permissões configuradas para directus_collections (Role ID: ${adminRole.id})`
      );

      // Verificar e configurar admin_access com retry
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const roleCheck = await axios.get(`${baseURL}/roles/${adminRole.id}`, { headers });
        if (roleCheck.data.admin_access === true) {
          logger.info(`✅ Verificação: admin_access está ativo para role ID: ${adminRole.id}`);
          break;
        }
        if (i === 9) {
          logger.error('❌ Admin access não foi aplicado corretamente no role');
          throw new Error('Admin access não aplicado');
        }
        logger.warn(`Tentativa ${i + 1}/10 falhou. Tentando novamente em 2s...`);
      }

      // Criar coleção endereco_br com retry
      const maxAttempts = 3;
      for (let i = 1; i <= maxAttempts; i++) {
        try {
          const collectionsResponse = await axios.get(`${baseURL}/collections`, { headers });
          if (!collectionsResponse.data.data.find((c: any) => c.collection === 'endereco_br')) {
            await axios.post(
              `${baseURL}/collections`,
              {
                collection: 'endereco_br',
                fields: [
                  { field: 'cep', type: 'string', schema: { is_primary_key: false } },
                  { field: 'bairro', type: 'string', schema: { is_primary_key: false } },
                  { field: 'logradouro', type: 'string', schema: { is_primary_key: false } },
                  { field: 'numero', type: 'string', schema: { is_primary_key: false } },
                  { field: 'cidade', type: 'string', schema: { is_primary_key: false } },
                  { field: 'uf', type: 'string', schema: { is_primary_key: false } },
                ],
              },
              { headers }
            );
            logger.info('✅ Coleção endereco_br criada');
          }
          break;
        } catch (error: any) {
          if (error.response && error.response.status === 403 && i < maxAttempts) {
            logger.warn(`Tentativa ${i}/${maxAttempts} falhou com 403. Tentando novamente...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else if (error.response && error.response.status === 403) {
            logger.error(
              '❌ Permissão negada para criar coleção após retries. Verifique a role admin.'
            );
            throw new Error('Falha ao criar coleção devido a permissões.');
          } else {
            logger.error('Erro ao criar coleção:', error);
            throw error;
          }
        }
      }

      // Configurar permissões para endereco_br
      await axios.post(
        `${baseURL}/permissions`,
        {
          role: adminRole.id,
          collection: 'endereco_br',
          action: 'create',
          permissions: { create: true, read: true, update: true, delete: true },
        },
        { headers }
      );
      logger.info(`✅ Permissões configuradas para endereco_br (Role ID: ${adminRole.id})`);

      return;
    } catch (error: any) {
      attempt++;
      if (attempt === maxRetries) {
        logger.error('❌ Falha em configurePermissions após retries:', error);
        throw error;
      }
      logger.warn(`Tentativa ${attempt}/${maxRetries} falhou. Tentando novamente em 2s...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
