import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';
import axios from 'axios';

describe('Hook + Endpoint Integration Tests', () => {
  let accessToken: string;
  const baseURL = 'http://localhost:8055';

  beforeAll(async () => {
    accessToken = await setupTestEnvironment();
    process.env.DIRECTUS_ACCESS_TOKEN = accessToken;
  }, 60000);

  afterAll(async () => {
    await teardownTestEnvironment();
  }, 30000);

  test.only('Endpoint /:cep deve retornar dados válidos', async () => {
    const cep = '01001000';
    console.log(`Fazendo requisição GET para ${baseURL}/${cep}`);
    const response = await axios.get(`${baseURL}/${cep}`, { timeout: 10000 });
    console.log('Resposta recebida:', response.status, response.data);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0].text).toContain('São Paulo');
  }, 30000);

  test('Endpoint /:cep deve retornar erro para CEP inválido', async () => {
    const cep = '00000000';
    console.log(`Fazendo requisição GET para ${baseURL}/${cep}`);
    const response = await axios.get(`${baseURL}/${cep}`, { timeout: 10000 });
    console.log('Resposta recebida:', response.status, response.data);
    expect(response.status).toBe(200);
    expect(response.data[0].text).toContain('Valor de cep inválido');
  }, 30000);

  test('Hook endereco_br.items.create deve processar CEP e definir bairro automaticamente', async () => {
    const payload = {
      cep: '01001000',
      logradouro: 'Praça da Sé',
      numero: '100',
      cidade: 'São Paulo',
      uf: 'SP',
    };

    const response = await axios.post(`${baseURL}/items/endereco_br`, payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000,
    });

    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('bairro');
  }, 60000);
});
