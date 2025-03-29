import { defineEndpoint } from '@directus/extensions-sdk';
import { ObterDadosViaCep } from '../services/viacep';

export default defineEndpoint((router, context) => {
  router.get('/:cep', async (req, res) => {
    const cep = req.params.cep;
    const cepLimpo = String(cep).trim().replace(/\D+/g, '');

    context.logger.info(`Requisitando informações de endereço para o CEP: ${cepLimpo}`);

    if (cepLimpo.length !== 8) {
      res.status(400);
      res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
      );
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.send('Valor de CEP invalido.');
      return;
    }

    try {
      const dados = await ObterDadosViaCep(cepLimpo);
      if (dados === undefined) {
        res.status(200);
        res.json([{ text: 'Valor de cep inválido', value: undefined }]);
        return;
      }
      const displayText = `${dados.logradouro} - ${dados.bairro} - ${dados.localidade} - ${dados.uf}`;
      res.status(200);
      res.json([{ text: displayText, value: JSON.stringify(dados) }]);
    } catch (error) {
      context.logger.error(error);

      res.status(200);
      res.json([
        { text: 'Serviço indisponível no momento. Tente novamente mais tarde.', value: undefined },
      ]);
    }
  });
});
