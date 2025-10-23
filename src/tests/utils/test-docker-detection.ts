import { exec } from 'child_process';
import { promisify } from 'util';
import { getDockerComposeCommand } from './docker-compose-detector.ts';

const execAsync = promisify(exec);

async function main() {
  try {
    console.log('🔍 Detectando comando Docker Compose...\n');

    const cmd = await getDockerComposeCommand();
    console.log(`✅ Detectado: ${cmd}`);

    // Testa o comando
    console.log('\n📋 Verificando versão:');
    const { stdout } = await execAsync(`${cmd} version`);
    console.log(stdout);

    console.log('✅ Docker Compose está funcionando corretamente!');
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
