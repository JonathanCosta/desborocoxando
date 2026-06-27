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
}

const CARD_CONFIGS: { key: 'meds' | 'care' | 'exercise'; label: string }[] = [
  { key: 'meds', label: '💊 Remédios' },
  { key: 'care', label: '🧴 Care' },
  { key: 'exercise', label: '🏃 Exercício' },
];

export default function Dashboard({
  selectedDate,
  setSelectedDate,
  getCurrentRecord,
  updateRecord,
}: DashboardProps) {
  const record = getCurrentRecord();
  const isToday = selectedDate === today();
  const clipId = useId();

  const [isBottleAnimating, setIsBottleAnimating] = useState(false);
  const [newMealDesc, setNewMealDesc] = useState('');
  const [newMealKcal, setNewMealKcal] = useState('');

  // Water bottle calculations
  const waterPercent = Math.min(record.water / 2000, 1);
  const fillHeight = waterPercent * 110;
  const fillY = 168 - fillHeight;
  const waterColor = record.water >= 2000 ? '#919D85' : '#8E88A3';

  const handleAddWater = (ml: number) => {
    updateRecord({ water: record.water + ml });
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
    const meal: Meal = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      hora: format(new Date(), 'HH:mm'),
      descricao: newMealDesc.trim(),
      kcal: Number(newMealKcal),
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
        <div className="bg-[#C496A1] text-white text-xs text-center py-1.5 flex items-center justify-center gap-2">
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
      <div className="bg-[#EBE1C6] rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Garrafa SVG */}
          <div
            className={`w-24 h-40 mx-auto relative ${
              isBottleAnimating ? 'animate-garrafa-balanco' : ''
            }`}
          >
            <svg viewBox="0 0 100 180" className="w-full h-full">
              <defs>
                <clipPath id={clipId}>
                  <path d="M35,32 L35,48 Q31,51 31,58 L31,152 Q31,168 50,168 Q69,168 69,152 L69,58 Q69,51 65,48 L65,32 Z" />
                </clipPath>
              </defs>
              {/* Água (preenchimento dinâmico) */}
              <rect
                x="28"
                y={fillY}
                width="44"
                height={fillHeight}
                fill={waterColor}
                clipPath={`url(#${clipId})`}
                className="transition-all duration-500 ease-in-out"
              />
              {/* Contorno da garrafa */}
              <path
                d="M35,32 L35,48 Q31,51 31,58 L31,152 Q31,168 50,168 Q69,168 69,152 L69,58 Q69,51 65,48 L65,32 Z"
                fill="none"
                stroke="#81785A"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Tampa */}
              <rect
                x="34"
                y="16"
                width="32"
                height="18"
                rx="5"
                fill="#C496A1"
              />
              <line
                x1="40"
                y1="21"
                x2="60"
                y2="21"
                stroke="#F7F5F0"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Controles Água */}
          <div className="flex flex-col justify-center gap-3">
            <div
              className={`text-[#81785A] text-2xl font-serif ${
                record.water > 2000
                  ? 'animate-pulse text-[#919D85] font-bold'
                  : ''
              }`}
            >
              {record.water} / 2000 ml
            </div>
            {[100, 300, 500].map((ml) => (
              <button
                key={ml}
                type="button"
                onClick={() => handleAddWater(ml)}
                aria-label={`Adicionar ${ml}ml`}
                className="bg-[#C496A1] text-white py-1.5 rounded-full text-sm font-semibold active:scale-95 transition-all w-full"
              >
                +{ml}ml
              </button>
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
            className="bg-white p-4 rounded-2xl shadow-sm shadow-[#81785A]/5 mb-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[#81785A]">
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
                    item.done ? 'bg-[#919D85]' : 'bg-gray-100'
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
                className="w-full p-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#C496A1] focus:ring-1 focus:ring-[#C496A1] focus:outline-none text-sm transition-all"
              />
            </div>
          </div>
        );
      })}

      {/* Card Refeições */}
      <div className="bg-white rounded-2xl p-5 shadow-sm shadow-[#81785A]/5 mb-20">
        <h3 className="text-sm font-semibold text-[#81785A] mb-4">
          🍽️ Refeições
        </h3>

        {/* Formulário inline */}
        <div className="flex gap-3 items-end mb-4">
          <input
            type="text"
            value={newMealDesc}
            onChange={(e) => setNewMealDesc(e.target.value)}
            placeholder="O que comeu?"
            className="flex-1 p-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#C496A1] focus:ring-1 focus:ring-[#C496A1] focus:outline-none text-sm transition-all"
          />
          <input
            type="number"
            value={newMealKcal}
            onChange={(e) => setNewMealKcal(e.target.value)}
            placeholder="kcal"
            className="w-20 p-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#C496A1] focus:ring-1 focus:ring-[#C496A1] focus:outline-none text-sm transition-all"
          />
          <button
            type="button"
            onClick={handleAddMeal}
            aria-label="Adicionar refeição"
            className="bg-[#C496A1] text-white rounded-full p-2 hover:bg-[#b0808c] active:scale-95 transition-all"
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
                <span className="text-sm text-[#81785A]">
                  [{meal.hora}] {meal.descricao} - {meal.kcal} kcal
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveMeal(meal.id)}
                  aria-label="Remover refeição"
                >
                  <Trash2 className="w-4 h-4 text-[#C496A1]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="font-serif text-[#81785A] font-bold text-right mt-3">
          Total Consumido: {totalKcal} kcal
        </div>
      </div>

      {/* Card Peso */}
      <div className="bg-white rounded-2xl shadow-sm shadow-[#81785A]/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5 text-[#8E88A3]" />
          <span className="text-sm font-semibold text-[#81785A]">
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
            className="w-20 p-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-[#C496A1] focus:ring-1 focus:ring-[#C496A1] focus:outline-none text-sm text-right transition-all"
          />
          <span className="text-sm text-[#81785A] font-medium">kg</span>
        </div>
      </div>
    </div>
  );
}
