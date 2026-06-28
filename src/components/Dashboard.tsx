import { useState, useId } from 'react';
import { Trash2, Scale } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { today } from '../utils/dateUtils';
import type { DailyRecord, Meal } from '../types';

interface DashboardProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  getCurrentRecord: () => DailyRecord;
  updateRecord: (partial: Partial<DailyRecord>) => void;
  waterGoal: number;
  updateWater: (delta: number) => void;
}

const CARD_CONFIGS: { key: 'meds' | 'care' | 'exercise'; label: string }[] = [
  { key: 'meds', label: 'Remédios' },
  { key: 'care', label: 'Care' },
  { key: 'exercise', label: 'Exercício' },
];

export default function Dashboard({
  selectedDate,
  setSelectedDate,
  getCurrentRecord,
  updateRecord,
  waterGoal,
  updateWater,
}: DashboardProps) {
  const record = getCurrentRecord();
  const isToday = selectedDate === today();
  const clipId = useId();

  const [isBottleAnimating, setIsBottleAnimating] = useState(false);
  const [newMealDesc, setNewMealDesc] = useState('');
  const [newMealKcal, setNewMealKcal] = useState('');

  // Water bottle calculations
  const waterPercent = Math.min(record.water / waterGoal, 1);
  const fillHeight = waterPercent * 110;
  const fillY = 168 - fillHeight;
  const waterColor = record.water >= waterGoal ? '#922d4d' : '#c47590';

  const handleWaterChange = (delta: number) => {
    updateWater(delta);
    setIsBottleAnimating(true);
    setTimeout(() => setIsBottleAnimating(false), 600);
  };

  const handleToggle = (key: 'meds' | 'care' | 'exercise', value: boolean) => {
    updateRecord({ [key]: { ...record[key], done: value } });
  };

  const handleNoteChange = (key: 'meds' | 'care' | 'exercise', note: string) => {
    updateRecord({ [key]: { ...record[key], note } });
  };

  const totalKcal = record.meals.reduce((sum, m) => sum + m.kcal, 0);

  const handleAddMeal = () => {
    if (!newMealDesc.trim() || !newMealKcal) return;
    const kcalNum = Math.max(0, Number(newMealKcal));
    const meal: Meal = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      descricao: newMealDesc.trim(),
      kcal: kcalNum,
    };
    updateRecord({ meals: [...record.meals, meal] });
    setNewMealDesc('');
    setNewMealKcal('');
  };

  const handleRemoveMeal = (id: string) => {
    updateRecord({ meals: record.meals.filter((m) => m.id !== id) });
  };

  return (
    <div className="space-y-4">
      {/* Faixa de aviso de data passada */}
      {!isToday && (
        <div className="bg-[#c47590] text-white text-xs text-center py-1.5 flex items-center justify-center gap-2">
          <span>Você está visualizando {format(new Date(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.</span>
          <button
            type="button"
            onClick={() => setSelectedDate(today())}
            className="underline font-semibold"
          >
            Voltar para Hoje
          </button>
        </div>
      )}

      {/* Card Água */}
      <div className="bg-white rounded-2xl p-4 mb-4 border border-[#cd8ea1]/30 shadow-sm">
        {/* Contador centralizado no topo */}
        <div
          className={`text-center w-full mb-4 text-2xl font-advent whitespace-nowrap ${
            record.water > waterGoal
              ? 'animate-pulse text-[#922d4d] font-bold'
              : 'text-[#922d4d]'
          }`}
        >
          {record.water} / {waterGoal} ml
        </div>

        {/* Linha inferior: garrafa + controles lado a lado */}
        <div className="grid grid-cols-2 gap-4 items-center">
          {/* Garrafa SVG */}
          <div
            className={`w-24 h-full max-h-[120px] mx-auto relative ${
              isBottleAnimating ? 'animate-garrafa-balanco' : ''
            }`}
          >
            <svg viewBox="0 0 100 180" className="w-full h-full">
              <defs>
                <clipPath id={clipId}>
                  <path d="M35,32 L35,48 Q31,51 31,58 L31,152 Q31,168 50,168 Q69,168 69,152 L69,58 Q69,51 65,48 L65,32 Z" />
                </clipPath>
              </defs>
              <rect
                x="28"
                y={fillY}
                width="44"
                height={fillHeight}
                fill={waterColor}
                clipPath={`url(#${clipId})`}
                className="transition-all duration-500 ease-in-out"
              />
              <path
                d="M35,32 L35,48 Q31,51 31,58 L31,152 Q31,168 50,168 Q69,168 69,152 L69,58 Q69,51 65,48 L65,32 Z"
                fill="none"
                stroke="#922d4d"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <rect x="34" y="16" width="32" height="18" rx="5" fill="#c47590" />
              <line x1="40" y1="21" x2="60" y2="21" stroke="#f7e1e3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Controles Água */}
          <div className="flex flex-col justify-center gap-3">
            {[100, 300, 500].map((ml) => (
              <div key={ml} className="flex items-center justify-between w-full max-w-[160px] mx-auto bg-[#f7e1e3]/30 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => handleWaterChange(-ml)}
                  aria-label={`Remover ${ml}ml`}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f7e1e3] text-[#922d4d] font-bold shrink-0 active:scale-95 transition-all"
                >
                  −
                </button>
                <span className="text-sm text-[#922d4d] font-bold text-center w-full">{ml}ml</span>
                <button
                  type="button"
                  onClick={() => handleWaterChange(ml)}
                  aria-label={`Adicionar ${ml}ml`}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#c47590] text-white font-bold shrink-0 active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cards: Meds, Care, Exercise */}
      {CARD_CONFIGS.map(({ key, label }) => {
        const item = record[key];
        return (
          <div
            key={key}
            className="bg-white p-4 rounded-2xl shadow-sm shadow-[#922d4d]/5 mb-3"
          >
            <div className="flex justify-between items-center">
              <span className="uppercase text-xs font-bold tracking-wider text-[#922d4d]">
                {label}
              </span>
              {/* Switch minimalista */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => handleToggle(key, !item.done)}
                  aria-label={
                    item.done
                      ? `Marcar ${label} como não feito`
                      : `Marcar ${label} como feito`
                  }
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 ease-out ${
                    item.done ? 'bg-[#c47590]' : 'bg-gray-100'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 ease-out ${
                      item.done ? 'left-7' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                item.done
                  ? 'max-h-24 opacity-100 mt-3 pt-3 border-t border-gray-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <input
                type="text"
                value={item.note}
                onChange={(e) => handleNoteChange(key, e.target.value)}
                placeholder="Observações..."
                className="w-full p-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#c47590] focus:ring-1 focus:ring-[#c47590] focus:outline-none text-sm transition-all"
              />
            </div>
          </div>
        );
      })}

      {/* Card Peso */}
      <div className="bg-white rounded-2xl shadow-sm shadow-[#922d4d]/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5 text-[#cd8ea1]" />
          <span className="uppercase text-xs font-bold tracking-wider text-[#922d4d]">
            Peso de Hoje
          </span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="0.0"
            value={record.weight ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val && parseFloat(val) < 0) return; // impede negativo
              updateRecord({
                weight: val ? parseFloat(val) : null,
              });
            }}
            className="w-20 p-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#c47590] focus:ring-1 focus:ring-[#c47590] focus:outline-none text-sm text-right transition-all"
          />
          <span className="text-sm text-[#922d4d] font-medium">kg</span>
        </div>
      </div>

      {/* Card Refeições */}
      <div className="bg-white rounded-2xl p-5 shadow-sm shadow-[#922d4d]/5 mb-20">
        <h3 className="uppercase text-xs font-bold tracking-wider text-[#922d4d] mb-4">
          Refeições
        </h3>

        {/* Formulário inline */}
        <div className="flex gap-3 items-end mb-4">
          <input
            type="text"
            value={newMealDesc}
            onChange={(e) => setNewMealDesc(e.target.value)}
            placeholder="O que comeu?"
            className="flex-1 p-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#c47590] focus:ring-1 focus:ring-[#c47590] focus:outline-none text-sm transition-all"
          />
          <input
            type="number"
            min="0"
            value={newMealKcal}
            onChange={(e) => setNewMealKcal(e.target.value)}
            placeholder="kcal"
            className="w-20 p-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#c47590] focus:ring-1 focus:ring-[#c47590] focus:outline-none text-sm transition-all"
          />
          <button
            type="button"
            onClick={handleAddMeal}
            aria-label="Adicionar refeição"
            className="bg-[#c47590] text-white rounded-full p-2 hover:bg-[#a86278] active:scale-95 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Lista de refeições */}
        {record.meals.length > 0 && (
          <div>
            {record.meals.map((meal) => (
              <div
                key={meal.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
              >
                <span className="text-sm text-[#922d4d]">
                  {meal.descricao} - {meal.kcal} kcal
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveMeal(meal.id)}
                  aria-label="Remover refeição"
                >
                  <Trash2 className="w-4 h-4 text-[#c47590]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="font-advent text-[#922d4d] font-bold text-right mt-3">
          Total Consumido: {totalKcal} kcal
        </div>
      </div>

    </div>
  );
}
