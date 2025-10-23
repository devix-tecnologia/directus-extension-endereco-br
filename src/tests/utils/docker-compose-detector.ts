import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { homedir } from 'os';

const execAsync = promisify(exec);

/**
 * Cache do comando Docker Compose detectado
 */
let dockerComposeCommand: string | null = null;

/**
 * Configura o DOCKER_HOST para usar Colima se disponível
 */
function setupDockerHost(): void {
  // Se já está configurado, não faz nada
  if (process.env.DOCKER_HOST) {
    return;
  }

  // Verifica se o Colima está rodando
  const colimaSocket = `${homedir()}/.colima/default/docker.sock`;
  if (existsSync(colimaSocket)) {
    process.env.DOCKER_HOST = `unix://${colimaSocket}`;
    console.log('🐳 Usando Colima Docker socket:', process.env.DOCKER_HOST);
  }
}

/**
 * Detecta automaticamente qual comando Docker Compose usar.
 * Suporta tanto 'docker compose' (plugin) quanto 'docker-compose' (standalone).
 *
 * @returns {Promise<string>} O comando detectado ('docker compose' ou 'docker-compose')
 * @throws {Error} Se nenhum comando Docker Compose for encontrado
 */
export async function getDockerComposeCommand(): Promise<string> {
  if (dockerComposeCommand) {
    return dockerComposeCommand;
  }

  // Configura o Docker Host para Colima se necessário
  setupDockerHost();

  try {
    // Tenta docker compose (plugin - mais recente)
    await execAsync('docker compose version');
    dockerComposeCommand = 'docker compose';
    console.log('🐳 Detectado: docker compose (plugin)');
    return dockerComposeCommand;
  } catch {
    try {
      // Tenta docker-compose (standalone - legado)
      await execAsync('docker-compose --version');
      dockerComposeCommand = 'docker-compose';
      console.log('🐳 Detectado: docker-compose (standalone)');
      return dockerComposeCommand;
    } catch {
      throw new Error(
        'Docker Compose não encontrado. ' +
        'Instale docker-compose ou o plugin docker compose.'
      );
    }
  }
}

/**
 * Reseta o cache do comando Docker Compose.
 * Útil para testes ou quando o comando pode ter mudado.
 */
export function resetDockerComposeCommand(): void {
  dockerComposeCommand = null;
}
