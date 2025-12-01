import { AbstractServiceOptions, ApiExtensionContext } from '../utils/DirectusImports.js';
import type { Bairro } from '../utils/types.js';

export class BairroService {
	ctx: ApiExtensionContext;
	opts: AbstractServiceOptions;
	bairroService: any;
	cidadeService: any;
	estadoService: any;

	constructor(ctx: ApiExtensionContext, opts: AbstractServiceOptions) {
		this.ctx = ctx;
		this.opts = opts;
		this.bairroService = new this.ctx.services.ItemsService('bairro', this.opts);
		this.cidadeService = new this.ctx.services.ItemsService('cidade', this.opts);
		this.estadoService = new this.ctx.services.ItemsService('estado', this.opts);
	}

	lowerCaseSemAcentos(nome: string) {
		// Remove acentos e transforma em lowercase
		return nome
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.toLowerCase();
	}

	async obterBairrosPorCodigoIBGE(codigo_ibge: string): Promise<Bairro[]> {
		const bairros = await this.bairroService.readByQuery({
			fields: [
				'id',
				'nome',
				'cidade.id',
				'cidade.nome',
				'cidade.codigo_ibge',
				'cidade.estado.id',
				'cidade.estado.nome',
				'cidade.estado.sigla',
			],
			filter: {
				cidade: {
					codigo_ibge: {
						_eq: codigo_ibge,
					},
				},
			},
			limit: -1,
		});

		bairros.forEach((bairro) => {
			bairro.nome = this.lowerCaseSemAcentos(bairro.nome);
			bairro.cidade.nome = this.lowerCaseSemAcentos(bairro.cidade.nome);
			bairro.cidade.estado.nome = this.lowerCaseSemAcentos(bairro.cidade.estado.nome);
			bairro.cidade.estado.sigla = this.lowerCaseSemAcentos(bairro.cidade.estado.sigla);
		});

		return bairros;
	}

	obterIdBairroPorEndereco(bairro: string, cidade: string, estado: string, bairros: Bairro[]) {
		const [bairroLimpo, cidadeLimpa, estadoLimpo] = [bairro, cidade, estado].map(
			this.lowerCaseSemAcentos
		);

		const bairroEncontrado = bairros.find(
			(b) =>
				b.nome === bairroLimpo &&
				(b.cidade.nome === cidadeLimpa || b.cidade.codigo_ibge === cidadeLimpa) &&
				(b.cidade.estado.nome === estadoLimpo || b.cidade.estado.sigla === estadoLimpo)
		);

		return bairroEncontrado ? bairroEncontrado.id : null;
	}

	async obterIdCidadePorCodigoIBGE(codigoIBGE: string) {
		const query = {
			filter: {
				codigo_ibge: {
					_in: [codigoIBGE],
				},
			},
			fields: ['id'],
			limit: 1,
		};

		const cidade = await this.cidadeService.readByQuery(query);
		const cidade_id = cidade.length > 0 ? cidade[0]?.id : null;
		return cidade_id;
	}

	async obterIdEstadoPorSigla(sigla: string) {
		const query = {
			filter: {
				sigla: {
					_in: [sigla],
				},
			},
			fields: ['id'],
			limit: 1,
		};

		const estado = await this.estadoService.readByQuery(query);
		const estado_id = estado.length > 0 ? estado[0]?.id : null;
		return estado_id;
	}

	async cadastrarBairroNovo(bairro: string, codigo_ibge: string, cidade: string, estado: string) {
		const idCidade = await this.obterIdCidadePorCodigoIBGE(codigo_ibge);
		const idEstado = await this.obterIdEstadoPorSigla(estado);

		const criaOuAtualizaCidade = idCidade ?? {
			nome: cidade,
			codigo_ibge: codigo_ibge,
			estado: idEstado,
		};

		const idBairroNovo = await this.bairroService.createOne({
			nome: bairro,
			//@ts-ignore
			cidade: criaOuAtualizaCidade,
		});

		return idBairroNovo;
	}
}
