import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment } from './setup.js';
import { getDirectusTestVersion } from './directus-versions.js';
import { pesquisarCep, createItem } from './helper_test.js';

// Versão definida por DIRECTUS_TEST_VERSION (padrão: última 11.x); nunca >= 12.
const directusVersions = [getDirectusTestVersion()];

describe.each(directusVersions)('Endereco BR Integration Tests - Directus %s', (version) => {
	let accessToken: string;
	const testSuiteId = `bairro`;

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

	// Campos lidos após criar o item. O campo `localizacao` (geometry) fica de fora porque o
	// SQLite da imagem oficial não tem SpatiaLite (`st_astext` não existe), e a leitura dele
	// devolveria erro 500 depois do insert.
	const camposEndereco = 'id,cep,logradouro,bairro.id,bairro.nome';

	test('Hook endereco_br.items.create deve processar CEP e definir bairro automaticamente', async () => {
		const pesquisa = await pesquisarCep('01001000', testSuiteId);
		expect(pesquisa.status).toBe(200);

		const pesquisaCep = (Array.isArray(pesquisa.data) ? pesquisa.data : [pesquisa.data])[0]?.value;
		expect(pesquisaCep).toBeDefined();

		const payload = { pesquisa_cep: pesquisaCep, numero: '100' };

		console.log(`🪝 Testando hook com pesquisa_cep do CEP 01001000`);

		const response = await createItem(`endereco_br?fields=${camposEndereco}`, payload, testSuiteId);

		console.log('✅ Resposta do hook:', response.status);
		expect(response.status).toBe(200);
		expect(response.data.cep).toBe('01001-000');
		expect(response.data.logradouro).toContain('Praça da Sé');
		expect(response.data.bairro?.id).toBeDefined();
		expect(response.data.bairro?.nome).toBe('Sé');
	}, 30000);

	test('Hook deve lidar com CEP inexistente gracefully', async () => {
		const pesquisa = await pesquisarCep('99999999', testSuiteId);
		expect(pesquisa.status).toBe(200);

		const pesquisaCep = (Array.isArray(pesquisa.data) ? pesquisa.data : [pesquisa.data])[0]?.value;
		expect(pesquisaCep).toBeUndefined();

		const payload = { cep: '99999999', logradouro: 'Rua Teste', numero: '123' };

		console.log(`🪝 Testando hook com CEP inexistente:`, payload.cep);

		const response = await createItem(`endereco_br?fields=${camposEndereco}`, payload, testSuiteId);

		expect(response.status).toBe(200);
		expect(response.data.cep).toBe('99999999');
		expect(response.data.bairro).toBeNull();
	}, 30000);
});
