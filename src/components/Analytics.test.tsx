import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Analytics from './Analytics';
import type { AppDatabase } from '../types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Recharts components use SVG / DOM measurements that are not available in
// JSDOM, so we replace them with simple stubs.
vi.mock('recharts', () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  const MockLineChart = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  const MockBarChart = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  const MockAreaChart = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  const MockXAxis = () => <div />;
  const MockYAxis = () => <div />;
  const MockCartesianGrid = () => <div />;
  const MockTooltip = () => <div />;
  const MockReferenceLine = () => <div />;
  const MockLine = () => <div />;
  const MockBar = () => <div />;
  const MockArea = () => <div />;
  const MockCell = () => <div />;

  return {
    ResponsiveContainer: MockResponsiveContainer,
    LineChart: MockLineChart,
    BarChart: MockBarChart,
    AreaChart: MockAreaChart,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
    ReferenceLine: MockReferenceLine,
    Line: MockLine,
    Bar: MockBar,
    Area: MockArea,
    Cell: MockCell,
  };
});

// Fix system time so date-dependent assertions are deterministic.
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-06-27T12:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const emptyDb: AppDatabase = {};

/** Two records inside the default 7-days window (2026-06-20 … 2026-06-27). */
const mockDb: AppDatabase = {
  '2026-06-21': {
    date: '2026-06-21',
    water: 1800,
    meds: { done: true, note: '' },
    care: { done: true, note: '' },
    exercise: { done: false, note: '' },
    meals: [],
    weight: 75.0,
  },
  '2026-06-23': {
    date: '2026-06-23',
    water: 2100,
    meds: { done: false, note: '' },
    care: { done: false, note: '' },
    exercise: { done: true, note: '' },
    meals: [],
    weight: 74.5,
  },
};

/** Record inside window but weight is null → should still show fallback. */
const mockDbNoWeight: AppDatabase = {
  '2026-06-22': {
    date: '2026-06-22',
    water: 1500,
    meds: { done: false, note: '' },
    care: { done: false, note: '' },
    exercise: { done: false, note: '' },
    meals: [],
    weight: null,
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Analytics', () => {
  describe('renderização com db vazio', () => {
    it('exibe fallback "Nenhum registro de peso disponível" quando db é vazio', () => {
      render(<Analytics db={emptyDb} />);
      expect(screen.getByText('Nenhum registro de peso disponível')).toBeInTheDocument();
    });

    it('exibe fallback quando registros existem mas weight é null', () => {
      render(<Analytics db={mockDbNoWeight} />);
      expect(screen.getByText('Nenhum registro de peso disponível')).toBeInTheDocument();
    });
  });

  describe('renderização com dados mock', () => {
    it('não exibe fallback quando há registros com weight preenchido', () => {
      render(<Analytics db={mockDb} />);
      expect(screen.queryByText('Nenhum registro de peso disponível')).not.toBeInTheDocument();
    });

    it('renderiza os títulos dos gráficos', () => {
      render(<Analytics db={mockDb} />);
      expect(screen.getByText('Peso (kg)')).toBeInTheDocument();
      expect(screen.getByText('Água (ml)')).toBeInTheDocument();
      expect(screen.getByText('Consistência de Hábitos')).toBeInTheDocument();
    });
  });

  describe('filtro de range', () => {
    it('filtro padrão é 7days — botão "7 Dias" está ativo', () => {
      render(<Analytics db={mockDb} />);
      const btn7 = screen.getByRole('button', { name: /filtrar últimos 7 dias/i });
      expect(btn7).toBeInTheDocument();
      // active class from the component: bg-[#C496A1]
      expect(btn7.className).toContain('C496A1');
    });

    it('não exibe botão "1 Ano" ou "365" na tela', () => {
      render(<Analytics db={mockDb} />);
      expect(screen.queryByRole('button', { name: /1 ano/i })).not.toBeInTheDocument();
      expect(screen.queryByText('1 Ano')).not.toBeInTheDocument();
      expect(screen.queryByText('365')).not.toBeInTheDocument();
    });

    it('renderiza exatamente 2 botões de filtro: "7 Dias" e "30 Dias"', () => {
      render(<Analytics db={mockDb} />);
      const btn7 = screen.getByRole('button', { name: /filtrar últimos 7 dias/i });
      const btn30 = screen.getByRole('button', { name: /filtrar últimos 30 dias/i });
      expect(btn7).toBeInTheDocument();
      expect(btn30).toBeInTheDocument();
    });
  });
});
