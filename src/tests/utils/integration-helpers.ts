import { execSync } from 'node:child_process';
import axios from 'axios';
import { getDockerComposeCommand } from './docker-compose-detector.js';

// 🔹 Tenta detectar se já há um Directus rodando localmente
async function isDirectusRunning(url: string): Promise<boolean> {
  try {
    const res = await globalThis.fetch(`${url}/server/health`);
    if (!res.ok) return false;
    const json = await res.json();
    return json.status === 'ok';
  } catch {
    return false;
  }
}

// 🔹 Espera o Directus subir
export async function waitForDirectus(url: string) {
  const maxAttempts = 120;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${url}/server/health`); // ✅ corrigido
      if (response.ok) return true;
    } catch {
      // ainda não subiu
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timeout esperando Directus em ${url}`);
}

// 🔹 Sobe o container se não estiver rodando
export async function setupDirectus(): Promise<string> {
  const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';

  const running = await isDirectusRunning(directusUrl);
  if (!running) {
    console.log('🔹 Iniciando Directus via Docker Compose...');
    const cmd = await getDockerComposeCommand();
    execSync(`${cmd} -f docker-compose.test.yml up -d`, { stdio: 'inherit' });
    await waitForDirectus(directusUrl);
  } else {
    console.log('🟢 Directus já está em execução.');
  }

  return directusUrl;
}

// ✅ NOVA FUNÇÃO — Gera o token de admin para autenticar os testes
export async function getAdminToken(baseURL: string): Promise<string> {
  const response = await axios.post(`${baseURL}/auth/login`, {
    email: 'admin@example.com',
    password: 'admin',
  });

  return response.data.data.access_token;
}
