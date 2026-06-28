import { useState, useMemo, useCallback } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  addMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppDatabase } from '../types';
import { normalizeDate, today } from '../utils/dateUtils';

interface CalendarViewProps {
  db: AppDatabase;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DAYS_OF_WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getDayStatus(dateStr: string, db: AppDatabase): 'perfect' | 'partial' | 'empty' {
  const record = db[dateStr];
  if (!record) return 'empty';
  const { water, meds, care, exercise } = record;
  if (water >= 2000 && meds.done && care.done && exercise.done) return 'perfect';
  if (water > 0 || meds.done || care.done || exercise.done || record.meals.length > 0) return 'partial';
  return 'empty';
}

function CalendarView({ db, selectedDate, onSelectDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const perfectCount = useMemo(() => {
    return days.filter((day) => {
      if (!isSameMonth(day, currentMonth)) return false;
      return getDayStatus(normalizeDate(day), db) === 'perfect';
    }).length;
  }, [days, currentMonth, db]);

  const todayStr = today();

  const prevMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  return (
    <div className="p-4">
      {/* Month header */}
      <div className="flex justify-between items-center mb-4 px-2">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Mês anterior"
          className="p-1 text-[#922d4d] hover:text-[#c47590] transition-colors duration-300 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[#922d4d] font-semibold text-base">
          {capitalize(format(currentMonth, 'MMMM yyyy', { locale: ptBR }))}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Próximo mês"
          className="p-1 text-[#922d4d] hover:text-[#c47590] transition-colors duration-300 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center font-sans p-4 bg-white rounded-2xl border border-[#cd8ea1]/30">
        {/* Day-of-week headers */}
        {DAYS_OF_WEEK.map((day, index) => (
          <div key={`${day}-${index}`} className="text-xs text-[#cd8ea1] font-medium py-1">
            {day}
          </div>
        ))}

        {/* Date cells */}
        {days.map((day) => {
          const dateStr = normalizeDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const status = getDayStatus(dateStr, db);

          let cellClasses =
            'w-9 h-9 flex items-center justify-center text-sm transition-all duration-300 ease-in-out';

          if (!isCurrentMonth) {
            cellClasses += ' text-gray-300';
          } else {
            cellClasses += ' cursor-pointer active:scale-95';

            if (isToday) {
              cellClasses += ' ring-4 ring-[#922d4d] ring-offset-2 font-bold z-10 rounded-full';
            }

            if (status === 'perfect') {
              cellClasses += ' bg-[#c47590] text-white rounded-full';
            } else if (status === 'partial') {
              cellClasses += ' border border-[#cd8ea1] bg-white rounded-full';
            }
          }

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => {
                if (isCurrentMonth) {
                  onSelectDate(dateStr);
                }
              }}
              aria-label={isCurrentMonth ? format(day, "dd 'de' MMMM", { locale: ptBR }) : ''}
              aria-current={isSelected ? 'date' : undefined}
              className={cellClasses}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Resumo do Mês */}
      <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm shadow-[#922d4d]/5">
        <h3 className="text-sm font-semibold text-[#922d4d] mb-2">
          Resumo do Mês
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#c47590]">
            {perfectCount}
          </span>
          <span className="text-sm text-[#922d4d]">dias perfeitos</span>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
