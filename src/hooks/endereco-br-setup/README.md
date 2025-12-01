# Hook de Auto-Setup - Endereço BR Extension

Este hook é responsável por criar automaticamente todas as coleções, campos, relações e dados iniciais da extensão Endereço BR quando o Directus é iniciado.

## Funcionalidade

O hook é acionado nos seguintes eventos:

1. **`routes.after`** - Executado após as rotas serem registradas
2. **`server.start`** - Executado quando o servidor inicia
3. **`extensions.install`** - Executado quando a extensão é instalada/atualizada
4. **`extensions.reload`** - Executado quando as extensões são recarregadas (apenas verifica)

## O que o hook cria

### Coleções

1. **extension_endereco_br** - Pasta grupo para organizar as coleções
2. **pais** - Coleção de países
3. **estado** - Coleção de estados
4. **cidade** - Coleção de cidades
5. **bairro** - Coleção de bairros
6. **endereco_br** - Coleção principal de endereços brasileiros

### Campos

Todos os campos definidos em `files/state.json` são criados automaticamente, incluindo:

- Campos de identificação (id)
- Campos de status e auditoria (user_created, date_created, etc.)
- Campos específicos de cada coleção (nome, sigla, codigo_ibge, cep, logradouro, etc.)
- Campos de relacionamento (relações many-to-one)
- Campos de geolocalização (localizacao - geometry.Point)

### Relações

As seguintes relações são criadas automaticamente:

- **estado** -> **pais**
- **cidade** -> **estado**
- **bairro** -> **cidade**
- **endereco_br** -> **bairro**

### Dados Iniciais

O hook popula automaticamente os dados iniciais definidos em `files/seed.json`:

- **Brasil** (país)
- **26 estados brasileiros** com seus códigos IBGE

## Arquivos de Configuração

### `files/state.json`

Contém a definição completa do schema:

- Coleções e seus metadados
- Campos e suas configurações
- Relações entre coleções

### `files/seed.json`

Contém os dados iniciais a serem populados:

- Países
- Estados com códigos IBGE

## Processo de Criação

O hook segue uma ordem específica para garantir que as dependências sejam respeitadas:

1. **Criação de Coleções** - Cria as coleções recursivamente, respeitando dependências de grupos (pastas)
2. **Criação de Campos** - Adiciona campos faltantes às coleções
3. **Criação de Relações** - Estabelece as relações entre coleções
4. **População de Dados** - Insere os dados iniciais (países e estados)
5. **Refresh do Schema** - Atualiza o schema do Directus

## Idempotência

O hook é idempotente, ou seja:

- Se uma coleção já existe, ela não é recriada
- Se um campo já existe, ele não é recriado
- Se uma relação já existe, ela não é recriada
- Se dados iniciais já existem, eles não são duplicados

Isso permite que o hook seja executado múltiplas vezes sem causar erros ou duplicações.

## Logs

O hook registra mensagens detalhadas no console do Directus:

- **ℹ️** Informações gerais
- **✅** Operações bem-sucedidas
- **⚠️** Avisos (não críticos)
- **❌** Erros (com detalhes)
- **🔨** Criação de recursos
- **⏭️** Recursos que já existem (pulados)

## Testes

O arquivo `src/tests/endereco-br-setup.integration.spec.ts` contém testes de integração que verificam:

- Criação de todas as coleções
- Metadados corretos das coleções
- Criação de campos
- Criação de relações
- População de dados iniciais
- Acessibilidade das coleções

Para executar os testes:

```bash
pnpm test
```

## Desenvolvimento

Se você precisar modificar o schema:

1. Atualize o arquivo `files/state.json` com as novas definições
2. Atualize o arquivo `files/seed.json` se necessário
3. Reinicie o Directus ou force o reload das extensões
4. O hook irá detectar as mudanças e criar os novos recursos

## Referências

Este hook foi baseado no hook de auto-setup da extensão `directus-extension-inframe`, seguindo as melhores práticas de criação de coleções no Directus.
