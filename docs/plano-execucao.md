# 🏗️ Plano de Execução — Desborocoxando

> Plano validado por **sec-reviewer** e **ui-engineer**.
> Versão corrigida com todos os pontos de melhoria incorporados.

---

## Stage 1: Setup do Projeto e Dependências
**Responsável:** Agente de Setup / State Engineer

- `npm create vite@latest desborocoxando -- --template react-ts`
- Instalar dependências:
  ```bash
  npm install react@^18.3.0 react-dom@^18.3.0
  npm install tailwindcss@^3.4.0 postcss autoprefixer
  npm install recharts@^2.12.0
  npm install lucide-react@^0.350.0
  npm install date-fns
  npm install zod
  npm install -D vite-plugin-pwa@^0.17.0
  ```
- Configurar `vite.config.ts` com VitePWA:
  - `registerType: 'autoUpdate'`
  - `strategies: 'generateSW'`
  - `theme_color: '#C496A1'`, `background_color: '#F7F5F0'`
  - Ícones: `docs/pwaicons/` copiados para `public/pwaicons/`
- Estrutura de pastas:
  ```
  src/
   ├─ assets/
   ├─ components/ (Dashboard, CalendarView, Analytics, Settings)
   ├─ hooks/ (useAppData, usePWA, useBackup)
   ├─ types/ (index.ts)
   ├─ utils/ (dateUtils.ts)
   ├─ App.tsx
   └─ index.css
  ```

---

## Stage 2a: Modelagem de Dados (`src/types/index.ts`)
**Responsável:** State Engineer

```typescript
export interface Meal {
  id: string;
  hora: string;
  descricao: string;
  kcal: number;
}

export interface DailyRecord {
  date: string;
  water: number;
  meds: { done: boolean; note: string };
  care: { done: boolean; note: string };
  exercise: { done: boolean; note: string };
  meals: Meal[];
  weight: number | null;
}

export type AppDatabase = Record<string, DailyRecord>;

export const emptyRecord = (date: string): DailyRecord => ({
  date,
  water: 0,
  meds: { done: false, note: '' },
  care: { done: false, note: '' },
  exercise: { done: false, note: '' },
  meals: [],
  weight: null,
});
```

---

## Stage 2b: Utilitários (`src/utils/dateUtils.ts`)
**Responsável:** State Engineer

- `normalizeDate(date: Date): string` → `format(date, 'yyyy-MM-dd')` do `date-fns`
- `today(): string` → data de hoje no formato `YYYY-MM-DD`
- `isValidDate(str: string): boolean` → regex `/^\d{4}-\d{2}-\d{2}$/`

---

## Stage 3: Hooks de Estado e Persistência
**Responsável:** State Engineer

### `src/hooks/useAppData.ts`
- Estado: `selectedDate` (string) + `db` (AppDatabase)
- Init: ler `localStorage.getItem('desborocoxando_data')` com `try/catch` → se erro ou null, retorna `{}`
- `setDb` atualiza estado + salva no localStorage (com `useRef(isFirstRender)` para evitar persistir na inicialização)
- `selectedDate` inicia com `today()` do `dateUtils`
- `getCurrentRecord()` → `db[selectedDate] ?? emptyRecord(selectedDate)`
- `updateRecord(partial)` → merge no `db[selectedDate]` e persiste
- Usar `format()` do `date-fns` para normalizar datas

### `src/hooks/usePWA.ts`
- `beforeinstallprompt` listener → `e.preventDefault()` + salva evento
- `isIOS` → `/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream`
- `isStandalone` → `window.matchMedia('(display-mode: standalone)').matches || navigator.standalone`
- `triggerInstall()` → `installPromptEvent.prompt()`
- Retorna: `{ isIOS, isStandalone, triggerInstall, canInstall: !!installPromptEvent || (isIOS && !isStandalone) }`

### `src/hooks/useBackup.ts`
- `exportData()`: Lê localStorage → Blob → `URL.createObjectURL` → `<a>` click → download `desborocoxando-backup.json`
- `importData(file: File)`: `FileReader` → `JSON.parse` (`try/catch`) → verificar `typeof data === 'object' && data !== null && !Array.isArray(data)` → validar schema com **Zod** (cada chave deve ser YYYY-MM-DD, cada valor deve ser `DailyRecord`) → sobrescrever localStorage → `window.location.reload()`

---

## Stage 4: Estilos Globais (`src/index.css`)
**Responsável:** UI Engineer

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  @keyframes balancoGarrafa {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg) scale(1.02); }
    50% { transform: rotate(4deg) scale(0.98); }
    75% { transform: rotate(-2deg); }
  }
  .animate-garrafa-balanco {
    animation: balancoGarrafa 600ms ease-in-out;
  }
  .bg-floral-gradient {
    background: linear-gradient(135deg, #F7F5F0 0%, #EBE1C6 100%);
  }
}
```

---

## Stage 5: Layout Base e Navegação (`src/App.tsx`)
**Responsável:** UI Engineer

### Container
```tsx
<div className="w-full min-h-screen max-w-md mx-auto bg-[#F7F5F0] flex flex-col relative pb-20 shadow-xl border-x border-gray-200/50">
  {/* tela ativa */}
</div>
```

### Bottom Nav
```tsx
<nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-[#EBE1C6] border-t border-[#81785A]/20 flex items-center justify-around px-4 z-40">
  {/* 4 itens com Lucide icons */}
  {/* Ativo: cor #C496A1 + dot indicador; Inativo: #81785A opacity-60 */}
  {/* aria-label em cada botao */}
</nav>
```

### Navegação
- Estado `activeTab: 'dashboard' | 'calendar' | 'analytics' | 'settings'`
- CalendarView ao clicar em data → muda `activeTab` para 'dashboard' + atualiza `selectedDate`
- Ícones: `Droplets` (Dashboard), `Calendar` (Calendar), `BarChart3` (Analytics), `Settings` (Settings)

---

## Stage 6: Tela 1 — Dashboard Diário (`src/components/Dashboard.tsx`)
**Responsável:** UI Engineer

### Header
- Logo centralizado (`h-16 w-auto object-contain py-2`, `<img>` com `aria-label="Desborocoxando"`)
- Faixa condicional se `selectedDate !== today`: `bg-[#C496A1] text-white text-xs text-center py-1.5 flex items-center justify-center gap-2` + link "Voltar para Hoje"

### Card Água
- `bg-[#EBE1C6] rounded-2xl p-4 mb-4 grid grid-cols-2`
- Esquerda: SVG garrafa (`w-24 h-40 mx-auto relative`) com fill dinâmico `(water / 2000) * 100` (cap 100%). Cor: `#919D85` se >=2000, `#8E88A3` se <2000. Transição `duration-500 ease-in-out`
- Clique em botões (+100/+300/+500) → `animate-garrafa-balanco` por 600ms
- Direita: `X / 2000 ml` (`text-[#81785A] text-2xl font-serif`). Se >2000: `animate-pulse text-[#919D85] font-bold`
- Botões: `bg-[#C496A1] text-white py-1.5 rounded-full text-sm font-semibold active:scale-95 transition-all` com `aria-label`

### Cards Remédio, Care, Exercício
- Container: `flex justify-between items-center bg-white p-4 rounded-xl border border-[#EBE1C6] mb-3`
- Toggle pílula: "Não" (bg-gray-200) / "Sim" (bg-[#919D85] text-white) — `aria-label="Marcar {nome} como concluído"`
- Input expansível: `transition-all duration-300 ease-in-out overflow-hidden` + `max-h-0 opacity-0` / `max-h-24 opacity-100 mt-2 pt-2 border-t border-gray-100`
- Input: `border-[#8E88A3] focus:border-[#8E88A3] w-full p-2 rounded-lg border`

### Card Refeições
- Formulário inline: input descrição + input kcal (number) + botão `+` circular (`bg-[#C496A1] text-white rounded-full p-2`)
- Lista: `[Hora] Descrição - XX kcal` + ícone `Trash2` (Lucide, cor `#C496A1`, `aria-label="Remover refeição"`)
- Total: `Total Consumido: XXXX kcal` — `font-serif text-[#81785A] font-bold`
- **Nunca usar `dangerouslySetInnerHTML`** — regra `react/no-danger` como error no ESLint

---

## Stage 7: Tela 2 — Calendário/Histórico (`src/components/CalendarView.tsx`)
**Responsável:** UI Engineer

- Grade: `grid grid-cols-7 gap-1 text-center font-sans p-4 bg-white rounded-2xl border border-[#EBE1C6]`
- Hoje: `ring-4 ring-[#81785A] ring-offset-2 font-bold z-10`
- Dia perfeito (water>=2000 + meds + care + exercise): `bg-[#919D85] text-white`
- Dia parcial (algum dado, checklist incompleto): borda `border border-[#C496A1] bg-white`
- Vazio: sem destaque
- Click → atualiza `selectedDate` + navega para Dashboard
- `aria-label` em cada célula: `"Dia {X} de {mês}"`

---

## Stage 8: Tela 3 — Analytics (`src/components/Analytics.tsx`)
**Responsável:** UI Engineer

- Filtro: 3 botões pílula `[7 Dias] [30 Dias] [1 Ano]` — selecionado: `bg-[#C496A1] text-white`
- Scroll vertical livre, containers `h-[260px]`

### Gráfico de Peso (LineChart)
- Linha: `stroke="#C496A1" strokeWidth={3}`
- `<ReferenceLine label="Meta: 70kg" stroke="#81785A" strokeDasharray="4 4" y={70} />`

### Gráfico de Água (BarChart)
- Barra cor: `fill="#919D85"` se >=2000, `fill="#8E88A3"` se <2000 (função no `cell`)
- `<ReferenceLine y={2000} stroke="#81785A" strokeDasharray="4 4" />`

### Gráfico de Consistência (AreaChart)
- Eixo Y: 0-3 (hábitos marcados como "Sim")
- Cor: `#8E88A3` com opacidade reduzida

---

## Stage 9: Tela 4 — Configurações + PWA Modal (`src/components/Settings.tsx`)
**Responsável:** UI Engineer

### Configurações
- `space-y-4`
- Botões: `w-full flex items-center justify-between p-4 bg-[#EBE1C6]/40 rounded-xl border border-[#EBE1C6] text-[#81785A] font-medium`
- "Exportar Backup" → `exportData()`
- "Importar Backup" → `<input type="file" accept=".json" hidden>` + label → `importData(file)`

### Mini Modal PWA
- Gatilho: `canInstall` do `usePWA` + estado de dispensa
- Animação: `fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl p-6 shadow-[0_-10px_25px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-500 translate-y-0`
- **Android/Chrome:** Logo (`h-12`) + botão "Instalar App Desborocoxando" (`bg-[#C496A1] text-white`) → `triggerInstall()`
- **iOS/Safari:** Instruções visuais (ícone compartilhar + "Adicionar à Tela de Início") + botão "Entendi"
- **Acessibilidade:** `role="dialog"`, `aria-modal="true"`, foco preso no modal

---

## Stage 10: Testes, Lint e Verificação
**Responsável:** QA Tester / Sec Reviewer

- `npm run lint` — ESLint com regra `react/no-danger` como error
- `npm run typecheck` — `tsc --noEmit` com `strict: true`
- `npm audit --audit-level=high`
- Testes unitários com **Vitest**:
  - `useAppData`: ler/escrever localStorage, emptyRecord, navegação de datas
  - `usePWA`: detecção de plataforma, triggerInstall
  - `useBackup`: export/import, validação de schema com Zod
- **Acessibilidade:** `aria-label` em todos os botões, `role="dialog"` no modal, navegação por teclado

---

## Ordem de Execução Sugerida

```
Stage 1 (Setup)
  └─ Stage 2a (Types) ── Stage 2b (dateUtils)
       └─ Stage 3 (Hooks)
            └─ Stage 4 (CSS Globals)
                 └─ Stage 5 (App + Nav)
                      ├─ Stage 6 (Dashboard)
                      ├─ Stage 7 (Calendar)
                      ├─ Stage 8 (Analytics)
                      └─ Stage 9 (Settings + PWA)
                           └─ Stage 10 (Testes + Verificação)
```

Stages 6–9 podem ser paralelizados após Stage 5.

---

## Responsabilidades por Agente

| Agente | Stages |
|--------|--------|
| **state-engineer** | 1, 2a, 2b, 3 |
| **ui-engineer** | 4, 5, 6, 7, 8, 9 |
| **sec-reviewer** | 3 (validação Zod), 10 (auditoria) |
| **qa-tester** | 10 (testes) |
| **pwa-expert** | 1 (vite-plugin-pwa), 3 (usePWA), 9 (modal PWA) |
