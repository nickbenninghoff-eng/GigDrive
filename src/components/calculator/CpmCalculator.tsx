import { useState, useEffect, useMemo } from 'react';
import VehicleSelector from './VehicleSelector';
import CostBreakdownChart from './CostBreakdownChart';
import type { CpmResult } from '../../types/calculator';
import { calculateCpm } from '../../utils/cpmCalculation';
import { formatCurrency, formatNumber } from '../../utils/formatCurrency';
import { useCalculatorStore } from '../../stores/calculatorStore';

const PERIOD_OPTIONS = [
  { key: 'costPerMile' as const, label: 'Per Mile' },
  { key: 'daily' as const, label: 'Daily' },
  { key: 'weekly' as const, label: 'Weekly' },
  { key: 'monthly' as const, label: 'Monthly' },
  { key: 'yearly' as const, label: 'Yearly' },
];

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  color?: string;
  icon: React.ReactNode;
}

function SliderField({ label, value, onChange, min, max, step, format, color = 'cyan', icon }: SliderFieldProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const colorMap: Record<string, string> = {
    cyan: '#00f0ff',
    magenta: '#ff00aa',
    green: '#39ff14',
    amber: '#ffaa00',
    purple: '#bf00ff',
  };
  const fillColor = colorMap[color] || colorMap.cyan;

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-noir-muted">{icon}</span>
          <span className="text-xs font-medium text-noir-text-secondary">{label}</span>
        </div>
        <span
          className="text-sm font-mono font-bold tabular-nums transition-all duration-200"
          style={{ color: fillColor }}
        >
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`range-${color}`}
        style={{
          background: `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${pct}%, #2a2a3e ${pct}%, #2a2a3e 100%)`,
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-noir-muted">{format(min)}</span>
        <span className="text-[10px] text-noir-muted">{format(max)}</span>
      </div>
    </div>
  );
}

export default function CpmCalculator() {
  const { input, updateInput, selectedVehicle, setSelectedVehicle } = useCalculatorStore();
  const [activePeriod, setActivePeriod] = useState<typeof PERIOD_OPTIONS[number]['key']>('monthly');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Compute CPM on every input change (client-side, instant)
  const result: CpmResult = useMemo(() => {
    const mpg = selectedVehicle?.mpg_combined ?? input.mpgCombined ?? 30;
    return calculateCpm({ ...input, mpgCombined: mpg });
  }, [input, selectedVehicle]);

  // Update mpg when vehicle is selected
  useEffect(() => {
    if (selectedVehicle?.mpg_combined) {
      updateInput({ mpgCombined: selectedVehicle.mpg_combined });
    }
  }, [selectedVehicle, updateInput]);

  const currentBreakdown = result[activePeriod];
  const periodLabel = PERIOD_OPTIONS.find((p) => p.key === activePeriod)?.label || '';

  return (
    <div className="space-y-6">
      {/* Vehicle Selection */}
      <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <VehicleSelector
          onSelect={(v) => {
            setSelectedVehicle(v);
            if (v?.msrp_original) updateInput({ purchasePrice: v.msrp_original });
          }}
          selectedVehicle={selectedVehicle}
        />

        {/* Selected vehicle stats strip */}
        {selectedVehicle && (
          <div className="mt-4 flex items-center gap-4 flex-wrap stagger">
            <StatChip
              label="MPG"
              value={`${selectedVehicle.mpg_combined}`}
              color="cyan"
            />
            <StatChip
              label="Safety"
              value={`${selectedVehicle.nhtsa_overall_safety_rating || '—'}/5`}
              color="green"
            />
            <StatChip
              label="Type"
              value={selectedVehicle.body_style || 'N/A'}
              color="amber"
            />
            <StatChip
              label="MSRP"
              value={selectedVehicle.msrp_original ? formatCurrency(selectedVehicle.msrp_original) : 'N/A'}
              color="magenta"
            />
          </div>
        )}
      </div>

      {/* Sliders + Results — 2-column on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input sliders */}
        <div className="glass-card p-5 space-y-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)]">
            Your Numbers
          </h3>

          <SliderField
            label="Annual Miles"
            value={input.annualMiles}
            onChange={(v) => updateInput({ annualMiles: v })}
            min={5000}
            max={80000}
            step={1000}
            format={(v) => `${formatNumber(v)} mi`}
            color="cyan"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.079-.504 1.007-1.12l-1.094-10.56A1.125 1.125 0 0019.19 6h-2.44a1.125 1.125 0 00-1.118 1.07L14.538 17.88c-.072.616.386 1.12 1.007 1.12H18.75" /></svg>}
          />

          <SliderField
            label="Gas Price"
            value={input.fuelPriceCentsPerGallon}
            onChange={(v) => updateInput({ fuelPriceCentsPerGallon: v })}
            min={200}
            max={700}
            step={5}
            format={(v) => `$${(v / 100).toFixed(2)}/gal`}
            color="amber"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>}
          />

          <SliderField
            label="Monthly Insurance"
            value={input.monthlyInsuranceCents}
            onChange={(v) => updateInput({ monthlyInsuranceCents: v })}
            min={5000}
            max={50000}
            step={500}
            format={(v) => `$${(v / 100).toFixed(0)}/mo`}
            color="magenta"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
          />

          <SliderField
            label="Vehicle Price"
            value={input.purchasePrice}
            onChange={(v) => updateInput({ purchasePrice: v })}
            min={5000}
            max={80000}
            step={500}
            format={(v) => formatCurrency(v)}
            color="purple"
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs text-noir-muted hover:text-neon-cyan transition-colors w-full"
          >
            <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            Advanced Options
          </button>

          {showAdvanced && (
            <div className="space-y-5 pt-2 border-t border-noir-border animate-fade-in">
              <SliderField
                label="Down Payment"
                value={input.downPayment}
                onChange={(v) => updateInput({ downPayment: v })}
                min={0}
                max={input.purchasePrice}
                step={500}
                format={(v) => formatCurrency(v)}
                color="green"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
              />

              <SliderField
                label="Loan Term"
                value={input.loanTermMonths}
                onChange={(v) => updateInput({ loanTermMonths: v })}
                min={12}
                max={84}
                step={6}
                format={(v) => `${v} months`}
                color="cyan"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
              />

              <SliderField
                label="Loan APR"
                value={input.loanAprPercent * 10}
                onChange={(v) => updateInput({ loanAprPercent: v / 10 })}
                min={0}
                max={200}
                step={5}
                format={(v) => `${(v / 10).toFixed(1)}%`}
                color="amber"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>}
              />

              {!selectedVehicle && (
                <SliderField
                  label="MPG (Combined)"
                  value={input.mpgCombined ?? 30}
                  onChange={(v) => updateInput({ mpgCombined: v })}
                  min={10}
                  max={150}
                  step={1}
                  format={(v) => `${v} MPG`}
                  color="green"
                  icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>}
                />
              )}
            </div>
          )}
        </div>

        {/* Right: Results display */}
        <div className="space-y-6">
          {/* Big number hero */}
          <div className="glass-card p-6 text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {/* Period tabs */}
            <div className="flex items-center justify-center gap-1 mb-5 flex-wrap">
              {PERIOD_OPTIONS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setActivePeriod(p.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    activePeriod === p.key
                      ? 'bg-neon-cyan/15 text-neon-cyan shadow-[0_0_12px_var(--color-neon-cyan-glow)]'
                      : 'text-noir-muted hover:text-noir-text hover:bg-white/5'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="animate-count-up" key={`${activePeriod}-${currentBreakdown.total}`}>
              <p className="text-xs text-noir-muted uppercase tracking-widest mb-1 font-[family-name:var(--font-display)]">
                {activePeriod === 'costPerMile' ? 'Your Cost Per Mile' : `${periodLabel} Cost`}
              </p>
              <p className="text-5xl md:text-6xl font-bold font-[family-name:var(--font-mono)] neon-text-cyan leading-none">
                {activePeriod === 'costPerMile'
                  ? `${(currentBreakdown.total * 100).toFixed(1)}¢`
                  : formatCurrency(currentBreakdown.total)}
              </p>
              {activePeriod !== 'costPerMile' && (
                <p className="text-sm text-noir-muted mt-2">
                  {(result.costPerMile.total * 100).toFixed(1)}¢ per mile
                </p>
              )}
            </div>

            {/* Quick insight */}
            <div className="mt-5 pt-4 border-t border-noir-border">
              <p className="text-xs text-noir-text-secondary">
                {result.costPerMile.total <= 0.35
                  ? '🟢 Below average cost — great for gig driving'
                  : result.costPerMile.total <= 0.50
                  ? '🟡 Average cost — room to optimize'
                  : '🔴 Above average cost — consider a more efficient vehicle'}
              </p>
            </div>
          </div>

          {/* Breakdown chart */}
          <div className="glass-card p-5">
            <CostBreakdownChart
              breakdown={currentBreakdown}
              period={activePeriod}
              periodLabel={periodLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20',
    green: 'bg-neon-green/10 text-neon-green border-neon-green/20',
    amber: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20',
    magenta: 'bg-neon-magenta/10 text-neon-magenta border-neon-magenta/20',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium animate-fade-in ${colorMap[color] || colorMap.cyan}`}>
      <span className="text-noir-text-secondary">{label}</span>
      <span className="font-mono font-bold">{value}</span>
    </div>
  );
}
