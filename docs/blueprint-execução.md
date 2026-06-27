# 🏗️ BLUEPRINT DE EXECUÇÃO: DESBOROCOXANDO (PARTE 1/2)

**Foco:** Configuração, Estrutura de Arquivos, Modelagem de Dados (Local) e Lógica de Negócio (Hooks).

> **Instrução para o Agente de IA:** Você está atuando como Engenheiro de Software Sênior. Sua tarefa nesta etapa é inicializar o projeto, instalar as dependências exatas solicitadas, criar a estrutura de pastas e implementar toda a lógica de dados, tipagem e gerenciamento de estado global. Não crie interfaces visuais nesta etapa, concentre-se na base arquitetural.

## 1. Setup do Projeto e Dependências

A aplicação será um PWA Offline-first. Inicialize o projeto utilizando Vite + React + TypeScript. Utilize estritamente as versões listadas abaixo no `package.json` para evitar conflitos de sintaxe ou alucinações.

**Comando Base de Inicialização:**

```bash
npm create vite@latest desborocoxando -- --template react-ts
```

**Dependências Obrigatórias (com versões fixadas):**

```bash
npm install react@^18.3.0 react-dom@^18.3.0
npm install tailwindcss@^3.4.0 postcss autoprefixer
npm install recharts@^2.12.0
npm install lucide-react@^0.350.0
npm install date-fns # Para manipulação segura de datas (formatos YYYY-MM-DD)
npm install -D vite-plugin-pwa # Para geração do Service Worker

```

## 2. Configuração do PWA (`vite.config.ts`)

Configure o `vite-plugin-pwa` para gerar o manifesto e habilitar cache offline.

* **Nome do App:** Desborocoxando
* **Cor de Fundo / Tema:** `#F7F5F0` / `#C496A1`
* **Estratégia:** `generateSW` com `registerType: 'autoUpdate'`.
* O arquivo de logo fornecido (`docs/logo.png`) os icones para o pwa e favicon estão no diretorio `docs/pwaicons`,  deverá ser usado na pasta `public`.

## 3. Estrutura de Pastas

Crie a seguinte árvore de diretórios dentro de `src/`:

```text
src/
 ┣ assets/          # Logo e SVGs (garrafa d'água)
 ┣ components/      # (Será detalhado na Parte 2)
 ┣ hooks/           # Lógica de estado e ciclo de vida
 ┃ ┣ useAppData.ts  # Gerencia a leitura/escrita no localStorage
 ┃ ┣ usePWA.ts      # Gerencia o modal inteligente de instalação
 ┃ ┗ useBackup.ts   # Lógica de exportar/importar .json
 ┣ types/           # Interfaces TypeScript globais
 ┃ ┗ index.ts       # Modelo de dados (Schema)
 ┣ utils/           # Funções auxiliares
 ┃ ┗ dateUtils.ts   # Formatação de datas para "YYYY-MM-DD"
 ┣ App.tsx          # Ponto de entrada do roteamento de telas
 ┗ index.css        # Configurações do Tailwind e Keyframes customizados

```

## 4. Modelagem de Dados (Schema - `src/types/index.ts`)

O banco de dados é inteiramente baseado em `localStorage`. A chave principal no storage será `desborocoxando_data`. O formato do JSON armazenado será um dicionário onde a chave é a data em formato `YYYY-MM-DD`.

Implemente as seguintes interfaces:

```typescript
export interface Meal {
  id: string; // uuid ou timestamp
  hora: string; // formato "HH:mm"
  descricao: string;
  kcal: number;
}

export interface DailyRecord {
  date: string; // "YYYY-MM-DD"
  water: number; // Volume em ml, ex: 2300 (mesmo que passe da meta)
  meds: { done: boolean; note: string }; // note é o input oculto
  care: { done: boolean; note: string };
  exercise: { done: boolean; note: string };
  meals: Meal[];
  weight: number | null; // Se registrado no dia, ex: 72.4
}

// O estado global no LocalStorage será este Record:
export type AppDatabase = Record<string, DailyRecord>;

```

## 5. Lógica de Estado e Persistência (`src/hooks/useAppData.ts`)

Crie um hook customizado que gerencie o estado da aplicação simulando um banco de dados local.

* **Estado Global:** Deve manter a `selectedDate` (data que o usuário está visualizando/editando, formato "YYYY-MM-DD") e o `db` (todo o histórico).
* **Lógica de Navegação no Tempo:** Se o usuário clicar em um dia no calendário, atualiza a `selectedDate`. Os componentes do Dashboard devem ler os dados de `db[selectedDate]` e NÃO da data atual do sistema.
* **Criação de Dia Padrão:** Se `db[selectedDate]` for `undefined`, inicialize um objeto `DailyRecord` vazio para aquela data (água=0, booleanos=false, meals=[], weight=null) e salve.

## 6. Lógica de PWA Inteligente (`src/hooks/usePWA.ts`)

Implemente um hook que escute eventos do sistema e determine qual versão do "Mini Modal" renderizar.

* **Regra 1:** Crie um estado `installPromptEvent` inicialmente nulo.
* **Regra 2 (Android/Chrome):** Adicione um event listener para `beforeinstallprompt`. Previna o comportamento padrão (`e.preventDefault()`) e salve o evento em `installPromptEvent`. Se o usuário clicar no botão "Instalar" da UI, chame `installPromptEvent.prompt()`.
* **Regra 3 (iOS):** Crie um boolean `isIOS` detectando o `navigator.userAgent` (`/iPad|iPhone|iPod/.test(navigator.userAgent)` e `!window.MSStream`). Crie um boolean `isStandalone` detectando se `window.matchMedia('(display-mode: standalone)').matches` ou `navigator.standalone` é true.
* Retorne os estados: `isIOS`, `isStandalone`, e a função `triggerInstall`.

## 7. Sistema de Backup (`src/hooks/useBackup.ts`)

Funções puras para garantir a portabilidade dos dados:

* **`exportData()`:** Lê a chave `desborocoxando_data` do `localStorage`, transforma em `Blob` tipo `application/json`, cria um objeto URL temporário (`URL.createObjectURL`), anexa a uma tag `<a>` oculta e clica nela disparando o download do arquivo `desborocoxando-backup.json`.
* **`importData(file: File)`:** Recebe o arquivo do input, usa `FileReader` para ler como texto. Faz o parse do JSON. Faz uma validação simples para ver se as chaves têm formato de data. Se sim, sobrescreve o `localStorage` e recarrega o estado em memória (ou força o reload da página para garantir a hidratação dos dados).