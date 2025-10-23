import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BairroService } from '../services/bairro.js';

describe('BairroService Unit Tests', () => {
  let bairroService: BairroService;
  let mockItemsService: any;
  let mockCidadeService: any;
  let mockEstadoService: any;

  beforeEach(() => {
    // Mocks separados
    mockItemsService = {
      createOne: vi.fn(),
    };

    mockCidadeService = {
      readByQuery: vi.fn(),
    };

    mockEstadoService = {
      readByQuery: vi.fn(),
    };

    const ctx = {
      services: {
        ItemsService: vi.fn((collection: string) => {
          if (collection === 'bairro') return mockItemsService;
          if (collection === 'cidade') return mockCidadeService;
          if (collection === 'estado') return mockEstadoService;
        }),
      },
    };

    bairroService = new BairroService(ctx as any, {} as any);
  });

  test('cadastrarBairroNovo deve retornar id do bairro', async () => {
    // Retornos corretos
    mockCidadeService.readByQuery.mockResolvedValue([{ id: 'cidade123' }]);
    mockEstadoService.readByQuery.mockResolvedValue([{ id: 'estado123' }]);

    // Mock de criação do bairro
    mockItemsService.createOne.mockResolvedValue('bairro123');

    const id = await bairroService.cadastrarBairroNovo('Centro', '3509502', 'Campinas', 'SP');

    expect(id).toBe('bairro123');

    expect(mockItemsService.createOne).toHaveBeenCalledWith({
      nome: 'Centro',
      cidade: {
        id: 'cidade123',
        estado: { id: 'estado123' },
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
