# Guia de Contribuição

Obrigado por considerar contribuir com a extensão de Endereços Brasileiros para Directus! 🎉

## 🚀 Configuração do Ambiente

### Pré-requisitos

- Node.js >= 20
- pnpm >= 9.0.0
- Docker e Docker Compose (para testes de integração)

**Recomendado**: Use [asdf](https://asdf-vm.com/) para gerenciar versões de Node.js e pnpm. O projeto inclui um arquivo `.tool-versions` com as versões recomendadas.

### Instalação

```bash
# Clone o repositório
git clone https://github.com/devix-tecnologia/directus-extension-endereco-br.git
cd directus-extension-endereco-br

# (Opcional) Se usar asdf, instale as versões recomendadas
asdf install

# Instale as dependências
pnpm install
```

## 🧪 Testes

### Testes Unitários

Testes rápidos que não dependem de serviços externos:

```bash
# Executar testes unitários
pnpm test:unit

# Watch mode (desenvolvimento)
pnpm test:watch

# Cobertura de código
pnpm test:coverage
```

### Testes de Integração

Testes que validam a integração com o Directus usando Docker:

```bash
# Todas as suites na versão padrão (Directus 11.17.4)
pnpm test:integration

# Outra versão (nunca >= 12, por licença; tags como "latest" são recusadas)
DIRECTUS_TEST_VERSION=11.0.0 pnpm test:integration

# Toda a matriz de versões (src/tests/directus-versions.js; pode demorar)
pnpm test:all-versions

# Só a suite de bairro, na versão padrão (mais rápido)
pnpm test:integration:fast
```

**⚠️ Nota importante**: Os testes de integração:

- Requerem Docker e Docker Compose instalados
- Podem levar ~2 minutos para iniciar o Directus
- NÃO rodam automaticamente no CI (GitHub Actions tem limitações com Docker)
- Devem ser executados localmente antes de fazer PR
- Podem ser executados manualmente no GitHub via workflow `Integration Tests`

### Todos os Testes

```bash
# Executar todos os testes
pnpm test
```

## 🔍 Validação de Código

Antes de fazer commit, execute:

```bash
# Linting (verifica código)
pnpm lint

# Corrigir automaticamente problemas de lint
pnpm lint:fix

# Type checking (TypeScript)
pnpm typecheck

# Formatação (Prettier)
pnpm format

# Verificar formatação sem alterar arquivos
pnpm format:check
```

## 🏗️ Build

```bash
# Build para produção
pnpm build

# Build em modo watch (desenvolvimento)
pnpm dev

# Limpar diretório de build
pnpm clean
```

## 🔄 CI/CD

### Workflows GitHub Actions

O projeto utiliza os seguintes workflows:

#### 1. **CI** (`ci.yml`)

- **Quando**: Pull Requests para `main` ou `develop`
- **O que faz**:
  - Lint
  - Type check
  - Testes unitários
  - Build

#### 2. **Deployment** (`deployment.yml`)

- **Quando**: Push para branch `main`
- **O que faz**:
  - Job 1 (Test): Valida código (lint, typecheck, unit tests, build)
  - Job 2 (Release): Faz release automático via semantic-release
- **Nota**: Semantic release analisa os commits e gera versão automaticamente

#### 3. **Integration Tests** (`integration-tests.yml`)

- **Quando**: Execução manual (workflow_dispatch)
- **O que faz**: Roda testes de integração contra múltiplas versões do Directus
- **Por que manual**: Docker é instável no GitHub Actions (timeouts frequentes)

### Dependências Automáticas

O projeto usa **Renovate** para atualização automática de dependências:

- Executa toda segunda-feira antes das 9h (horário de São Paulo)
- Agrupa todas as dependências em um único PR
- **Proteção contra supply chain attacks**: Aguarda 5 dias antes de instalar novos pacotes
- Alertas de segurança são tratados imediatamente (0 dias)

## 📝 Padrão de Commits

O projeto utiliza [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos de commit:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Apenas documentação
- `style`: Formatação, ponto e vírgula, etc (sem mudança de código)
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adição ou correção de testes
- `chore`: Mudanças em ferramentas, configurações, etc
- `ci`: Mudanças em CI/CD

### Exemplos:

```bash
feat(cep): adiciona validação de CEP inválido
fix(geocoding): corrige erro ao buscar coordenadas
docs(readme): atualiza instruções de instalação
test(bairro): adiciona testes para cadastro de bairro
```

## 🔀 Fluxo de Trabalho

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feat/minha-feature`)
3. Faça suas alterações
4. Execute os testes: `pnpm test:unit` (mínimo) e `pnpm test:integration:fast` (recomendado)
5. Valide o código: `pnpm lint && pnpm typecheck`
6. **Commit** suas mudanças seguindo Conventional Commits
7. **Push** para a branch (`git push origin feat/minha-feature`)
8. Abra um **Pull Request**

## 📋 Checklist de PR

Antes de abrir um Pull Request, verifique:

- [ ] Testes unitários passando (`pnpm test:unit`)
- [ ] Testes de integração passando localmente (`pnpm test:integration:fast`)
- [ ] Lint sem erros (`pnpm lint`)
- [ ] Type check sem erros (`pnpm typecheck`)
- [ ] Código formatado (`pnpm format`)
- [ ] Commits seguem o padrão Conventional Commits
- [ ] Documentação atualizada (se necessário)

## 🐛 Reportando Bugs

Ao reportar um bug, inclua:

- Versão do Directus
- Versão da extensão
- Passos para reproduzir
- Comportamento esperado
- Comportamento atual
- Screenshots (se aplicável)

## 💡 Sugerindo Funcionalidades

Para sugerir uma nova funcionalidade:

1. Verifique se já não existe uma issue similar
2. Abra uma issue detalhando:
   - Problema que a funcionalidade resolve
   - Solução proposta
   - Alternativas consideradas

## 📞 Dúvidas?

Se tiver dúvidas, abra uma [issue](https://github.com/devix-tecnologia/directus-extension-endereco-br/issues) ou entre em contato com os mantenedores.

---

Obrigado por contribuir! 🙏
