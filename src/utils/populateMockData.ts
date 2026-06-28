import { subDays, format } from 'date-fns';
import { normalizeDate } from './dateUtils';
import type { AppDatabase, DailyRecord, Meal } from '../types';

/**
 * Utilitários de randomness para dados mockados
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Cardápio variado para simular refeições realistas
 */
const MEAL_DESCRIPTIONS = [
  'Café da manhã',
  'Pão com ovo',
  'Frutas da estação',
  'Vitamina de banana',
  'Arroz e feijão',
  'Frango grelhado',
  'Salada verde',
  'Macarrão ao sugo',
  'Lanche da tarde',
  'Iogurte natural',
  'Barra de cereal',
  'Sopa de legumes',
  'Jantar leve',
  'Peixe assado',
  'Legumes salteados',
  'Omelete de claras',
  'Café com biscoitos',
  'Açaí na tigela',
  'Sanduíche natural',
  'Abacate com granola',
  'Wrap de frango',
  'Smoothie de frutas',
  'Salada de quinoa',
  'Crepioca',
  'Tapioca com queijo',
];

/**
 * Gera uma refeição com horário e descrição realistas
 */
function generateMeal(date: Date): Meal {
  const hour = randomInt(7, 21);
  const minute = randomInt(0, 59);
  const time = format(
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      minute,
    ),
    'HH:mm',
  );
  return {
    id: `m_${format(date, 'yyyyMMdd')}_${time}_${randomInt(100, 999)}`,
    descricao: randomPick(MEAL_DESCRIPTIONS),
    kcal: randomInt(150, 800),
  };
}

/**
 * Gera um banco completo com 365 dias de dados simulados para testes.
 *
 * Características:
 * - ~88% dos dias com registro (12% vazios — testa estados vazios no calendário)
 * - Consumo de água bimodal: 65% dos dias >= 1800ml, 35% abaixo
 * - Hábitos com progressão sazonal (meds ~70%, care ~60%, exercise ~50%)
 * - Peso com tendência linear de 68kg → 65kg ao longo do ano, registrado ~40% dos dias
 * - 1-4 refeições por dia com horários e descrições variadas
 * - Observações textuais em ~30% dos hábitos marcados
 */
export function generateMockData(): AppDatabase {
  const db: AppDatabase = {};
  const today = new Date();

  const startWeight = 68.0;
  const endWeight = 65.0;

  for (let i = 0; i < 365; i++) {
    const date = subDays(today, 364 - i); // do mais antigo para hoje
    const dateKey = normalizeDate(date);

    // ~12% dias vazios — testa renderização de células vazias no calendário
    if (Math.random() < 0.12) continue;

    // Água: distribuição bimodal
    const water =
      Math.random() < 0.65
        ? randomInt(1800, 3000)
        : randomInt(300, 1500);

    const meds = {
      done: Math.random() < 0.7,
      note: Math.random() < 0.3 ? 'Tomado após café da manhã' : '',
    };
    const care = {
      done: Math.random() < 0.6,
      note: Math.random() < 0.3 ? 'Rotina noturna completa' : '',
    };
    const exercise = {
      done: Math.random() < 0.5,
      note: Math.random() < 0.3
        ? randomPick(['30 min cardio', '1h musculação', '20 min HIIT', 'Caminhada 40 min', 'Yoga 25 min'])
        : '',
    };

    // Peso: tendência linear decrescente com ruído
    const progress = i / 364; // 0 → 1
    const trendWeight = startWeight - (startWeight - endWeight) * progress;
    const weight = Math.random() < 0.4
      ? randomFloat(trendWeight - 0.5, trendWeight + 0.5)
      : null;

    // Refeições: 1-4 por dia
    const mealCount = randomInt(1, 4);
    const meals: Meal[] = Array.from({ length: mealCount }, () => generateMeal(date));

    const record: DailyRecord = {
      date: dateKey,
      water,
      meds,
      care,
      exercise,
      meals,
      weight,
    };

    db[dateKey] = record;
  }

  return db;
}
