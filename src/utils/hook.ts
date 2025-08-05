import { ViaCepResultSucesso } from '../services/viacep';
import { Endereco, EnderecoComPesquisa } from './types';
import { BairroService } from '../services/bairro';
import { ItemsService } from './DirectusImports';
import { geocodingGoogle, geocodingMapbox } from '../services/geocoding';

export async function processaPesquisaCep(
  input: EnderecoComPesquisa,
  bairroService: BairroService
) {
  if (input.pesquisa_cep) {
    const dadosCep: ViaCepResultSucesso = JSON.parse(input.pesquisa_cep);
    input.cep = dadosCep.cep;
    input.logradouro = dadosCep.logradouro;

    const possiveisBairros = await bairroService.obterBairrosPorCodigoIBGE(dadosCep.ibge);
    const idBairro = bairroService.obterIdBairroPorEndereco(
      dadosCep.bairro,
      dadosCep.localidade,
      dadosCep.uf,
      possiveisBairros
    );
    // Associa ou cria o bairro novo
    if (idBairro) {
      input.bairro = idBairro;
    } else {
      const idBairroNovo = await bairroService.cadastrarBairroNovo(
        dadosCep.bairro,
        dadosCep.ibge,
        dadosCep.localidade,
        dadosCep.uf
      );
      input.bairro = idBairroNovo;
    }
  }
  return input;
}

export async function atualizarCoordenadasEndereco(
  enderecoId: string,
  enderecoService: ItemsService<Endereco>,
  provider: 'google' | 'mapbox',
  auth_token: string
) {
  const endereco = await enderecoService.readOne(enderecoId, {
    fields: [
      'id',
      'logradouro',
      'numero',
      'bairro.nome',
      'bairro.cidade.nome',
      'bairro.cidade.estado.nome',
    ],
  });
  let coordenadas: number[] | undefined = undefined;
  if (provider === 'google') {
    coordenadas = await geocodingGoogle(endereco, auth_token);
  } else {
    coordenadas = await geocodingMapbox(endereco, auth_token);
  }

  if (coordenadas) {
    enderecoService.updateOne(enderecoId, {
      localizacao: {
        coordinates: coordenadas,
        type: 'Point',
      },
    });
  }
}
