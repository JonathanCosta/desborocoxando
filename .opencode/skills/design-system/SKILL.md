---
name: design-system
description: Use ao criar ou estilizar componentes. Contém paleta rosa, tipografia e regras de layout do Desborocoxando.
---

# Design System — Paleta Rosa Desborocoxando

## Paleta de Cores

| Token | HEX | Uso |
|---|---|---|
| Rosa Claro (Fundo) | `#f7e1e3` | Background geral, tooltips, instruções iOS |
| Rosa Médio (Bordas) | `#cd8ea1` | Bordas de card, nav inferior, placeholder, inativo |
| Rosa Escuro (Ação) | `#c47590` | Botões, toggle ativo, dia perfeito, gráficos, água cheia |
| Bordô (Destaque) | `#922d4d` | Textos principais, ícone ativo nav, ring hoje, meta |
| Branco | `#ffffff` | Cards, nav inferior, contraste com fundo |

## Tipografia
- Font padrão: `font-sans` (sistema); `font-advent` para títulos e destaques numéricos (Advent Pro, Google Fonts)
- Pesos: `font-semibold` para botões, `font-bold` para totais e dias ativos
- Contraste: texto `#922d4d` sobre fundo `#f7e1e3` (~7:1 WCAG AA). Placeholders em `#cd8ea1` (~2.8:1, tolerância estética).

## Layout
- Container máximo: `max-w-md mx-auto`
- Mobile-first: toda tela assume viewport ≤ 768px
- Nav inferior: `fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md h-16 bg-white`
- Cards: `bg-white rounded-2xl shadow-sm`
- Botões pílula: `rounded-full`
- Transições: `transition-all duration-300 ease-in-out`
- Efeito clique: `active:scale-95`
