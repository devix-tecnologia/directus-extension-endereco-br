![Banner da Extensão de Endereços do Brasil para Directus](https://github.com/devix-tecnologia/directus-extension-endereco-br/raw/main/docs/Banner.png)

# Extensão do Directus para Endereços Brasileiros
> Crie, organize, pesquise e georreferencie endereços brasileiros de forma fácil e eficiente

[![Versão npm](https://img.shields.io/npm/v/directus-extension-endereco-br)](https://www.npmjs.com/package/directus-extension-endereco-br)
[![Licença](https://img.shields.io/github/license/devix-tecnologia/directus-extension-endereco-br)](https://github.com/devix-tecnologia/directus-extension-endereco-br/blob/main/LICENSE)
[![Compatível com Directus](https://img.shields.io/badge/Directus-%E2%89%A510.10-blue)](https://directus.io/)

## ✨ Funcionalidades

### 🔍 Pesquisa por CEP
Agilize o cadastro de endereços permitindo pesquisar a partir do CEP para buscar automaticamente:
- Logradouro
- Bairro
- Cidade
- Estado
- Código IBGE

### ⚙️ Configuração Automática
Toda a estrutura necessária é criada instantaneamente:
- Coleções e relacionamentos são configurados durante a instalação
- Lista completa dos estados brasileiros é inserida no banco de dados
- Interface amigável pronta para uso

### 📍 Georreferenciamento
Localize endereços precisamente:
- Armazena latitude e longitude dos endereços
- Integração com os principais provedores de geolocalização
- Visualização em mapa

## 🛠️ Configuração

### Provedores de Georreferenciamento
Configure as seguintes variáveis de ambiente para habilitar o georreferenciamento:

| Variável | Descrição | Valores Aceitos |
|----------|-----------|-----------------|
| `GEOLOCATION_PROVIDER` | Provedor de geolocalização | `'google'` ou `'mapbox'` |
| `GEOLOCATION_AUTH_TOKEN` | Token de autenticação da API escolhida | Seu token de API |

### Provedores Suportados

- [Google Maps Platform](https://developers.google.com/maps/) - API completa de geolocalização e visualização de mapas
- [Mapbox](https://www.mapbox.com/) - Plataforma precisa de dados de localização

## 📦 Instalação

### Via Marketplace (Recomendado)
A partir da versão 10.10 do Directus:
1. Acesse o painel administrativo do Directus
2. Navegue até `Configurações → Marketplace`
3. Pesquise por `endereco-br`
4. Clique em "Instalar"

### Via NPM
```bash
npm install directus-extension-endereco-br
```

## 🖼️ Screenshots

### Pesquisa por CEP
![Pesquisa por CEP](https://github.com/devix-tecnologia/directus-extension-endereco-br/raw/main/docs/pesquisa.png)
*Faça a pesquisa por CEP e selecione o endereço rapidamente*

### Preenchimento de Informações Adicionais
![Preenchimento de Informações Adicionais](https://github.com/devix-tecnologia/directus-extension-endereco-br/raw/main/docs/preenchendo_adicional.png)
*Preencha informações adicionais para completar o cadastro*

### Preenchimento Automático
![Preenchimento Automático](https://github.com/devix-tecnologia/directus-extension-endereco-br/raw/main/docs/preenchimento_automatico.png)
*Ao salvar, os principais campos são preenchidos com os dados da pesquisa automática*

### Georreferenciamento
![Georreferenciamento](https://github.com/devix-tecnologia/directus-extension-endereco-br/raw/main/docs/georeferenciamento.png)
*Georreferenciamento do endereço quando configurado*

### Cadastro Automático
![Cadastro Automático](https://github.com/devix-tecnologia/directus-extension-endereco-br/raw/main/docs/cidade_bairro_automatico.png)
*Cadastro automático de bairro e cidades incluindo informações do IBGE*

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## 📄 Licença
[MIT](https://github.com/devix-tecnologia/directus-extension-endereco-br/blob/main/LICENSE)

## 👥 Autores
- [Fernando Gatti](https://github.com/gattifernando)
- [Lucas Scart](https://github.com/scart97)
- [Rafael Paviotti](https://github.com/RPaviotti)
- [Sidarta Veloso](https://github.com/sidartaveloso)

---

<p align="center">
  Desenvolvido com ❤️ por <a href="https://github.com/devix-tecnologia">Devix Tecnologia</a>
</p>