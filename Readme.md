![](https://github.com/devix-tecnologia/directus-extension-endereco-br/raw/main/docs/Banner.jpg)


# Extensão do Directus para trabalhar com endereços do Brasil
> Cria, organiza, pesquisa e georeferencia endereços brasileiros


## Funcionalidades
### Pesquisa a partir do CEP

Agiliza o cadastro de endereço permitindo a pesquisa a partir do valor do CEP para buscar as principais informações.

### Configuração automática

Coleções e relacionamentos necessários para o funcionamento são criados quando a extensão é instalada. Adicionalmente, lista dos estados brasileiros é inserida no banco de dados.

### Georeferenciamento

Inclui funcionalidade para realizar o georeferenciamento dos endereços, armazenando a latitude e longitude.

## Configurações

#### Provedor de georeferenciamento

Duas variáveis de ambiente devem ser configuradas para que o georeferenciamento funcione corretamente. Elas são:

- GEOLOCATION_PROVIDER: preencher com 'google' ou 'mapbox', dependendo do provedor de geolocation que deseja utilizar
- GEOLOCATION_AUTH_TOKEN: preencher com valor do token da API utilizada.

Os provedores suportados são:

- [Google](https://developers.google.com/maps/)
- [Mapbox](https://www.mapbox.com/)



## Instalação (marketplace)
A partir da versão 10.10 do directus, basta entrar em  `configurações -> marketplace` e pesquisar por `endereco-br`.

## Instalação (npm)
```
npm i directus-extension-endereco-br
```

## 🖼 Screenshots
![](https://github.com/devix-tecnologia/directus-extension-endereco-br/raw/main/docs/pesquisa.png)
*↑ Faça a pesquisa por CEP e selecione o endereço rapidamente*

---

![](https://github.com/devix-tecnologia/directus-extension-endereco-br/raw/main/docs/preenchendo_adicional.png)
*↑ Preencha informações adicionais para completar o cadastro*

---

![](https://github.com/devix-tecnologia/directus-extension-endereco-br/raw/main/docs/preenchimento_automatico.png)
*↑ Ao salvar os dados os principais campos são preenchidos com os dados da pesquisa automática*

---

![](https://github.com/devix-tecnologia/directus-extension-endereco-br/raw/main/docs/georeferenciamento.png)

*↑ Georeferenciamento do endereço caso seja configurado*

---

![](https://github.com/devix-tecnologia/directus-extension-endereco-br/raw/main/docs/cidade_bairro_automatico.png)
*↑ Cadastro automático de bairro e cidades incluindo informaçoes do IBGE*


