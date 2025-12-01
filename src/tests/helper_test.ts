import { dockerHttpRequest } from './setup.js';
import { logger } from './test-logger.js';

/**
 * Helper para buscar CEP via endpoint da extensão
 */
export async function pesquisarCep(cep: string, testSuiteId?: string): Promise<any> {
	const response = await dockerHttpRequest(
		'GET',
		`/pesquisa-cep/${cep}`,
		undefined,
		{
			Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
		},
		testSuiteId
	);

	if (process.env.DEBUG_TESTS) {
		logger.info('[DEBUG] Pesquisa CEP response:', JSON.stringify(response, null, 2));
	}

	return response;
}

/**
 * Helper para criar item em uma coleção
 */
export async function createItem(
	collection: string,
	data: any,
	testSuiteId?: string
): Promise<any> {
	const response = await dockerHttpRequest(
		'POST',
		`/items/${collection}`,
		data,
		{
			Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
		},
		testSuiteId
	);

	if (process.env.DEBUG_TESTS) {
		logger.info(`[DEBUG] Create ${collection} item response:`, JSON.stringify(response, null, 2));
	}

	return response;
}

/**
 * Helper para listar itens de uma coleção
 */
export async function listItems(collection: string, testSuiteId?: string): Promise<any> {
	const response = await dockerHttpRequest(
		'GET',
		`/items/${collection}`,
		undefined,
		{
			Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
		},
		testSuiteId
	);

	if (process.env.DEBUG_TESTS) {
		logger.info(`[DEBUG] List ${collection} items response:`, JSON.stringify(response, null, 2));
	}

	return response;
}

/**
 * Helper para buscar coleções
 */
export async function getCollections(testSuiteId?: string): Promise<any> {
	const response = await dockerHttpRequest(
		'GET',
		'/collections',
		undefined,
		{
			Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
		},
		testSuiteId
	);

	if (process.env.DEBUG_TESTS) {
		logger.info('[DEBUG] Collections response:', JSON.stringify(response, null, 2));
	}

	return response;
}

/**
 * Helper para buscar relações
 */
export async function getRelations(testSuiteId?: string): Promise<any> {
	const response = await dockerHttpRequest(
		'GET',
		'/relations',
		undefined,
		{
			Authorization: `Bearer ${String(process.env.DIRECTUS_ACCESS_TOKEN)}`,
		},
		testSuiteId
	);

	if (process.env.DEBUG_TESTS) {
		logger.info('[DEBUG] Relations response:', JSON.stringify(response, null, 2));
	}

	return response;
}
