import { useState, useMemo } from 'react';
import { Scale } from 'lucide-react';
import { subDays, format } from 'date-fns';
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

type Range = 7 | 30 | 365;

interface AnalyticsProps {
  db: AppDatabase;
}

const ranges: { label: string; value: Range }[] = [
  { label: '7 Dias', value: 7 },
  { label: '30 Dias', value: 30 },
  { label: '1 Ano', value: 365 },
];

export default function Analytics({ db }: AnalyticsProps) {
  const [range, setRange] = useState<Range>(7);

  const endDate = today();
  const startDate = normalizeDate(subDays(new Date(), range));

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
        date: format(new Date(date), 'dd/MM'),
        weight: record.weight,
        water: record.water,
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
                  ? 'bg-[#C496A1] text-white'
                  : 'bg-gray-100 text-[#81785A]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Gráfico 1: Peso (LineChart) */}
      <div className="bg-white rounded-2xl p-4 border border-[#EBE1C6] mb-6">
        <h3 className="text-[#81785A] font-semibold text-sm mb-3">
          Peso (kg)
        </h3>
        {hasWeightData ? (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EBE1C6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#81785A' }}
                  tickLine={false}
                  axisLine={{ stroke: '#EBE1C6' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#81785A' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F7F5F0',
                    border: '1px solid #EBE1C6',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine
                  y={70}
                  stroke="#81785A"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Meta: 70kg',
                    fill: '#81785A',
                    fontSize: 10,
                    position: 'right',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#C496A1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#C496A1' }}
                  activeDot={{ r: 6, fill: '#C496A1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-[#8E88A3]">
            <Scale className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhum registro de peso disponível</p>
          </div>
        )}
      </div>

      {/* Gráfico 2: Água (BarChart) */}
      <div className="bg-white rounded-2xl p-4 border border-[#EBE1C6] mb-6">
        <h3 className="text-[#81785A] font-semibold text-sm mb-3">
          Água (ml)
        </h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EBE1C6" strokeOpacity={0.1} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#81785A' }}
                tickLine={false}
                axisLine={{ stroke: '#EBE1C6' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#81785A' }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: 'ml',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#81785A',
                  fontSize: 10,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F7F5F0',
                  border: '1px solid #EBE1C6',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine
                y={2000}
                stroke="#81785A"
                strokeDasharray="4 4"
                label={{
                  value: 'Meta: 2000ml',
                  fill: '#81785A',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              <Bar dataKey="water" radius={[8, 8, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={
                      chartData[index].water >= 2000 ? '#919D85' : '#8E88A3'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 3: Consistência de Hábitos (AreaChart) */}
      <div className="bg-white rounded-2xl p-4 border border-[#EBE1C6] mb-6">
        <h3 className="text-[#81785A] font-semibold text-sm mb-3">
          Consistência de Hábitos
        </h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EBE1C6" strokeOpacity={0.1} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#81785A' }}
                tickLine={false}
                axisLine={{ stroke: '#EBE1C6' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#81785A' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 3]}
                ticks={[0, 1, 2, 3]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F7F5F0',
                  border: '1px solid #EBE1C6',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="habits"
                stroke="#8E88A3"
                fill="#8E88A3"
                fillOpacity={0.3}
                strokeWidth={2}
                dot={{ r: 3, fill: '#8E88A3' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
