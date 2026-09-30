# 🧩 Task 005 — Validar e declarar suporte às versões mais recentes do Directus 11

- Status: done
- Type: feat
- Assignee: sidarta-veloso

## Description

Validar a extensão contra o Directus 11.17.4 (última 11.x), atualizar o SDK e as ferramentas do projeto e declarar o suporte no `package.json` e no README.

O suporte ao Directus 12 fica **fora do escopo por decisão de licença** (a v12 muda a licença do Directus). Nada de `^12` no `host`, nas dependências ou nos testes até ordem explícita.

## Tasks

<!-- [x] feito · [ ] em aberto · [ ] ... — adiado: <razão> para o que se decidiu não fazer -->

- [x] Trazer a `main` (1.5.x) para a `develop` antes de começar (merge sem conflitos)
- [x] Alinhar ferramentas: `.tool-versions` (nodejs 22.13.1, pnpm 12.7.0) e `packageManager: pnpm@12.7.0`
- [x] Mover configurações do pnpm para o `pnpm-workspace.yaml` (`minimumReleaseAge`, `allowBuilds`)
- [x] Atualizar o taskin para `^5.0.0` e versionar `.taskin/.taskin-users.json`
- [x] Atualizar `@directus/extensions-sdk` (^17.1.4), `@directus/extensions` (^3.0.25) e `@directus/types` (^15.0.3) para o maior major compatível com o Directus 11
- [x] Limitar as versões de Directus dos testes a `<12`, com teto explícito (`DIRECTUS_MAX_MAJOR = 11`) e regra no Renovate
- [x] Validar em Docker contra o Directus 11.17.4 (testes unitários e de integração)
- [x] Validar contra 11.0.0, 10.13.4 e 10.4.2 (menor imagem Docker dentro de `^10.3.4`)
- [x] Manter `directus:extension.host` em `^10.3.4 || ^11.0.0` (tudo validado; o `^11` já exclui a 12)
- [x] Atualizar o README com a matriz de compatibilidade
- [x] Rodar build, lint, typecheck e testes

## Resultado

Matriz validada (`pnpm test:all-versions`, extensão compilada montada na imagem oficial `directus/directus`, SQLite):

| Directus | Integração | Observação                                                 |
| -------- | ---------- | ---------------------------------------------------------- |
| 11.17.4  | 19/19      | Última 11.x; versão padrão dos testes                      |
| 11.0.0   | 19/19      | Primeira 11.x                                              |
| 10.13.4  | 19/19      | Última 10.x                                                |
| 10.4.2   | 19/19      | Não existe imagem 10.3.4; é a menor imagem dentro da faixa |
| 12.x     | —          | Fora do escopo por decisão de licença, até ordem explícita |

Testes unitários (independentes da versão): 19/19. Build, `directus-extension validate`, lint e typecheck sem erros.

### Correções nos testes de integração

- A suite de bairro ignorava `DIRECTUS_TEST_VERSION` e a de setup usava `latest` por padrão (hoje a 12.x). As duas agora usam `getDirectusTestVersion()`, que recusa tags móveis e majors >= 12.
- Os dois testes do hook falhavam já na 11.17.1 (antes desta task): o payload não tinha `pesquisa_cep` (o hook não fazia nada) e a leitura após o insert pedia o campo `localizacao` (geometry), que o SQLite sem SpatiaLite não lê (`no such function: st_astext`). Reescritos para usar o `pesquisa_cep` real do endpoint e pedir só os campos necessários.
- `dockerHttpRequest` quebrava com corpo contendo JSON aninhado; agora envia path, headers e corpo em base64.

### Taskin 5

- `taskin lint` acusava erro na task 004 (`Status: ✅ **completed**`); o status foi normalizado para `done`.
- Ficam 4 avisos em tasks antigas (assignees `developer` e `Marcos` sem cadastro; tasks 003 e 004 com o nome em vez do id `sidarta-veloso`). Não foram alterados.

### Pendências

- Os testes de integração não usam banco com suporte a geometry, então o georreferenciamento (`localizacao`) não é coberto. Avaliar Postgres + PostGIS no `docker-compose.test.yml`.
- O workflow `Integration Tests` continua manual (`workflow_dispatch`) e roda só a suite de bairro.
- Os documentos em `docs/` ainda citam `latest` e 11.17.1 como versão alvo.

## Notes

- Produção (credencia) usa a 1.4.2 no Directus 11.17.x, com `@directus/extensions-sdk` 17.1.4.
- O Directus 11.17.4 usa internamente `@directus/extensions-sdk` 17.1.4, `@directus/extensions` 3.0.25 e `@directus/types` 15.0.3. Os majors seguintes (SDK 18, extensions 4, types 16+) acompanham o Directus 12.
