// Versões do Directus usadas nos testes de integração.
//
// Política Devix: o Directus nunca é testado nem declarado em versão >= 12
// (a v12 muda a licença). Por isso não se usa a tag `latest` da imagem Docker,
// que já aponta para a 12.x, e toda versão passa por `assertDirectusVersion`.

// Teto explícito: maior major do Directus aceito nos testes.
export const DIRECTUS_MAX_MAJOR = 11;

// Versão padrão dos testes (última 11.x validada).
export const DEFAULT_DIRECTUS_VERSION = '11.17.4';

// Matriz usada por `pnpm test:all-versions`.
export const directusVersions = [
	'10.4.2', // Primeira imagem Docker que atende o host ^10.3.4 (não há 10.3.4 publicada)
	'10.13.4', // Última 10.x
	'11.0.0', // Primeira 11.x
	DEFAULT_DIRECTUS_VERSION, // Última 11.x
];

// Versões que não devem ser testadas.
export const blockedDirectusVersions = [];

/**
 * Garante que a versão respeita o teto do Directus (< 12) e não é uma tag móvel.
 * @param {string} version
 * @returns {string}
 */
export function assertDirectusVersion(version) {
	const match = /^(\d+)\.\d+\.\d+$/.exec(version);

	if (!match) {
		throw new Error(
			`Versão do Directus inválida para testes: "${version}". Use uma versão exata (ex.: ${DEFAULT_DIRECTUS_VERSION}); tags como "latest" apontam para a 12.x.`
		);
	}

	if (Number(match[1]) > DIRECTUS_MAX_MAJOR) {
		throw new Error(
			`Directus ${version} não é suportado: o teto é o Directus ${DIRECTUS_MAX_MAJOR}.x (a v12 muda a licença).`
		);
	}

	return version;
}

/**
 * Versão do Directus a testar: DIRECTUS_TEST_VERSION ou a padrão.
 * @returns {string}
 */
export function getDirectusTestVersion() {
	return assertDirectusVersion(process.env.DIRECTUS_TEST_VERSION || DEFAULT_DIRECTUS_VERSION);
}
