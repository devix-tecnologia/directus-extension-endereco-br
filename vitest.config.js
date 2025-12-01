import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		testTimeout: 600000, // 10 minutos para cada teste
		hookTimeout: 600000, // 10 minutos para hooks (beforeAll, afterAll)
		maxConcurrency: 1, // Executar 1 versão por vez para evitar conflitos de porta
		fileParallelism: false, // Desabilitar paralelismo entre arquivos de teste
		setupFiles: [],
		exclude: ['**/node_modules/**', '**/dist/**', '**/.{idea,git,cache,output,temp}/**'],
		poolOptions: {
			threads: {
				singleThread: true, // Forçar single thread para evitar conflitos
				maxThreads: 1,
				minThreads: 1,
			},
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'dist/',
				'src/tests/',
				'**/*.spec.ts',
				'**/*.test.ts',
				'**/test-*.ts',
				'**/setup.ts',
			],
		},
	},
});
