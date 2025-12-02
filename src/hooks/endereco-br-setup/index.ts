import { defineHook } from '@directus/extensions-sdk';
import schema from '../../../files/state.json' with { type: 'json' };
import seedData from '../../../files/seed.json' with { type: 'json' };

interface SetupContext {
	services: any;
	logger: any;
	database: any;
	getSchema: any;
}

export default defineHook(
	(
		{ action, init }: { action: any; init: any },
		{
			services,
			logger,
			database,
			getSchema,
		}: { services: any; logger: any; database: any; getSchema: any }
	) => {
		logger.info('[Endereço BR Extension] 🔌 Hook registrado, aguardando eventos...');

		// Hook no evento de inicialização - executa após as rotas serem registradas
		init('routes.after', async () => {
			logger.info('[Endereço BR Extension] 🚀 Evento routes.after acionado, executando setup...');

			try {
				await configurarColecoes({ services, logger, database, getSchema });
			} catch (error: any) {
				logger.error(`[Endereço BR Extension] Erro durante setup inicial: ${error.message}`);
			}
		});

		// Hook no evento de start do servidor
		action('server.start', async () => {
			logger.info('[Endereço BR Extension] 🚀 Evento server.start acionado, executando setup...');

			try {
				await configurarColecoes({ services, logger, database, getSchema });
			} catch (error: any) {
				logger.error(`[Endereço BR Extension] Erro durante setup inicial: ${error.message}`);
			}
		});

		// Hook para quando a extensão é instalada/atualizada
		action('extensions.install', async ({ extension }: any) => {
			if (
				extension?.includes('endereco-br') ||
				extension?.includes('@devix-tecnologia/directus-extension-endereco-br')
			) {
				logger.info('[Endereço BR Extension] Extensão instalada, configurando coleções...');

				try {
					await configurarColecoes({ services, logger, database, getSchema });
				} catch (error: any) {
					logger.error(`[Endereço BR Extension] Erro durante instalação: ${error.message}`);
				}
			}
		});

		// Hook para quando extensões são recarregadas
		action('extensions.reload', async () => {
			logger.info('[Endereço BR Extension] Verificando configuração das coleções...');

			try {
				await verificarColecoes({ logger, services, database, getSchema });
			} catch (error: any) {
				logger.warn(`[Endereço BR Extension] Erro ao verificar coleções: ${error.message}`);
			}
		});
	}
);

// Função para verificar se as coleções existem
async function verificarColecoes({ logger, services, getSchema }: SetupContext) {
	const { CollectionsService } = services;
	const currentSchema = await getSchema();

	const collectionsService = new CollectionsService({
		schema: currentSchema,
		knex: null as any,
	});

	try {
		const todasColecoes = await collectionsService.readByQuery();
		const nomesColecoesExistentes = new Set(todasColecoes.map((c: any) => c.collection));

		const nossasColecoes = schema.collections.map((c: any) => c.collection);
		const existentes = nossasColecoes.filter((c) => nomesColecoesExistentes.has(c)).length;
		const total = nossasColecoes.length;

		if (existentes === total) {
			logger.info(
				`[Endereço BR Extension] Todas as ${total} coleções estão configuradas corretamente ✓`
			);
		} else {
			logger.warn(
				`[Endereço BR Extension] ${existentes}/${total} coleções encontradas. Execute setup se necessário.`
			);
		}
	} catch (error: any) {
		logger.warn(`[Endereço BR Extension] Erro ao verificar coleções: ${error.message}`);
	}
}

// Função principal para criar coleções - Baseada na lógica do schema-management-module
async function configurarColecoes({ services, logger, database, getSchema }: SetupContext) {
	const { CollectionsService, FieldsService, RelationsService } = services;

	logger.info('[Endereço BR Extension] Iniciando configuração das coleções...');

	// Obter schema atual
	const currentSchema = await getSchema();

	// Criar serviços
	const collectionsService = new CollectionsService({
		schema: currentSchema,
		knex: database,
	});

	// Obter coleções existentes
	let todasColecoes: any[] = [];

	try {
		todasColecoes = await collectionsService.readByQuery();
	} catch (error: any) {
		logger.warn(`[Endereço BR Extension] Erro ao listar coleções: ${error.message}`);
		todasColecoes = [];
	}

	const nomesColecoesExistentes = new Set(todasColecoes.map((c: any) => c.collection));

	let colecoescriaadas = 0;
	let camposCriados = 0;
	let relacoesCriadas = 0;

	const collections = schema.collections || [];
	const fields = schema.fields || [];
	const relations = schema.relations || [];

	logger.info(
		`[Endereço BR Extension] 📋 Coleções a processar: ${collections.map((c: any) => c.collection).join(', ')}`
	);

	// PASSO 1: Importar coleções recursivamente (tratando dependências de pastas)
	try {
		const colecoesImportadas: string[] = [];
		let ultimoTamanho: number | null = null;

		// Continuar loop até que não seja possível importar mais coleções
		while (colecoesImportadas.length !== ultimoTamanho) {
			ultimoTamanho = colecoesImportadas.length;

			for (const collection of collections) {
				// Pular se já foi importada
				if (colecoesImportadas.includes(collection.collection)) {
					continue;
				}

				// Verificar se a coleção tem dependência de grupo (pasta)
				if (collection.meta?.group) {
					const { group } = collection.meta;

					// Pular se o grupo não existe no schema e não existe no banco
					if (
						!collections.some((c: any) => c.collection === group) &&
						!nomesColecoesExistentes.has(group)
					) {
						colecoesImportadas.push(collection.collection);

						logger.warn(
							`[Endereço BR Extension] ⚠️  Pulando coleção "${collection.collection}" porque seu grupo "${group}" não existe`
						);

						continue;
					}

					// Aguardar o grupo ser importado primeiro
					if (!colecoesImportadas.includes(group) && !nomesColecoesExistentes.has(group)) {
						continue;
					}
				}

				// Importar coleção se não existir
				if (!nomesColecoesExistentes.has(collection.collection)) {
					try {
						logger.info(`[Endereço BR Extension] 🔨 Criando coleção: ${collection.collection}`);

						// Obter campos para esta coleção
						const camposColecao = fields.filter((f: any) => f.collection === collection.collection);

						// Criar coleção COM campos (previne auto-criação do campo id)
						await collectionsService.createOne({
							collection: collection.collection,
							meta: collection.meta,
							schema: collection.schema || null,
							fields: camposColecao.map((field: any) => {
								const fieldData: any = {
									field: field.field,
									type: field.type,
									meta: field.meta,
								};

								// Adicionar schema apenas se não for null (campos alias não têm schema)
								if (field.schema !== null) {
									fieldData.schema = field.schema;
								}

								return fieldData;
							}),
						});

						colecoescriaadas++;
						camposCriados += camposColecao.length;

						logger.info(
							`[Endereço BR Extension] ✅ Coleção ${collection.collection} criada com ${camposColecao.length} campo(s)`
						);
					} catch (error: any) {
						logger.error(
							`[Endereço BR Extension] ❌ Erro ao criar coleção ${collection.collection}: ${error.message}`
						);
					}
				} else {
					logger.info(`[Endereço BR Extension] ⏭️  Coleção ${collection.collection} já existe`);
				}

				colecoesImportadas.push(collection.collection);
			}
		}

		logger.info(
			`[Endereço BR Extension] ✅ Importadas ${colecoescriaadas} coleção(ões) com ${camposCriados} campo(s)`
		);
	} catch (error: any) {
		logger.error(
			`[Endereço BR Extension] ❌ Erro durante importação de coleções: ${error.message}`
		);
	}

	// PASSO 2: Adicionar campos faltantes às coleções existentes (modo PATCH)
	try {
		// Atualizar schema após criação das coleções
		const schemaAtualizado = await getSchema({ accountability: null, database });

		const fieldsServiceAtualizado = new FieldsService({
			schema: schemaAtualizado,
			knex: database,
		});

		for (const field of fields) {
			// Processar apenas se a coleção existe
			if (nomesColecoesExistentes.has(field.collection) || colecoescriaadas > 0) {
				try {
					// Verificar se o campo já existe
					const campoExistente = await database
						.select('*')
						.from('directus_fields')
						.where('collection', field.collection)
						.where('field', field.field)
						.first();

					if (!campoExistente) {
						logger.info(
							`[Endereço BR Extension] 🔨 Criando campo: ${field.collection}.${field.field}`
						);

						const fieldData: any = {
							field: field.field,
							type: field.type,
							meta: field.meta,
						};

						if (field.schema !== null) {
							fieldData.schema = field.schema;
						}

						await fieldsServiceAtualizado.createField(field.collection, fieldData);

						camposCriados++;

						logger.info(
							`[Endereço BR Extension] ✅ Campo ${field.collection}.${field.field} criado`
						);
					}
				} catch (error: any) {
					logger.error(
						`[Endereço BR Extension] ❌ Erro ao criar campo ${field.collection}.${field.field}: ${error.message}`
					);
				}
			}
		}

		logger.info(`[Endereço BR Extension] ✅ Total de campos criados: ${camposCriados}`);
	} catch (error: any) {
		logger.error(`[Endereço BR Extension] ❌ Erro durante importação de campos: ${error.message}`);
	}

	// PASSO 3: Importar relações
	try {
		// Atualizar schema novamente antes das relações
		const schemaAtualizado = await getSchema({ accountability: null, database });

		const relationsServiceAtualizado = new RelationsService({
			schema: schemaAtualizado,
			knex: database,
		});

		logger.info('[Endereço BR Extension] 📋 Importando relações...');

		for (const relation of relations) {
			try {
				// Verificar se a relação já existe
				const relacaoExistente = await database
					.select('*')
					.from('directus_relations')
					.where('many_collection', relation.collection)
					.where('many_field', relation.field)
					.first();

				if (relacaoExistente) {
					logger.info(
						`[Endereço BR Extension] ⏭️  Relação ${relation.collection}.${relation.field} -> ${relation.related_collection} já existe`
					);

					continue;
				}

				logger.info(
					`[Endereço BR Extension] 🔗 Criando relação: ${relation.collection}.${relation.field} -> ${relation.related_collection}`
				);

				// Criar relação usando o serviço
				await relationsServiceAtualizado.createOne({
					collection: relation.collection,
					field: relation.field,
					related_collection: relation.related_collection,
					meta: relation.meta,
					schema: relation.schema,
				});

				relacoesCriadas++;

				logger.info(
					`[Endereço BR Extension] ✅ Relação ${relation.collection}.${relation.field} -> ${relation.related_collection} criada`
				);
			} catch (error: any) {
				logger.error(
					`[Endereço BR Extension] ❌ Erro ao criar relação ${relation.collection}.${relation.field}: ${error.message}`
				);
			}
		}

		logger.info(`[Endereço BR Extension] ✅ Total de relações criadas: ${relacoesCriadas}`);
	} catch (error: any) {
		logger.error(
			`[Endereço BR Extension] ❌ Erro durante importação de relações: ${error.message}`
		);
	}

	// PASSO 4: Popular dados iniciais (seed)
	try {
		await popularDadosIniciais({ services, logger, database, getSchema });
	} catch (error: any) {
		logger.error(
			`[Endereço BR Extension] ❌ Erro durante população de dados iniciais: ${error.message}`
		);
	}

	// PASSO 5: Resumo final
	logger.info(
		`[Endereço BR Extension] 🎉 Configuração completa! Criados: ${colecoescriaadas} coleção(ões), ${camposCriados} campo(s), ${relacoesCriadas} relação(ões)`
	);

	// Forçar refresh do schema
	try {
		await getSchema({ accountability: null, database });

		logger.info('[Endereço BR Extension] ✅ Schema atualizado');
	} catch (error: any) {
		logger.warn(`[Endereço BR Extension] ⚠️  Erro ao atualizar schema: ${error.message}`);
	}
}

// Função para popular dados iniciais
async function popularDadosIniciais({ services, logger, database, getSchema }: SetupContext) {
	logger.info('[Endereço BR Extension] 🌍 Populando dados iniciais...');

	const { ItemsService } = services;

	try {
		// Verificar se as coleções existem
		const colecaoPaisExiste = await database
			.select('collection')
			.from('directus_collections')
			.where('collection', 'pais')
			.first();

		const colecaoEstadoExiste = await database
			.select('collection')
			.from('directus_collections')
			.where('collection', 'estado')
			.first();

		if (!colecaoPaisExiste || !colecaoEstadoExiste) {
			logger.warn(
				'[Endereço BR Extension] ⚠️  Coleções de país ou estado não existem, pulando população de dados'
			);

			return;
		}

		// Obter schema atual
		const currentSchema = await getSchema({ accountability: null, database });

		// Criar serviços para as coleções
		const paisService = new ItemsService('pais', {
			schema: currentSchema,
			knex: database,
		});

		const estadoService = new ItemsService('estado', {
			schema: currentSchema,
			knex: database,
		});

		let paisesInseridos = 0;
		let estadosInseridos = 0;

		// Processar dados do seed
		for (const paisData of seedData) {
			try {
				// Verificar se o país já existe
				const paisExistente = await database
					.select('*')
					.from('pais')
					.where('sigla', paisData.sigla)
					.first();

				let paisId: string;

				if (paisExistente) {
					logger.info(
						`[Endereço BR Extension] ⏭️  País ${paisData.nome} (${paisData.sigla}) já existe`
					);

					paisId = paisExistente.id;
				} else {
					// Criar país
					const novoPais = await paisService.createOne({
						nome: paisData.nome,
						sigla: paisData.sigla,
						status: 'published',
					});

					paisId = novoPais;
					paisesInseridos++;

					logger.info(
						`[Endereço BR Extension] ✅ País ${paisData.nome} (${paisData.sigla}) criado`
					);
				}

				// Processar estados do país
				if (paisData.estados && Array.isArray(paisData.estados)) {
					for (const estadoData of paisData.estados) {
						try {
							// Verificar se o estado já existe
							const estadoExistente = await database
								.select('*')
								.from('estado')
								.where('sigla', estadoData.sigla)
								.where('pais', paisId)
								.first();

							if (estadoExistente) {
								logger.info(
									`[Endereço BR Extension] ⏭️  Estado ${estadoData.nome} (${estadoData.sigla}) já existe`
								);
							} else {
								// Criar estado
								await estadoService.createOne({
									nome: estadoData.nome,
									sigla: estadoData.sigla,
									codigo_ibge: estadoData.codigo_ibge,
									pais: paisId,
									status: 'published',
								});

								estadosInseridos++;

								logger.info(
									`[Endereço BR Extension] ✅ Estado ${estadoData.nome} (${estadoData.sigla}) criado`
								);
							}
						} catch (error: any) {
							logger.error(
								`[Endereço BR Extension] ❌ Erro ao criar estado ${estadoData.sigla}: ${error.message}`
							);
						}
					}
				}
			} catch (error: any) {
				logger.error(
					`[Endereço BR Extension] ❌ Erro ao criar país ${paisData.sigla}: ${error.message}`
				);
			}
		}

		if (paisesInseridos > 0 || estadosInseridos > 0) {
			logger.info(
				`[Endereço BR Extension] ✅ Criados ${paisesInseridos} país(es) e ${estadosInseridos} estado(s)`
			);
		} else {
			logger.info('[Endereço BR Extension] ℹ️  Todos os dados iniciais já existem');
		}
	} catch (error: any) {
		logger.error(`[Endereço BR Extension] ❌ Erro ao popular dados iniciais: ${error.message}`);
	}
}
