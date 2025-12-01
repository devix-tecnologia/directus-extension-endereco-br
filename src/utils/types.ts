import { PrimaryKey } from './DirectusImports.js';

export type Bairro = {
	id: string;
	nome: string;
	cidade: {
		id: string;
		nome: string;
		codigo_ibge: string;
		estado: { id: string; nome: string; sigla: string };
	};
};

export type Cidade = Bairro['cidade'];
export type Estado = Cidade['estado'];

export type Endereco = {
	cep: string;
	complemento: string;
	numero: string;
	logradouro: string;
	bairro: PrimaryKey | Bairro;
	localizacao: {
		coordinates: number[];
		type: 'Point';
	};
};

export type EnderecoComPesquisa = Endereco & {
	pesquisa_cep?: string;
};
