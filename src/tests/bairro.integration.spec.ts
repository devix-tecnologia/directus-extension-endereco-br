import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';
import { directusVersions } from './directus-versions.js';
import { pesquisarCep, createItem } from './helper_test.js';

describe.each(directusVersions)('Endereco BR Integration Tests - Directus %s', (version) => {
	let accessToken: string;
	const testSuiteId = `bairro-${version}`;

	beforeAll(async () => {
		console.log(`🚀 Setting up Directus ${version}...`);
		process.env.DIRECTUS_VERSION = version;
		accessToken = await setupTestEnvironment(testSuiteId);
		process.env.DIRECTUS_ACCESS_TOKEN = accessToken;
		console.log(`✅ Directus ${version} setup complete!`);
	}, 180000); // 3min timeout para setup (container + bootstrap)

	afterAll(async () => {
		console.log(`🧹 Cleaning up Directus ${version}...`);
		await teardownTestEnvironment(testSuiteId);
		console.log(`✅ Directus ${version} cleanup complete!`);
	}, 30000);

	test('Endpoint /pesquisa-cep/:cep deve retornar dados válidos', async () => {
		expect(process.env.DIRECTUS_ACCESS_TOKEN).toBeDefined();
		const cep = '01001000';
		console.log(`📍 Fazendo requisição GET para /pesquisa-cep/${cep}`);

		const response = await pesquisarCep(cep, testSuiteId);

		console.log('✅ Resposta recebida:', response.status);
		expect(response.status).toBe(200);
		expect(response.data).toBeDefined();

		const data = Array.isArray(response.data) ? response.data : [response.data];
		expect(data.length).toBeGreaterThan(0);
		expect(data[0].text).toContain('São Paulo');
	}, 30000);

	test('Endpoint /pesquisa-cep/:cep deve retornar erro para CEP inválido', async () => {
		const cep = '00000000';
		console.log(`📍 Fazendo requisição GET para /pesquisa-cep/${cep}`);

		const response = await pesquisarCep(cep, testSuiteId);

		console.log('✅ Resposta recebida:', response.status);
		expect(response.status).toBe(200);
		expect(response.data).toBeDefined();

		const data = Array.isArray(response.data) ? response.data : [response.data];
		expect(data[0].text).toContain('Valor de cep inválido');
	}, 30000);

	test('Hook endereco_br.items.create deve processar CEP e definir bairro automaticamente', async () => {
		const payload = {
			cep: '01001000',
			logradouro: 'Praça da Sé',
			numero: '100',
			cidade: 'São Paulo',
			uf: 'SP',
		};

		console.log(`🪝 Testando hook com payload:`, payload);

		const response = await createItem('endereco_br', payload, testSuiteId);

		console.log('✅ Resposta do hook:', response.status);
		expect(response.status).toBe(200);
		expect(response.data).toBeDefined();
		expect(response.data.data).toHaveProperty('bairro');
		expect(response.data.data.bairro).toBeDefined();
	}, 30000);

	test('Hook deve lidar com CEP inexistente gracefully', async () => {
		const payload = {
			cep: '99999999',
			logradouro: 'Rua Teste',
			numero: '123',
			cidade: 'Cidade Teste',
			uf: 'XX',
		};

		console.log(`🪝 Testando hook com CEP inválido:`, payload.cep);

		await expect(createItem('endereco_br', payload, testSuiteId)).rejects.toThrow();
	}, 30000);
});
