import axios from 'axios';

export type ViaCepResultSucesso = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
};

type ViaCepResultFalha = {
  erro: boolean;
};

export type ViaCepResult = ViaCepResultSucesso | ViaCepResultFalha;

export async function ObterDadosViaCep(cep: string) {
  const cepLimpo = String(cep).trim().replace(/\D+/g, '');
  const urlConsultaCep = `https://viacep.com.br/ws/${cepLimpo}/json/`;
  const result = await axios.get<ViaCepResult>(urlConsultaCep);
  const dados = result.data;
  if ('erro' in dados) {
    return undefined;
  }
  return dados;
}
