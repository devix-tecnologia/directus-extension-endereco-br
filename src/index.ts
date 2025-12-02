// src/index.ts
export * from './db-configuration-hook/index.js';
export * from './endpoints/pesquisa-cep-endpoint/index.js';
export * from './hooks/endereco_br_hook/index.js';
export * from './hooks/endereco-br-setup/index.js';

// Export services for external use
export { BairroService } from './services/bairro.js';
export { ObterDadosViaCep } from './services/viacep.js';

// Export types for external use
export type { Bairro, Cidade, Estado, Endereco, EnderecoComPesquisa } from './utils/types.js';
