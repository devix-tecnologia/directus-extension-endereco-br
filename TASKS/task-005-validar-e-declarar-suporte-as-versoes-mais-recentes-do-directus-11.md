# 🧩 Task 005 — Validar e declarar suporte às versões mais recentes do Directus 11

- Status: pending
- Type: feat
- Assignee: sidarta-veloso

## Description
Validar a extensão contra o Directus 11.17.4 (última 11.x), atualizar o SDK e as ferramentas do projeto e declarar o suporte no `package.json` e no README.

O suporte ao Directus 12 fica **fora do escopo por decisão de licença** (a v12 muda a licença do Directus). Nada de `^12` no `host`, nas dependências ou nos testes até ordem explícita.

## Tasks
<!-- [x] feito · [ ] em aberto · [ ] ... — adiado: <razão> para o que se decidiu não fazer -->
- [ ] Trazer a `main` (1.5.x) para a `develop` antes de começar
- [ ] Alinhar ferramentas: `.tool-versions` (nodejs 22.13.1, pnpm 12.7.0) e `packageManager: pnpm@12.7.0`
- [ ] Atualizar o taskin para `^5.0.0` e versionar `.taskin/.taskin-users.json`
- [ ] Atualizar `@directus/extensions-sdk`, `@directus/extensions` e `@directus/types` para o maior major compatível com o Directus 11
- [ ] Limitar as versões de Directus dos testes a `<12`, com teto explícito
- [ ] Validar em Docker contra o Directus 11.17.4 (testes unitários e de integração)
- [ ] Validar, se viável, contra uma 11.x antiga (11.0.x) e a 10.x mínima declarada
- [ ] Ajustar `directus:extension.host` conforme o que foi validado
- [ ] Atualizar o README com a matriz de compatibilidade
- [ ] Rodar build, lint, typecheck e testes

## Notes
- Produção (credencia) usa a 1.4.2 no Directus 11.17.x, com `@directus/extensions-sdk` 17.1.4.
- O Directus 11.17.4 usa internamente `@directus/extensions-sdk` 17.1.4, `@directus/extensions` 3.0.25 e `@directus/types` 15.0.3. Os majors seguintes (SDK 18, extensions 4, types 16+) acompanham o Directus 12.
