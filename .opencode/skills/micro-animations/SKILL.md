---
name: micro-animations
description: Use ao implementar animações CSS. Contém keyframes da garrafa, expansão de inputs e transições de cards.
---

# Micro-Interações e Animações

## 1. Balanço da Garrafa de Água

Keyframe registrado como `animate-garrafa-balanco`:

```css
@keyframes balancoGarrafa {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg) scale(1.02); }
  50% { transform: rotate(4deg) scale(0.98); }
  75% { transform: rotate(-2deg); }
}

.animate-garrafa-balanco {
  animation: balancoGarrafa 600ms ease-in-out;
}
```

Aplicar por 600ms via estado React, remover classe após animação terminar (`onAnimationEnd` ou `setTimeout`).

## 2. Preenchimento da Garrafa (Água)

- Container SVG com `clip-path` ou altura dinâmica
- Percentual: `(waterTotal / 2000) * 100` (cap em 100%)
- Cor do líquido: `#c47590` (rosa escuro) se ≥ 2000ml, `#cd8ea1` se abaixo
- Transição: `transition-all duration-500 ease-in-out`

## 3. Expansão de Input Oculto

```jsx
<div className={`transition-all duration-300 ease-in-out overflow-hidden ${
  isOpen ? 'max-h-24 opacity-100 mt-2 pt-2 border-t border-gray-100' : 'max-h-0 opacity-0'
}`}>
  <input className="border-[#cd8ea1] focus:border-[#cd8ea1]" />
</div>
```

## 4. Pulso de Alerta (Água > 2000ml)

Usar `animate-pulse` do Tailwind com `text-[#c47590] font-bold`.

## 5. Sheet Modal PWA

```css
/* entrada: translate-y-0, saída: translate-y-full */
transform transition-transform duration-500
```
