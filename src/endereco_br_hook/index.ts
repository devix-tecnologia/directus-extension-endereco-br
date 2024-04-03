import { defineHook } from '@directus/extensions-sdk';
import { EventContext } from '@directus/types';
import { BairroService } from '../services/bairro';
import { AbstractServiceOptions, ApiExtensionContext, ItemsService } from '../utils/DirectusImports';
import { atualizarCoordenadasEndereco, processaPesquisaCep } from '../utils/hook';
import { Endereco } from '../utils/types';


export default defineHook(({ filter, action }, apiExtensionContext) => {
	const geolocationProvider = process.env.GEOLOCATION_PROVIDER as 'google' | 'mapbox';
	const geolocationAuthToken: string | undefined = process.env.GEOLOCATION_AUTH_TOKEN;

	filter<Endereco>('endereco_br.items.create', async (input, _, context) => {
		const bairroService = new BairroService(apiExtensionContext, {
			schema: context.schema!!,
			knex: context.database,
		});
		const inputProcessado = await processaPesquisaCep(input, bairroService);
		return inputProcessado;
	});

	filter<Endereco>('endereco_br.items.update', async (input, _, context) => {
		const bairroService = new BairroService(apiExtensionContext, {
			schema: context.schema!!,
			knex: context.database,
		});
		const inputProcessado = await processaPesquisaCep(input, bairroService);
		return inputProcessado;
	});

	const getEnderecoService = (apiExtensionContext: ApiExtensionContext, context: EventContext) => {
		const opts = { schema: context.schema!!, knex: context.database } satisfies AbstractServiceOptions;
		const enderecoService: ItemsService<Endereco> = new apiExtensionContext.services.ItemsService(
			'endereco_br',
			opts,
		);
		return enderecoService;
	};


	action('endereco_br.items.create', async (event, context) => {
		if (geolocationAuthToken == undefined) {
			apiExtensionContext.logger.warn("Variável de ambiente GEOLOCATION_AUTH_TOKEN não definida!")
			return
		}
		const enderecoId = event.key;
		apiExtensionContext.logger.info(`Atualizando coordenadas para o endereco: ${enderecoId}`);

		const enderecoService = getEnderecoService(apiExtensionContext, context);
		await atualizarCoordenadasEndereco(enderecoId, enderecoService, geolocationProvider, geolocationAuthToken);
	});

	action('endereco_br.items.update', async (event, context) => {
		if ('localizacao' in event.payload) {
			// Prevent infinite loop on location update
			return;
		}

		if (geolocationAuthToken == undefined) {
			apiExtensionContext.logger.warn("Variável de ambiente GEOLOCATION_AUTH_TOKEN não definida!")
			return
		}

		const enderecoIds = Array.isArray(event.keys) ? event.keys : [event.keys];
		apiExtensionContext.logger.info(`Atualizando coordenadas para os enderecos: ${enderecoIds}`);

		const enderecoService = getEnderecoService(apiExtensionContext, context);

		enderecoIds.forEach(async (enderecoId) => {
			await atualizarCoordenadasEndereco(enderecoId, enderecoService, geolocationProvider, geolocationAuthToken);
		});
	});
});