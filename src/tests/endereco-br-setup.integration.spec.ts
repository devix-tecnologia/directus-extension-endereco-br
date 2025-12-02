import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { setupTestEnvironment, teardownTestEnvironment, dockerHttpRequest } from './setup.js';
import { getCollections, getRelations, listItems } from './helper_test.js';
import { logger } from './test-logger.js';
import schema from '../../files/state.json';
import seedData from '../../files/seed.json';

interface Collection {
	collection: string;
	meta: {
		archive_field?: string | null;
		icon?: string;
	};
}

interface Field {
	field: string;
	type: string;
	collection: string;
}

interface Relation {
	collection: string;
	field: string;
	related_collection: string;
}

describe('Auto Setup Hook - Criação de Coleções', () => {
	const version = process.env.DIRECTUS_TEST_VERSION || 'latest';
	const testSuiteId = 'setup';

	beforeAll(async () => {
		process.env.DIRECTUS_VERSION = version;
		process.env.TEST_SUITE_ID = testSuiteId;
		logger.setCurrentTest(`Auto Setup Test - Directus ${process.env.DIRECTUS_VERSION}`);
		await setupTestEnvironment(testSuiteId);
	}, 600000); // 10 minutos de timeout

	afterAll(async () => {
		await teardownTestEnvironment(testSuiteId);
	});

	test('Deve ter criado todas as coleções do schema', async () => {
		const response = await getCollections(testSuiteId);

		const collections = response.data || response;
		const collectionNames = collections.map((c: Collection) => c.collection);

		// Verificar se todas as coleções do schema foram criadas
		const expectedCollections = schema.collections.map((c: { collection: string }) => c.collection);

		for (const expectedCollection of expectedCollections) {
			expect(
				collectionNames,
				`Coleção "${expectedCollection}" deveria ter sido criada pelo hook de setup`
			).toContain(expectedCollection);
		}

		logger.info(
			`✓ Todas as ${expectedCollections.length} coleções criadas: ${expectedCollections.join(', ')}`
		);
	});

	test('Deve ter criado a coleção pais com metadados corretos', async () => {
		const response = await dockerHttpRequest(
			'GET',
			'/collections/pais',
			undefined,
			{
				Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
			},
			testSuiteId
		);

		const collection = response.data || response;

		expect(collection).toBeDefined();
		expect(collection.collection).toBe('pais');
		expect(collection.meta).toBeDefined();
		expect(collection.meta.archive_field).toBeNull(); // Sem arquivamento

		logger.info('✓ Coleção pais tem metadados corretos');
	});

	test('Deve ter criado a coleção estado com metadados corretos', async () => {
		const response = await dockerHttpRequest(
			'GET',
			'/collections/estado',
			undefined,
			{
				Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
			},
			testSuiteId
		);

		const collection = response.data || response;

		expect(collection).toBeDefined();
		expect(collection.collection).toBe('estado');
		expect(collection.meta).toBeDefined();
		expect(collection.meta.archive_field).toBeNull(); // Sem arquivamento

		logger.info('✓ Coleção estado tem metadados corretos');
	});

	test('Deve ter criado a coleção cidade', async () => {
		const response = await dockerHttpRequest(
			'GET',
			'/collections/cidade',
			undefined,
			{
				Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
			},
			testSuiteId
		);

		const collection = response.data || response;

		expect(collection).toBeDefined();
		expect(collection.collection).toBe('cidade');

		logger.info('✓ Coleção cidade criada');
	});

	test('Deve ter criado a coleção bairro', async () => {
		const response = await dockerHttpRequest(
			'GET',
			'/collections/bairro',
			undefined,
			{
				Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
			},
			testSuiteId
		);

		const collection = response.data || response;

		expect(collection).toBeDefined();
		expect(collection.collection).toBe('bairro');

		logger.info('✓ Coleção bairro criada');
	});

	test('Deve ter criado a coleção endereco_br', async () => {
		const response = await dockerHttpRequest(
			'GET',
			'/collections/endereco_br',
			undefined,
			{
				Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
			},
			testSuiteId
		);

		const collection = response.data || response;

		expect(collection).toBeDefined();
		expect(collection.collection).toBe('endereco_br');
		expect(collection.meta.icon).toBe('location_on');

		logger.info('✓ Coleção endereco_br criada');
	});

	test('Deve ter criado a coleção extension_endereco_br (pasta grupo)', async () => {
		const response = await dockerHttpRequest(
			'GET',
			'/collections/extension_endereco_br',
			undefined,
			{
				Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
			},
			testSuiteId
		);

		const collection = response.data || response;

		expect(collection).toBeDefined();
		expect(collection.collection).toBe('extension_endereco_br');
		expect(collection.meta.icon).toBe('folder');

		logger.info('✓ Pasta grupo extension_endereco_br criada');
	});

	test('Deve ter criado todos os campos necessários', async () => {
		const response = await dockerHttpRequest(
			'GET',
			'/fields/pais',
			undefined,
			{
				Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
			},
			testSuiteId
		);

		const fields = response.data || response;
		const fieldNames = fields.map((f: Field) => f.field);

		// Verificar campos principais da coleção pais
		expect(fieldNames).toContain('id');
		expect(fieldNames).toContain('status');
		expect(fieldNames).toContain('nome');
		expect(fieldNames).toContain('sigla');
		expect(fieldNames).toContain('estados');

		logger.info('✓ Campos da coleção pais criados corretamente');
	});

	test('Deve ter criado as relações entre coleções', async () => {
		const response = await getRelations(testSuiteId);

		const relations = response.data || response;

		// Verificar relação estado -> pais
		const estadoPaisRelation = relations.find(
			(r: Relation) =>
				r.collection === 'estado' && r.field === 'pais' && r.related_collection === 'pais'
		);

		expect(estadoPaisRelation, 'Relação estado.pais -> pais deveria existir').toBeDefined();

		// Verificar relação cidade -> estado
		const cidadeEstadoRelation = relations.find(
			(r: Relation) =>
				r.collection === 'cidade' && r.field === 'estado' && r.related_collection === 'estado'
		);

		expect(cidadeEstadoRelation, 'Relação cidade.estado -> estado deveria existir').toBeDefined();

		// Verificar relação bairro -> cidade
		const bairroCidadeRelation = relations.find(
			(r: Relation) =>
				r.collection === 'bairro' && r.field === 'cidade' && r.related_collection === 'cidade'
		);

		expect(bairroCidadeRelation, 'Relação bairro.cidade -> cidade deveria existir').toBeDefined();

		// Verificar relação endereco_br -> bairro
		const enderecoBairroRelation = relations.find(
			(r: Relation) =>
				r.collection === 'endereco_br' && r.field === 'bairro' && r.related_collection === 'bairro'
		);

		expect(
			enderecoBairroRelation,
			'Relação endereco_br.bairro -> bairro deveria existir'
		).toBeDefined();

		logger.info('✓ Todas as relações foram criadas corretamente');
	});

	test('Deve ter populado dados iniciais - Brasil', async () => {
		const response = await listItems('pais', testSuiteId);

		const paises = response.data || response;

		// Verificar se o Brasil foi criado
		const brasil = paises.find((p: { sigla: string; nome: string }) => p.sigla === 'BRA');
		expect(brasil, 'País Brasil (BRA) deveria ter sido criado').toBeDefined();
		expect(brasil.nome).toBe('Brasil');

		logger.info('✓ País Brasil foi criado com sucesso');
	});

	test('Deve ter populado dados iniciais - Estados brasileiros', async () => {
		const response = await listItems('estado', testSuiteId);

		const estados = response.data || response;

		// Verificar quantidade de estados
		const expectedEstadosCount = seedData[0].estados.length;

		expect(estados.length, `Deveria ter ${expectedEstadosCount} estados`).toBeGreaterThanOrEqual(
			expectedEstadosCount
		);

		// Verificar alguns estados específicos
		const sp = estados.find(
			(e: { sigla: string; nome: string; codigo_ibge: string }) => e.sigla === 'SP'
		);

		expect(sp, 'Estado São Paulo (SP) deveria existir').toBeDefined();
		expect(sp.nome).toBe('São Paulo');
		expect(sp.codigo_ibge).toBe('35');

		const rj = estados.find(
			(e: { sigla: string; nome: string; codigo_ibge: string }) => e.sigla === 'RJ'
		);

		expect(rj, 'Estado Rio de Janeiro (RJ) deveria existir').toBeDefined();
		expect(rj.nome).toBe('Rio de Janeiro');
		expect(rj.codigo_ibge).toBe('33');

		logger.info(`✓ ${estados.length} estados brasileiros foram criados com sucesso`);
	});

	test('Coleções devem estar prontas para receber dados', async () => {
		const response = await dockerHttpRequest(
			'GET',
			'/collections/endereco_br',
			undefined,
			{
				Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
			},
			testSuiteId
		);

		const collection = response.data || response;
		expect(collection).toBeDefined();
		expect(collection.collection).toBe('endereco_br');

		logger.info('✓ Coleção endereco_br existe e está acessível');
	});

	test('Deve registrar mensagens de conclusão do setup', async () => {
		// Este teste verifica se o hook foi executado
		// Como o hook roda no servidor Directus, verificamos indiretamente
		// através da existência das coleções
		const response = await getCollections(testSuiteId);

		const collections = response.data || response;
		const expectedCollections = schema.collections.map((c: { collection: string }) => c.collection);

		const createdCount = expectedCollections.filter((name: string) =>
			collections.find((c: Collection) => c.collection === name)
		).length;

		expect(createdCount).toBe(expectedCollections.length);

		logger.info(`✓ Hook criou com sucesso ${createdCount}/${expectedCollections.length} coleções`);
	});

	test('Campos de geolocalização devem estar configurados', async () => {
		const response = await dockerHttpRequest(
			'GET',
			'/fields/endereco_br',
			undefined,
			{
				Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
			},
			testSuiteId
		);

		const fields = response.data || response;
		const fieldNames = fields.map((f: Field) => f.field);

		// Verificar campo de localização
		expect(fieldNames).toContain('localizacao');

		const localizacaoField = fields.find((f: Field) => f.field === 'localizacao');
		expect(localizacaoField.type).toBe('geometry.Point');

		logger.info('✓ Campo de geolocalização configurado corretamente');
	});

	test('Campos de pesquisa CEP devem estar configurados', async () => {
		const response = await dockerHttpRequest(
			'GET',
			'/fields/endereco_br',
			undefined,
			{
				Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
			},
			testSuiteId
		);

		const fields = response.data || response;
		const fieldNames = fields.map((f: Field) => f.field);

		// Verificar campos relacionados a CEP
		expect(fieldNames).toContain('pesquisa_cep');
		expect(fieldNames).toContain('cep');
		expect(fieldNames).toContain('logradouro');

		logger.info('✓ Campos de pesquisa CEP configurados corretamente');
	});
});
