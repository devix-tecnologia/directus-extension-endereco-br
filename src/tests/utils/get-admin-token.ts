import fetch from 'node-fetch';

export async function getAdminToken() {
  const url = 'http://localhost:8055/auth/login';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao autenticar: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as { data?: { access_token?: string } };
  return data.data?.access_token;
}
