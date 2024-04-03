import { defineHook } from '@directus/extensions-sdk';
import { readInnerFile } from '../utils/files';
import { ItemsService } from '../utils/DirectusImports';

export default defineHook(({ init }, { services, database, getSchema }) => {
    const { CollectionsService, RelationsService, ItemsService } = services;
    init('routes.custom.after', async () => {
        const directusState = JSON.parse(readInnerFile('state.json').toString())
        if (directusState.collections) {
            const collectionsService = new CollectionsService({ knex: database, schema: await getSchema() })
            const collections = (Array.isArray(directusState.collections) ? directusState.collections : [directusState.collections])

            // Temos que inserir primeiro as pastas e depois as colecoes que existem dentro da pasta
            // se nao ocorre erro de foreign key
            const collections_with_group = collections.filter(col => col.meta.group !== null)
            const collections_without_group = collections.filter(col => col.meta.group == null)
            const sorted_collections = [...collections_without_group, ...collections_with_group];

            for (const collection of sorted_collections) {
                try {
                    await collectionsService.readOne(collection.collection)
                } catch (e: any) {
                    if (e?.message !== "You don't have permission to access this.") throw e
                    const fields = ((Array.isArray(directusState.fields) ?
                        directusState.fields :
                        [directusState.fields]) as Array<{ collection: string, field: string }>)
                        .filter(field => field.collection == collection.collection)
                    await collectionsService.createOne({ ...collection, fields }, { autoPurgeCache: true, autoPurgeSystemCache: true })
                }
            }

        }
        if (directusState.relations) {
            const relationsService = new RelationsService({ knex: database, schema: await getSchema({ database: database, bypassCache: true }) })
            const relations = (Array.isArray(directusState.relations) ? directusState.relations : [directusState.relations])
            for (const relation of relations) {
                try {
                    await relationsService.readOne(relation.collection, relation.field)
                } catch (e: any) {
                    if (e?.message !== "You don't have permission to access this.") throw e

                    await relationsService.createOne(relation, { autoPurgeCache: true, autoPurgeSystemCache: true })
                }
            }
        }

        const paisService: ItemsService = new ItemsService(
            'pais',
            { knex: database, schema: await getSchema() },
        );
        const items = await paisService.readByQuery({
            fields: ['id'],
        })
        if (items.length == 0) {
            const seed = JSON.parse(readInnerFile('seed.json').toString())
            await paisService.createMany(seed)
        }
    })
})