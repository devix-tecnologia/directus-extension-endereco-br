// Lista de versões do Directus para testes automatizados
// Testa compatibilidade com Directus 10.x e 11.x
export const directusVersions = [
	// Directus 10.x - LTS versions
	// '10.13.3', // Latest stable 10.x

	// // Directus 11.x - Current versions
	// '11.0.0', // First major release
	// '11.10.0', // Stable mid version
	'11.17.1', // Target version
	// 'latest', // Always test latest
];

// Lista de versões bloqueadas (não serão testadas)
export const blockedDirectusVersions = ['11.17.1'];
