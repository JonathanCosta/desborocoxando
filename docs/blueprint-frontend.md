# 🎨 BLUEPRINT DE EXECUÇÃO: DESBOROCOXANDO (PARTE 2/2)

**Foco:** Frontend, Design System Aplicado, Componentes, UI/UX, Microinterações e Animações CSS.

> **Instrução para o Agente de IA:** Atuando como Engenheiro de Software Frontend Sênior e Especialista em UI/UX Mobile, implemente a camada visual do aplicativo React + Tailwind baseando-se estritamente nas definições de layout, posicionamento e animações descritas abaixo. O design deve ser mobile-first restrito (máximo `max-w-md mx-auto`), gerando a experiência de um aplicativo nativo fluido.

---

## 1. Extensão de Animações no Tailwind (`src/index.css`)

Injete as seguintes regras de keyframes e transições personalizadas no arquivo global de estilos para gerenciar a animação de balanço da garrafa d'água e a expansão dos inputs ocultos:

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer utilities {
  /* Animação de Balanço da Garrafa d'Água (Slosh/Shake) */
  @keyframes balancoGarrafa {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg) scale(1.02); }
    50% { transform: rotate(4deg) scale(0.98); }
    75% { transform: rotate(-2deg); }
  }

  .animate-garrafa-balanco {
    animation: balancoGarrafa 600ms ease-in-out;
  }
  
  /* Gradiente para a paleta floral */
  .bg-floral-gradient {
    background: linear-gradient(135deg, #F7F5F0 0%, #EBE1C6 100%);
  }
}

```

---

## 2. Layout Base e Navegação (`src/App.tsx`)

A interface será envelopada em um container mobile fixo centralizado.

* **Fundo Geral do Body:** `#F7F5F0`
* **Viewport Fixo:** `w-full min-h-screen max-w-md mx-auto bg-[#F7F5F0] flex flex-col relative pb-20 shadow-xl border-x border-gray-200/50`

### Barra de Navegação Inferior (Fixed Bottom Nav)

* **Posicionamento:** `fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-[#EBE1C6] border-t border-[#81785A]/20 flex items-center justify-around px-4 z-40`
* **Estados dos Ícones (Lucide):**
* Ativo: Cor `#C496A1` (Rosa-floral), com um pequeno ponto indicador abaixo do ícone.
* Inativo: Cor `#81785A` (Ouro-escuro) com opacidade 60%.



---

## 3. Detalhamento dos Componentes de Tela

### Tela 1: Dashboard Diário (`src/components/Dashboard.tsx`)

#### Topo (Header)

* Exibir a imagem `docs/logo.png` de forma centralizada utilizando `h-16 w-auto object-contain py-2`.
* Abaixo da imagem, incluir uma faixa condicional de aviso se `selectedDate` for diferente de hoje:
* `bg-[#C496A1] text-white text-xs text-center py-1.5 font-sans flex items-center justify-center gap-2` -> *"Você está visualizando/editando o passado. [Voltar para Hoje]"* (com ação de clique que redefine a data global).



#### Card 1: Contador de Água (Mecânica com Animação)

* **Layout:** Card com fundo `#EBE1C6`, bordas arredondadas `rounded-2xl`, padding `p-4`, margem `mb-4`. Grid de 2 colunas.
* **Coluna Esquerda (A Garrafa SVG):**
* Um container de largura e altura controladas (`w-24 h-40 mx-auto relative`).
* Deve conter a silhueta em vetor de uma garrafa d'água estilizada com fundo cinza transparente. O preenchimento azul/esverdeado interno deve usar a propriedade CSS `clip-path` ou altura dinâmica indexada ao valor de `(waterTotal / 2000) * 100`.
* Se o usuário clicar em um botão de incremento, o componente aplica a classe `.animate-garrafa-balanco` por `600ms` e remove em seguida.


* **Coluna Direita (Controles):**
* Texto do contador em destaque: `text-[#81785A] text-2xl font-serif`. Exibe `X / 2000 ml`. Se `X > 2000`, adicionar efeito de pulso estático de aviso (`text-[#919D85] font-bold animate-pulse`).
* Três botões pílula empilhados verticalmente ou em grid: `+100ml`, `+300ml`, `+500ml` usando `bg-[#C496A1] text-white py-1.5 rounded-full text-sm font-semibold active:scale-95 transition-all`.



#### Cards 2, 3 e 4: Remédio, Care e Exercício Físico (Estrutura Unificada)

* **Layout:** Card flexível horizontal (`flex justify-between items-center bg-white p-4 rounded-xl border border-[#EBE1C6] mb-3`).
* **Seletor Sim/Não:** Um container de botão duplo tipo pílula integrada.
* Opção "Não" ativa: Fundo cinza neutro (`bg-gray-200 text-gray-700`).
* Opção "Sim" ativa: Transiciona suavemente para fundo `#919D85` (Verde-oliva) com texto branco.


* **Input Oculto (Animação de Expansão):**
* Ao clicar em "Sim", o app expande um container de input de texto logo abaixo.
* **Classes Tailwind obrigatórias para o container do input:** `transition-all duration-300 ease-in-out overflow-hidden`. Se fechado: `max-h-0 opacity-0`. Se aberto: `max-h-24 opacity-100 mt-2 pt-2 border-t border-gray-100`.
* O input deve possuir a cor de borda `#8E88A3` focada.



#### Card 5: Alimentação & Múltiplas Refeições

* **Formulário Inline:** Dois inputs emparelhados (`Descrição` e `Kcal`) + botão circular `+` em fundo `#C496A1`.
* **Lista de Itens:** Renderiza uma lista vertical das refeições adicionadas para o dia atual. Cada item aparece no formato: `[Hora] Descrição - XX kcal`. Ao lado direito de cada linha, exibe um ícone `Trash2` (Lucide) na cor `#C496A1` que remove o item do array no clique.
* **Totalizador:** Exibe no rodapé do card: `"Total Consumido: XXXX kcal"` com a tipografia `font-serif text-[#81785A] font-bold`.

---

### Tela 2: Histórico com Calendário (`src/components/CalendarView.tsx`)

* **Layout da Grade:** Grade rígida de 7 colunas (`grid grid-cols-7 gap-1 text-center font-sans p-4 bg-white rounded-2xl border border-[#EBE1C6]`).
* **Destaque do Dia Atual (Hoje):** A célula correspondente ao dia de hoje no calendário deve receber as classes `ring-4 ring-[#81785A] ring-offset-2 font-bold z-10`.
* **Lógica Visual de Cores e Conclusão:**
* *Dia Perfeito:* Se no respectivo dia o histórico registrar `water >= 2000`, `meds.done === true`, `care.done === true` e `exercise.done === true`, a célula numérica recebe fundo sólido `#919D85` e texto branco.
* *Dia Parcial:* Se houver qualquer preenchimento, mas sem atingir o checklist completo, o dia recebe uma borda fina na cor `#C496A1` e fundo branco.


* **Comportamento de Clique:** Clicar em qualquer célula de data dispara a mutação do estado `selectedDate` para a data clicada e altera o índice da tela ativa para a **Tela 1**.

---

### Tela 3: Hub de Gráficos Correlacionados (`src/components/Analytics.tsx`)

* **Filtro Superior:** Grupo de 3 botões pílula centralizados horizontalmente: `[ 7 Dias ] [ 30 Dias ] [ 1 Ano ]`. O botão selecionado assume a cor de fundo `#C496A1` e texto branco.
* **Comportamento de Rolagem (Scroll Mobile):** A tela deve permitir scroll vertical livre para acomodar os 3 gráficos empilhados sem que fiquem espremidos. Cada gráfico deve ficar dentro de um container com altura fixa de `h-[260px]`.
* **Configuração Técnica dos Gráficos (Recharts):**
1. **Gráfico de Peso (LineChart):**
* Linha principal na cor `#C496A1`, espessura `strokeWidth={3}`.
* Injetar o componente `<ReferenceLine label="Meta: 70kg" stroke="#81785A" strokeDasharray="4 4" y="{70}"/>` para exibir de forma estática e legível a linha de destino.


2. **Gráfico de Água (BarChart):**
* Eixo X (Datas), Eixo Y (Volume em ml).
* Cada barra (`<Bar/>`) deve possuir tratamento de cor em tempo real: se o valor daquele nó for `>= 2000`, renderiza com a cor `#919D85`, caso contrário, renderiza com a cor `#8E88A3`.
* Injetar uma linha de referência horizontal simples em `y={2000}`.


3. **Gráfico de Consistência de Hábitos (Stacked Bar ou AreaChart):**
* Exibe no eixo Y o número somado de hábitos marcados como "Sim" no dia (métrica variando de 0 a 3). Área preenchida ou barra na cor `#8E88A3` com opacidade reduzida.





---

### Tela 4: Configurações e Modal Inteligente PWA (`src/components/Settings.tsx`)

* **Layout:** Lista vertical limpa com espaçamento uniforme (`space-y-4`). Botões grandes para manipulação de arquivos.
* **Estilização dos Botões de Ação:** `w-full flex items-center justify-between p-4 bg-[#EBE1C6]/40 rounded-xl border border-[#EBE1C6] text-[#81785A] font-medium`.

#### O Mini Modal PWA (Slide-up Sheet)

* **Gatilho Visual:** Se o hook `usePWA` retornar que o app está rodando no navegador e possui o prompt capturado ou está no iOS (não-standalone), injete este componente flutuante na raiz do projeto.
* **Animação de Entrada:** `fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl p-6 shadow-[0_-10px_25px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-500 translate-y-0`.
* **Condicional de Renderização Interna (Multi-OS UI):**
* *Se Android/Chrome:* Renderizar a logo `docs/logo.png` pequena (`h-12`) ao lado de um texto chamativo e um botão proeminente: `"Instalar App Desborocoxando" (Fundo #C496A1)`. O clique executa a função nativa `triggerInstall()`.
* *Se iOS/Safari:* Omitir qualquer botão de instalação automatizada. Exibir um bloco de instrução visual estilizado com fundo `#F7F5F0` e bordas arredondadas contendo o texto: *"Para instalar no seu iPhone, toque no ícone de compartilhamento (seta para cima) do Safari e depois selecione 'Adicionar à Tela de Início'."* Pode incluir um botão secundário de fechar ("Entendi").