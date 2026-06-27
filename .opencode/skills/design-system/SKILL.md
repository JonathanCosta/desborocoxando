---
name: design-system
description: Use ao criar ou estilizar componentes. Contém paleta floral, tipografia e regras de layout do Desborocoxando.
---

# Design System — Paleta Floral Desborocoxando

## Paleta de Cores

| Token | HEX | Uso |
|---|---|---|
| Rosa Floral | `#C496A1` | Botões, indicador ativo, ícones de ação |
| Verde Oliva | `#919D85` | "Sim" ativo, barras cheias (água ≥ 2000ml), dia perfeito |
| Ouro Escuro | `#81785A` | Texto destaque, bordas, contorno calendário |
| Bege Claro | `#EBE1C6` | Cards, nav inferior, fundo de cartões |
| Fundo | `#F7F5F0` | Background geral do body |
| Lavanda | `#8E88A3` | Barras < meta, bordas de input em foco |

## Tipografia

- Font padrão: `font-sans` (sistema)
- Destaques numéricos: `font-serif`
- Pesos: `font-semibold` para botões, `font-bold` para totais e dias ativos

## Layout

- Container máximo: `max-w-md mx-auto`
- Mobile-first: toda tela assume viewport ≤ 768px
- Nav inferior: `fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md h-16`
- Cards: `rounded-2xl` ou `rounded-xl`
- Botões pílula: `rounded-full`
- Transições: `transition-all duration-300 ease-in-out`
- Efeito clique: `active:scale-95`
