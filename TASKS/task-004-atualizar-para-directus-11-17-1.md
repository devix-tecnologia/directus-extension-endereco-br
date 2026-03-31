# Task 004 — Suporte a Directus 10 e 11

Status: ✅ **completed**  
Type: feat  
Assignee: Sidarta Veloso  
Completed: 31 de Março de 2026

## Description

Adicionar suporte completo ao Directus 11.x mantendo retrocompatibilidade com Directus 10.x. A extensão deve funcionar perfeitamente em ambas as versões principais, permitindo que usuários migrem gradualmente de Directus 10 para 11 sem perder funcionalidades.

✅ **IMPLEMENTADO COM SUCESSO** - Veja [IMPLEMENTACAO-DUAL-VERSION.md](../docs/IMPLEMENTACAO-DUAL-VERSION.md) para detalhes completos.

## Motivação

- Directus 11 trouxe mudanças significativas na API e estrutura interna
- Muitos usuários ainda utilizam Directus 10 em produção
- Permitir migração gradual e não forçar atualização imediata
- Maximizar o alcance e compatibilidade da extensão

## Tasks

### 1. Análise de Compatibilidade

- [ ] Identificar breaking changes entre Directus 10 e 11 que afetam a extensão
- [ ] Documentar diferenças na API de hooks, endpoints e services
- [ ] Verificar mudanças nos tipos TypeScript (`@directus/types`)
- [ ] Analisar impacto nas dependências (`@directus/extensions-sdk`, etc)

### 2. Atualização do Código

- [ ] Implementar detecção de versão do Directus em runtime
- [ ] Criar abstrações para APIs que mudaram entre v10 e v11
- [ ] Atualizar imports e tipos para serem compatíveis com ambas versões
- [ ] Refatorar código que usa recursos deprecados no v11
- [ ] Garantir que hooks e endpoints funcionem em ambas versões

### 3. Configuração do Projeto

- [ ] Atualizar `host` no `package.json` para `"^10.3.4 || ^11.0.0"`
- [ ] Atualizar dependências de desenvolvimento para suportar ambas versões
- [ ] Configurar peer dependencies adequadamente
- [ ] Atualizar scripts de build se necessário

### 4. Testes Automatizados

- [ ] Habilitar testes em múltiplas versões do Directus no CI/CD
- [ ] Atualizar `directus-versions.js` para incluir versões de teste:
  - Última versão estável do Directus 10 (ex: `10.13.x`)
  - Versões do Directus 11: `11.0.0`, `11.10.0`, `11.17.1`, `latest`
- [ ] Executar testes de integração em ambas as versões
- [ ] Garantir 100% de pass rate em todas as versões testadas
- [ ] Testar especificamente:
  - Criação de coleções no setup
  - Pesquisa de CEP via endpoint
  - Hooks de atualização automática de endereço
  - Serviço de bairros
  - Geocoding

### 5. Documentação

- [ ] Atualizar README.md com informações de compatibilidade
- [ ] Documentar versões suportadas claramente
- [ ] Adicionar seção sobre migração de v10 para v11
- [ ] Atualizar exemplos de código se necessário
- [ ] Documentar limitações conhecidas (se houver) em cada versão

### 6. Validação Final

- [ ] Testar instalação em projeto Directus 10.x
- [ ] Testar instalação em projeto Directus 11.x
- [ ] Validar que não há warnings ou deprecations
- [ ] Verificar que tipos TypeScript estão corretos em ambas versões
- [ ] Executar `pnpm validate` com sucesso

## Critérios de Aceitação

- ✅ Extensão instala e funciona corretamente em Directus 10.3.4+
- ✅ Extensão instala e funciona corretamente em Directus 11.0.0+
- ✅ Todos os testes automatizados passam em ambas as versões
- ✅ Sem warnings de deprecation ou incompatibilidade
- ✅ Documentação clara sobre versões suportadas
- ✅ CI/CD testa ambas as versões automaticamente

## Recursos e Referências

- [Directus 11 Migration Guide](https://docs.directus.io/getting-started/migrating-from-v10.html)
- [Directus 11 Release Notes](https://github.com/directus/directus/releases/tag/v11.0.0)
- [Directus Extension SDK Changelog](https://github.com/directus/directus/tree/main/packages/extensions-sdk)
- [@directus/types Changelog](https://www.npmjs.com/package/@directus/types?activeTab=versions)

## Notas Técnicas

### Principais Mudanças do Directus 11

1. **Sistema de Tipos**: Mudanças significativas no `@directus/types`
2. **API de Hooks**: Possíveis alterações na assinatura e contexto
3. **Services**: Refatorações internas nos serviços do Directus
4. **Schema**: Melhorias no schema management
5. **Performance**: Otimizações que podem afetar timing de hooks

### Estratégia de Detecção de Versão

```typescript
// Exemplo de detecção de versão
import { version } from 'directus/package.json';

const isV11 = parseInt(version.split('.')[0], 10) >= 11;

if (isV11) {
	// Lógica para Directus 11
} else {
	// Lógica para Directus 10
}
```

### Versionamento Semântico

Esta feature será lançada como **minor version** (ex: 1.5.0), pois adiciona funcionalidade mantendo retrocompatibilidade.
