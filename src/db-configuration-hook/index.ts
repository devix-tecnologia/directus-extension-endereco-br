import {
  defineHook,
  readInnerFile,
  ItemsService,
  Collection,
  Field,
  Relation,
  SchemaOverview,
} from '../utils/DirectusImports.js';

interface ConfiguracaoSchema {
  collections?: Collection | Collection[];
  fields?: Field | Field[];
  relations?: Relation | Relation[];
}

// Interface para erros específicos do Directus
interface DirectusError extends Error {
  code?: string;
  status?: number;
  type?: string;
}

export default defineHook(({ init }, { services, database, getSchema }) => {
  const { CollectionsService, RelationsService } = services;

  init('routes.custom.after', async () => {
    try {
      const configuracaoSchema = JSON.parse(
        readInnerFile('state.json').toString()
      ) as ConfiguracaoSchema;
      const esquema = await getSchema();

      // Processa as coleções, se existirem
      if (configuracaoSchema.collections) {
        await processarColecoes(configuracaoSchema, esquema);
      }

      // Processa as relações, se existirem
      if (configuracaoSchema.relations) {
        await processarRelacoes(configuracaoSchema, esquema);
      }

      // Cadastra dados iniciais, se necessário
      await cadastrarDadosIniciais(esquema);
    } catch (erro) {
      console.error('Erro no hook de inicialização de estado:', erro);
    }
  });

  /**
   * Verifica se um erro é do tipo "não encontrado" ou "sem permissão"
   */
  function isNotFoundOrForbiddenError(erro: unknown): boolean {
    if (erro instanceof Error) {
      const directusError = erro as DirectusError;
      // Verifica o código do erro ou status HTTP se disponível
      if (directusError.code === 'FORBIDDEN' || directusError.status === 403) {
        return true;
      }
      if (directusError.code === 'NOT_FOUND' || directusError.status === 404) {
        return true;
      }

      // Como fallback, podemos verificar a mensagem, mas apenas para casos específicos
      if (
        directusError.message &&
        (directusError.message.includes('permission') ||
          directusError.message.includes('not found') ||
          directusError.message.includes('does not exist'))
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Processa as coleções do arquivo de configuração
   */
  async function processarColecoes(
    config: ConfiguracaoSchema,
    esquema: SchemaOverview
  ): Promise<void> {
    const servicoColecoes = new CollectionsService({
      knex: database,
      schema: esquema,
    });

    const colecoes = normalizarArray(config.collections);

    // Ordena coleções para garantir que pastas sejam criadas antes das coleções contidas
    const colecoesComGrupo = colecoes.filter((col) => col.meta?.group !== null);
    const colecoesSemGrupo = colecoes.filter((col) => col.meta?.group == null);
    const colecoesOrdenadas = [...colecoesSemGrupo, ...colecoesComGrupo];

    for (const colecao of colecoesOrdenadas) {
      try {
        // Tenta verificar se a coleção já existe
        await servicoColecoes.readOne(colecao.collection);
        console.log(`Coleção ${colecao.collection} já existe.`);
      } catch (erro: unknown) {
        // Se o erro for de permissão ou não encontrado, criamos a coleção
        if (isNotFoundOrForbiddenError(erro)) {
          try {
            // Obtém os campos para esta coleção
            const campos = normalizarArray(config.fields).filter(
              (campo) => campo.collection === colecao.collection
            );

            // Cria a coleção com seus campos
            await servicoColecoes.createOne(
              { ...colecao, fields: campos },
              { autoPurgeCache: true, autoPurgeSystemCache: true }
            );
            console.log(`Coleção ${colecao.collection} criada com sucesso.`);
          } catch (erroCreate) {
            console.error(`Erro ao criar coleção ${colecao.collection}:`, erroCreate);
            throw erroCreate;
          }
        } else {
          // Para outros tipos de erro, simplesmente relançamos
          console.error(`Erro ao verificar coleção ${colecao.collection}:`, erro);
          throw erro;
        }
      }
    }
  }

  /**
   * Processa as relações do arquivo de configuração
   */
  async function processarRelacoes(
    config: ConfiguracaoSchema,
    _esquema: SchemaOverview
  ): Promise<void> {
    const servicoRelacoes = new RelationsService({
      knex: database,
      schema: await getSchema({ database }),
    });

    const relacoes = normalizarArray(config.relations);

    for (const relacao of relacoes) {
      try {
        // Tenta verificar se a relação já existe
        await servicoRelacoes.readOne(relacao.collection, relacao.field);
        console.log(`Relação ${relacao.collection}.${relacao.field} já existe.`);
      } catch (erro: unknown) {
        // Se o erro for de permissão ou não encontrado, criamos a relação
        if (isNotFoundOrForbiddenError(erro)) {
          try {
            await servicoRelacoes.createOne(relacao, {
              autoPurgeCache: true,
              autoPurgeSystemCache: true,
            });
            console.log(`Relação ${relacao.collection}.${relacao.field} criada com sucesso.`);
          } catch (erroCreate) {
            console.error(
              `Erro ao criar relação ${relacao.collection}.${relacao.field}:`,
              erroCreate
            );
            throw erroCreate;
          }
        } else {
          // Para outros tipos de erro, simplesmente relançamos
          console.error(`Erro ao verificar relação ${relacao.collection}.${relacao.field}:`, erro);
          throw erro;
        }
      }
    }
  }

  /**
   * Cadastra dados iniciais se necessário
   */
  async function cadastrarDadosIniciais(esquema: SchemaOverview): Promise<void> {
    const servicoPais = new ItemsService('pais', {
      knex: database,
      schema: esquema,
    });

    try {
      const itens = await servicoPais.readByQuery({
        fields: ['id'],
        limit: 1, // Otimização: só precisamos saber se existe pelo menos um registro
      });

      // Apenas cadastra se não houver registros
      if (itens.length === 0) {
        const dadosIniciais = JSON.parse(readInnerFile('seed.json').toString());
        await servicoPais.createMany(dadosIniciais);
        console.log('Dados iniciais de países cadastrados com sucesso.');
      } else {
        console.log('Dados de países já existem, pulando cadastro inicial.');
      }
    } catch (erro) {
      console.error('Erro ao verificar ou cadastrar dados iniciais:', erro);
      throw erro;
    }
  }

  /**
   * Função auxiliar para normalizar dados em arrays
   */
  function normalizarArray<T>(dados: T | T[] | undefined): T[] {
    if (!dados) return [];
    return Array.isArray(dados) ? dados : [dados];
  }
});
