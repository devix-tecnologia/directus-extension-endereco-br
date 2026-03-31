# Guia de Migração: Directus 10 → Directus 11

Este guia explica como atualizar sua instalação do Directus de 10.x para 11.x mantendo a extensão de Endereços BR funcionando perfeitamente.

## ✨ Boa Notícia

**A extensão Endereço BR já é totalmente compatível com Directus 10 e 11!**

Você não precisa fazer nenhuma alteração na extensão ao atualizar o Directus. A detecção de versão é automática.

## 🔍 Detecção Automática de Versão

A extensão detecta automaticamente a versão do Directus e adapta seu comportamento:

```typescript
// A extensão faz isso automaticamente para você
import { getCurrentDirectusVersion } from './utils/directus-version';

const version = getCurrentDirectusVersion(logger);
// version.isV10 ou version.isV11 são detectados automaticamente
```

## 📋 Checklist de Migração

### Antes da Atualização

- [ ] Faça backup completo do seu banco de dados
- [ ] Documente suas customizações e extensões
- [ ] Verifique a versão atual: `npm list directus`
- [ ] Leia as [Release Notes do Directus 11](https://github.com/directus/directus/releases)

### Durante a Atualização

```bash
# 1. Atualize o Directus (exemplo com npm)
npm install directus@11

# 2. Não é necessário atualizar a extensão endereco-br!
# Ela já suporta ambas as versões

# 3. Execute as migrações do banco de dados
npx directus database migrate:latest

# 4. Inicie o Directus
npx directus start
```

### Após a Atualização

- [ ] Verifique os logs de inicialização
- [ ] Confirme que a extensão foi carregada corretamente
- [ ] Teste a pesquisa por CEP
- [ ] Verifique as coleções criadas (estados, cidades, enderecos)
- [ ] Teste o georreferenciamento (se configurado)

## 📊 Diferenças de Comportamento

### Directus 10.x

- Usa eventos `server.start` e `routes.after` para setup
- API de services estável
- Schemas sem breaking changes

### Directus 11.x

- Mesmos eventos funcionam perfeitamente
- APIs mantidas com compatibilidade
- Melhorias de performance nos hooks

### Na Prática

**Não há diferenças visíveis para o usuário final!** A extensão funciona de forma idêntica em ambas as versões.

## 🐛 Troubleshooting

### A extensão não está sendo carregada

1. Verifique os logs do Directus:

   ```bash
   # Procure por mensagens como:
   # [Endereço BR Extension] Running on Directus 11.x (11.17.1)
   ```

2. Confirme que a extensão está instalada:

   ```bash
   ls -la extensions/directus-extension-endereco-br/
   ```

3. Reconstrua a extensão se necessário:
   ```bash
   cd extensions/directus-extension-endereco-br
   npm run build
   ```

### Erro de versão incompatível

Se você ver um erro sobre versão incompatível, verifique:

```json
// Em package.json da extensão, deve conter:
"directus:extension": {
  "host": "^10.3.4 || ^11.0.0"
}
```

### Collections não foram criadas

Execute manualmente o setup (via API ou reinicie o Directus):

```bash
# Reinicie para acionar o hook de setup
systemctl restart directus
# ou
pm2 restart directus
```

## 🔬 Testando a Compatibilidade

Para desenvolvedores que querem testar a extensão em múltiplas versões:

```bash
# Teste em todas as versões configuradas
pnpm test:all-versions

# Teste em uma versão específica
DIRECTUS_TEST_VERSION=11.17.1 pnpm test:integration

# Teste na versão latest
DIRECTUS_TEST_VERSION=latest pnpm test:integration
```

## 💡 Dicas de Performance

### Directus 11 oferece melhorias de performance:

1. **Cache melhorado** - As consultas de estados/cidades ficam mais rápidas
2. **Websockets** - Atualizações em tempo real funcionam melhor
3. **Rate limiting** - Proteção contra abuso da API de CEP

### Configurações recomendadas para v11:

```env
# .env do Directus 11
CACHE_ENABLED=true
CACHE_TTL=5m
CACHE_NAMESPACE=directus-endereco-br
RATE_LIMITER_ENABLED=true
RATE_LIMITER_POINTS=50
```

## 📚 Recursos Adicionais

- [Directus 11 Migration Guide](https://docs.directus.io/getting-started/migration-guide.html)
- [Directus 11 Breaking Changes](https://github.com/directus/directus/discussions/19000)
- [Extensão Endereço BR - Issues](https://github.com/devix-tecnologia/directus-extension-endereco-br/issues)

## 🤝 Suporte

Se encontrar problemas durante a migração:

1. Verifique se está usando a versão mais recente da extensão
2. Consulte os [Issues existentes](https://github.com/devix-tecnologia/directus-extension-endereco-br/issues)
3. Abra uma issue com detalhes sobre:
   - Versão do Directus (antes e depois)
   - Versão da extensão
   - Logs de erro
   - Steps para reproduzir

## ✅ Versões Testadas

Esta extensão é automaticamente testada contra:

- Directus 10.13.3 (última versão estável 10.x)
- Directus 11.0.0 (primeira versão 11.x)
- Directus 11.10.0 (versão intermediária)
- Directus 11.17.1 (versão target)
- Directus latest (sempre a mais recente)

---

**Resumo**: A migração do Directus 10 para 11 é transparente para usuários da extensão Endereço BR. Apenas atualize o Directus normalmente e a extensão continuará funcionando! 🎉
