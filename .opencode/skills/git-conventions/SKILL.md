---
name: git-conventions
description: Regras mandatórias para escrita de commits semânticos e gerenciamento de branches do projeto Desborocoxando.
---

# 📝 Padrão de Commits (Conventional Commits)

Todos os commits devem seguir: `<tipo>: <descrição em letras minúsculas, sem ponto final>`

| Tipo | Uso | Exemplo no projeto |
|---|---|---|
| `feat:` | Nova funcionalidade | `feat: adiciona card de registro de peso no dashboard` |
| `fix:` | Correção de bug | `fix: remove key duplicada no calendário` |
| `docs:` | Documentação | `docs: atualiza plano de execucao com stage 10` |
| `style:` | CSS / formatação (sem mudar lógica) | `style: ajusta sombra dos cards de hábitos` |
| `refactor:` | Refatoração de código | `refactor: extrai schema zod para arquivo separado` |
| `test:` | Testes | `test: adiciona cobertura para useAppData` |
| `chore:` | Setup, build, config | `chore: initial project setup with opencode architecture` |
| `perf:` | Performance | `perf: lazy load recharts nos graficos` |
| `security:` | Segurança | `security: remove any explicito do hook usePWA` |

# 🌿 Padrão de Branches

| Tipo | Padrão | Exemplo |
|---|---|---|
| Funcionalidade | `feature/nome-da-feature` | `feature/card-peso` |
| Correção | `fix/nome-do-bug` | `fix/calendario-key-duplicada` |
| Refatoração | `refactor/nome-do-arquivo` | `refactor/hooks-data-flow` |

# ✅ Checklist de Segurança (Pré-Commit)

- [ ] `npm run lint` — zero erros
- [ ] `npx tsc --noEmit` — zero erros
- [ ] `npm test` — todos verdes
- [ ] Nenhum arquivo `.env*` ou `*.local` no staging
- [ ] Nenhuma string sensível (senha, password, token, api_key, secret, credentials, private_key) no diff
- [ ] Nenhum `node_modules/`, `dist/`, `*.log` no staging
- [ ] Coordinator aprovou o relatório de segurança
