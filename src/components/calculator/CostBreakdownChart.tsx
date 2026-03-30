import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState } from 'react';
import type { CpmBreakdown } from '../../types/calculator';
import { formatCurrency } from '../../utils/formatCurrency';

const COLORS: Record<string, { fill: string; glow: string }> = {
  fuel: { fill: '#00f0ff', glow: '#00f0ff40' },
  maintenance: { fill: '#ff00aa', glow: '#ff00aa40' },
  insurance: { fill: '#ffaa00', glow: '#ffaa0040' },
  depreciation: { fill: '#bf00ff', glow: '#bf00ff40' },
  financing: { fill: '#39ff14', glow: '#39ff1440' },
};

const LABELS: Record<string, string> = {
  fuel: 'Fuel',
  maintenance: 'Maintenance',
  insurance: 'Insurance',
  depreciation: 'Depreciation',
  financing: 'Financing',
};

interface CostBreakdownChartProps {
  breakdown: CpmBreakdown;
  period: 'costPerMile' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  periodLabel: string;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const { name, value } = payload[0];
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <span className="text-noir-text-secondary">{name}:</span>{' '}
      <span className="font-mono font-bold text-noir-text">{formatCurrency(value)}</span>
    </div>
  );
}

export default function CostBreakdownChart({ breakdown, period, periodLabel }: CostBreakdownChartProps) {
  const [view, setView] = useState<'donut' | 'bar'>('donut');

  const data = Object.entries(breakdown)
    .filter(([key]) => key !== 'total')
    .map(([key, value]) => ({
      name: LABELS[key] || key,
      value: Math.abs(value),
      key,
    }))
    .sort((a, b) => b.value - a.value);

  const isPerMile = period === 'costPerMile';

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      {/* View toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)]">
          Cost Breakdown
        </h3>
        <div className="flex gap-1 bg-noir-surface rounded-lg p-0.5">
          <button
            onClick={() => setView('donut')}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              view === 'donut' ? 'bg-neon-cyan/15 text-neon-cyan' : 'text-noir-muted hover:text-noir-text'
            }`}
          >
            Donut
          </button>
          <button
            onClick={() => setView('bar')}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              view === 'bar' ? 'bg-neon-cyan/15 text-neon-cyan' : 'text-noir-muted hover:text-noir-text'
            }`}
          >
            Bar
          </button>
        </div>
      </div>

      {view === 'donut' ? (
        <div className="flex items-center gap-6">
          {/* Donut chart */}
          <div className="relative w-48 h-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={COLORS[entry.key]?.fill || '#4a4a6a'}
                      style={{
                        filter: `drop-shadow(0 0 6px ${COLORS[entry.key]?.glow || 'transparent'})`,
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-noir-muted uppercase tracking-wider">{periodLabel}</span>
              <span className="text-lg font-bold font-mono text-noir-text">
                {isPerMile ? `${(breakdown.total * 100).toFixed(1)}¢` : formatCurrency(breakdown.total)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2.5 stagger">
            {data.map((entry) => {
              const pct = breakdown.total > 0 ? (entry.value / breakdown.total) * 100 : 0;
              return (
                <div key={entry.key} className="flex items-center gap-3 animate-slide-in-left">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: COLORS[entry.key]?.fill,
                      boxShadow: `0 0 8px ${COLORS[entry.key]?.glow}`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-noir-text">{entry.name}</span>
                      <span className="text-xs font-mono font-medium text-noir-text-secondary">
                        {isPerMile ? `${(entry.value * 100).toFixed(1)}¢` : formatCurrency(entry.value)}
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1 h-1 rounded-full bg-noir-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[entry.key]?.fill,
                          boxShadow: `0 0 6px ${COLORS[entry.key]?.glow}`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Bar chart view */
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#8888aa', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickFormatter={(v) => isPerMile ? `${(v * 100).toFixed(0)}¢` : `$${v.toFixed(0)}`}
                axisLine={{ stroke: '#2a2a3e' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#e0e0f0', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {data.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={COLORS[entry.key]?.fill || '#4a4a6a'}
                    style={{
                      filter: `drop-shadow(0 0 4px ${COLORS[entry.key]?.glow || 'transparent'})`,
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
