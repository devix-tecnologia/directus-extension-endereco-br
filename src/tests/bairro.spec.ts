import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BairroService } from '../services/bairro.js';
import type { ApiExtensionContext, AbstractServiceOptions } from '../utils/DirectusImports.js';

describe('BairroService Unit Tests', () => {
	let bairroService: BairroService;
	let mockCreateOne: ReturnType<typeof vi.fn>;
	let mockReadByQueryCidade: ReturnType<typeof vi.fn>;
	let mockReadByQueryEstado: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		// Criar mocks das funções
		mockCreateOne = vi.fn();
		mockReadByQueryCidade = vi.fn();
		mockReadByQueryEstado = vi.fn();

		// Mocks dos serviços
		const mockItemsService = {
			createOne: mockCreateOne,
		};

		const mockCidadeService = {
			readByQuery: mockReadByQueryCidade,
		};

		const mockEstadoService = {
			readByQuery: mockReadByQueryEstado,
		};

		const ctx: ApiExtensionContext = {
			services: {
				ItemsService: vi.fn((collection: string) => {
					if (collection === 'bairro') return mockItemsService;
					if (collection === 'cidade') return mockCidadeService;
					if (collection === 'estado') return mockEstadoService;
				}),
			},
		} as unknown as ApiExtensionContext;

		const opts: AbstractServiceOptions = {} as AbstractServiceOptions;

		bairroService = new BairroService(ctx, opts);
	});

	test('cadastrarBairroNovo deve retornar id do bairro', async () => {
		// Retornos corretos
		mockReadByQueryCidade.mockResolvedValue([{ id: 'cidade123' }]);
		mockReadByQueryEstado.mockResolvedValue([{ id: 'estado123' }]);

		// Mock de criação do bairro
		mockCreateOne.mockResolvedValue('bairro123');

		const id = await bairroService.cadastrarBairroNovo('Centro', '3509502', 'Campinas', 'SP');

		expect(id).toBe('bairro123');

		// Quando a cidade já existe, passa apenas o ID
		expect(mockCreateOne).toHaveBeenCalledWith({
			nome: 'Centro',
			cidade: 'cidade123',
		});
	});

	test('cadastrarBairroNovo deve criar cidade quando não existe', async () => {
		// Cidade não encontrada
		mockReadByQueryCidade.mockResolvedValue([]);
		mockReadByQueryEstado.mockResolvedValue([{ id: 'estado123' }]);

		// Mock de criação do bairro
		mockCreateOne.mockResolvedValue('bairro456');

		const id = await bairroService.cadastrarBairroNovo('Vila Nova', '3509502', 'Campinas', 'SP');

		expect(id).toBe('bairro456');

		// Quando a cidade não existe, cria com objeto completo
		expect(mockCreateOne).toHaveBeenCalledWith({
			nome: 'Vila Nova',
			cidade: {
				nome: 'Campinas',
				codigo_ibge: '3509502',
				estado: 'estado123',
			},
		});
	});

	test('obterIdBairroPorEndereco encontra bairro corretamente', () => {
		const bairrosMock = [
			{
				id: 'b1',
				nome: 'centro',
				cidade: {
					id: 'cidade1',
					nome: 'campinas',
					codigo_ibge: '3509502',
					estado: { id: 'estado1', nome: 'sao paulo', sigla: 'sp' },
				},
			},
		];

		const id = bairroService.obterIdBairroPorEndereco('Centro', 'Campinas', 'SP', bairrosMock);
		expect(id).toBe('b1');
	});
});
