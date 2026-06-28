import { useState, useMemo } from 'react';
import { Scale } from 'lucide-react';
import { subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import type { AppDatabase } from '../types';
import { today, normalizeDate } from '../utils/dateUtils';

type Range = '7days' | '30days';

interface AnalyticsProps {
  db: AppDatabase;
  waterGoal: number;
  weightGoal: number;
}

const ranges: { label: string; value: Range }[] = [
  { label: '7 Dias', value: '7days' },
  { label: '30 Dias', value: '30days' },
];

function HabitTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { meds: boolean; care: boolean; exercise: boolean } }> }) {
  if (!active || !payload?.length) return null;
  const { meds, care, exercise } = payload[0].payload;
  const habitsDone = [
    meds && 'Remédios',
    care && 'Care',
    exercise && 'Exercício',
  ].filter(Boolean);
  return (
    <div className="bg-[#f7e1e3] border border-[#cd8ea1]/30 rounded-lg p-2 text-xs text-[#922d4d] shadow-sm">
      {habitsDone.length > 0
        ? `Hábitos concluídos: ${habitsDone.join(', ')}`
        : 'Nenhum hábito registrado'}
    </div>
  );
}

export default function Analytics({ db, waterGoal, weightGoal }: AnalyticsProps) {
  const [range, setRange] = useState<Range>('7days');

  const RANGE_TO_DAYS: Record<Range, number> = { '7days': 7, '30days': 30 };

  const endDate = today();
  const startDate = normalizeDate(subDays(new Date(), RANGE_TO_DAYS[range]));

  const entries = useMemo(
    () =>
      Object.entries(db)
        .filter(([date]) => date >= startDate && date <= endDate)
        .sort(([a], [b]) => a.localeCompare(b)),
    [db, startDate, endDate],
  );

  const chartData = useMemo(
    () =>
      entries.map(([date, record]) => ({
        date: format(new Date(date), 'dd/MM', { locale: ptBR }),
        weight: record.weight,
        water: record.water,
        meds: record.meds.done,
        care: record.care.done,
        exercise: record.exercise.done,
        habits:
          (record.meds.done ? 1 : 0) +
          (record.care.done ? 1 : 0) +
          (record.exercise.done ? 1 : 0),
      })),
    [entries],
  );

  const hasWeightData = chartData.some((d) => d.weight !== null);

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-12rem)] px-1">
      {/* Filtro Superior */}
      <div className="flex justify-center gap-2 mb-6">
        {ranges.map(({ label, value }) => {
          const isActive = range === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              aria-label={`Filtrar últimos ${label.toLowerCase()}`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out ${
                isActive
                  ? 'bg-[#c47590] text-white'
                  : 'bg-gray-100 text-[#922d4d]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Gráfico 1: Peso (LineChart) */}
      <div className="bg-white rounded-2xl p-4 border border-[#cd8ea1]/30 mb-6">
        <h3 className="text-[#922d4d] font-semibold text-sm mb-3">
          Peso (kg)
        </h3>
        {hasWeightData ? (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#cd8ea1" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#922d4d' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cd8ea1' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#922d4d' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f7e1e3',
                    border: '1px solid #cd8ea1',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine
                  y={weightGoal}
                  stroke="#922d4d"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  label={{
                    value: `Meta: ${weightGoal}kg`,
                    fill: '#922d4d',
                    fontSize: 10,
                    position: 'right',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  connectNulls={true}
                  name="Peso"
                  stroke="#c47590"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#c47590' }}
                  activeDot={{ r: 6, fill: '#c47590' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-[#cd8ea1]">
            <Scale className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhum registro de peso disponível</p>
          </div>
        )}
      </div>

      {/* Gráfico 2: Água (BarChart) */}
      <div className="bg-white rounded-2xl p-4 border border-[#cd8ea1]/30 mb-6">
        <h3 className="text-[#922d4d] font-semibold text-sm mb-3">
          Água (ml)
        </h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#cd8ea1" strokeOpacity={0.1} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#922d4d' }}
                tickLine={false}
                axisLine={{ stroke: '#cd8ea1' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#922d4d' }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: 'ml',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#922d4d',
                  fontSize: 10,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f7e1e3',
                  border: '1px solid #cd8ea1',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine
                y={waterGoal}
                stroke="#922d4d"
                strokeWidth={2}
                strokeDasharray="6 4"
                label={{
                  value: `Meta: ${waterGoal}ml`,
                  fill: '#922d4d',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              <Bar dataKey="water" name="Água" radius={[8, 8, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={
                      chartData[index].water >= waterGoal ? '#c47590' : '#cd8ea1'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 3: Consistência de Hábitos (AreaChart) */}
      <div className="bg-white rounded-2xl p-4 border border-[#cd8ea1]/30 mb-6">
        <h3 className="text-[#922d4d] font-semibold text-sm mb-3">
          Consistência de Hábitos
        </h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#cd8ea1" strokeOpacity={0.1} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#922d4d' }}
                tickLine={false}
                axisLine={{ stroke: '#cd8ea1' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#922d4d' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 3]}
                ticks={[0, 1, 2, 3]}
              />
              <Tooltip content={<HabitTooltip />} />
              <Area
                type="monotone"
                dataKey="habits"
                name="Hábitos"
                stroke="#cd8ea1"
                fill="#cd8ea1"
                fillOpacity={0.3}
                strokeWidth={2}
                dot={{ r: 3, fill: '#cd8ea1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
