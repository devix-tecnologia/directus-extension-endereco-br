import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';
import { directusVersions } from './directus-versions.js';
import axios from 'axios';

describe.each(directusVersions)(
  'Endereco BR Integration Tests - Directus %s',
  (version) => {
    let accessToken: string;
    const baseURL = 'http://localhost:18055';

    beforeAll(async () => {
      console.log(`🚀 Setting up Directus ${version}...`);
      process.env.DIRECTUS_VERSION = version;
      accessToken = await setupTestEnvironment();
      process.env.DIRECTUS_ACCESS_TOKEN = accessToken;
      console.log(`✅ Directus ${version} setup complete!`);
    }, 120000); // Timeout específico para o beforeAll

    afterAll(async () => {
      console.log(`🧹 Cleaning up Directus ${version}...`);
      await teardownTestEnvironment();
      console.log(`✅ Directus ${version} cleanup complete!`);
    }, 120000);

    test('Endpoint /pesquisa-cep/:cep deve retornar dados válidos', async () => {
      expect(process.env.DIRECTUS_ACCESS_TOKEN).toBeDefined();
      const cep = '01001000';
      console.log(`📍 Fazendo requisição GET para ${baseURL}/pesquisa-cep/${cep}`);

      const response = await axios.get(`${baseURL}/pesquisa-cep/${cep}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      });

      console.log('✅ Resposta recebida:', response.status);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data[0].text).toContain('São Paulo');
    }, 60000);

    test('Endpoint /pesquisa-cep/:cep deve retornar erro para CEP inválido', async () => {
      const cep = '00000000';
      console.log(`📍 Fazendo requisição GET para ${baseURL}/pesquisa-cep/${cep}`);

      const response = await axios.get(`${baseURL}/pesquisa-cep/${cep}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      });

      console.log('✅ Resposta recebida:', response.status);
      expect(response.status).toBe(200);
      expect(response.data[0].text).toContain('Valor de cep inválido');
    }, 60000);

    test('Hook endereco_br.items.create deve processar CEP e definir bairro automaticamente', async () => {
      const payload = {
        cep: '01001000',
        logradouro: 'Praça da Sé',
        numero: '100',
        cidade: 'São Paulo',
        uf: 'SP',
      };

      console.log(`🪝 Testando hook com payload:`, payload);

      const response = await axios.post(`${baseURL}/items/endereco_br`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      });

      console.log('✅ Resposta do hook:', response.status);
      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty('bairro');
      expect(response.data.data.bairro).toBeDefined();
    }, 60000);

    test('Hook deve lidar com CEP inexistente gracefully', async () => {
      const payload = {
        cep: '99999999',
        logradouro: 'Rua Teste',
        numero: '123',
        cidade: 'Cidade Teste',
        uf: 'XX',
      };

      console.log(`🪝 Testando hook com CEP inválido:`, payload.cep);

      await expect(
        axios.post(`${baseURL}/items/endereco_br`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 10000,
        })
      ).rejects.toThrow();
    }, 60000);
  }
);
