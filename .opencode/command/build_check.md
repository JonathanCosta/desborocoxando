---
description: Valida que o build de produção gera a pasta dist/ sem erros.
---

# Validação de Build Local

Antes de qualquer commit que finalize um ciclo de desenvolvimento, o sistema deve garantir que o projeto pode ser empacotado para produção sem estourar erros de memória ou falhas de resolução de módulos.

**Comando de execução obrigatória:**
`npm run build`

**Critério de Aceitação:**
O comando deve finalizar gerando a pasta `dist/` sem retornar `Exit Code 1`. Se o build falhar, o erro deve ser retornado ao `ui-engineer` ou `state-engineer` para correção.
