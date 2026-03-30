import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../utils/formatCurrency';

type Tab = 'benchmarks' | 'fees' | 'calculator';

const PLATFORM_COLORS: Record<string, string> = {
  uber: '#00f0ff',
  lyft: '#ff00aa',
  doordash: '#ff4500',
  instacart: '#39ff14',
  amazon_flex: '#ffaa00',
  grubhub: '#bf00ff',
};

const PLATFORM_LABELS: Record<string, string> = {
  uber: 'Uber',
  lyft: 'Lyft',
  doordash: 'DoorDash',
  instacart: 'Instacart',
  amazon_flex: 'Amazon Flex',
  grubhub: 'Grubhub',
};

const NATIONAL_DATA = [
  { platform: 'amazon_flex', avg_hourly: 22.00, avg_tips_pct: 5, avg_fee_pct: 0 },
  { platform: 'uber', avg_hourly: 21.50, avg_tips_pct: 12, avg_fee_pct: 35 },
  { platform: 'lyft', avg_hourly: 19.80, avg_tips_pct: 10, avg_fee_pct: 32 },
  { platform: 'doordash', avg_hourly: 17.50, avg_tips_pct: 25, avg_fee_pct: 28 },
  { platform: 'instacart', avg_hourly: 16.20, avg_tips_pct: 18, avg_fee_pct: 30 },
];

const FEE_DATA = [
  { platform: 'uber', avg_fee_pct: 35 },
  { platform: 'lyft', avg_fee_pct: 32 },
  { platform: 'instacart', avg_fee_pct: 30 },
  { platform: 'doordash', avg_fee_pct: 28 },
  { platform: 'grubhub', avg_fee_pct: 25 },
  { platform: 'amazon_flex', avg_fee_pct: 0 },
];

function CustomBarTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="font-semibold text-noir-text">{PLATFORM_LABELS[d.platform] || d.platform}</p>
      {d.avg_hourly !== undefined && <p className="text-neon-cyan font-mono">{formatCurrency(d.avg_hourly)}/hr</p>}
      {d.avg_fee_pct !== undefined && <p className="text-neon-magenta font-mono">{d.avg_fee_pct}% fee</p>}
    </div>
  );
}

function FeeCalculator() {
  const [platform, setPlatform] = useState('uber');
  const [weeklyEarnings, setWeeklyEarnings] = useState(800);
  const [hoursWorked, setHoursWorked] = useState(30);

  const feeRates: Record<string, number> = {
    uber: 0.35, lyft: 0.32, doordash: 0.28, instacart: 0.30, amazon_flex: 0.0, grubhub: 0.25,
  };

  const result = useMemo(() => {
    const feeRate = feeRates[platform] || 0.30;
    const gross = weeklyEarnings / (1 - feeRate);
    const fee = gross - weeklyEarnings;
    const hourly = hoursWorked > 0 ? weeklyEarnings / hoursWorked : 0;

    return {
      feeRate,
      grossRiderPaid: gross,
      platformFee: fee,
      monthlyFee: fee * 4.33,
      yearlyFee: fee * 52,
      hourlyGross: hourly,
      savings: [
        { label: '15% fee', rate: 0.15, saved: fee - (gross * 0.15) },
        { label: '10% fee', rate: 0.10, saved: fee - (gross * 0.10) },
        { label: '5% fee', rate: 0.05, saved: fee - (gross * 0.05) },
      ],
    };
  }, [platform, weeklyEarnings, hoursWorked]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="glass-card p-5 animate-fade-in-up">
        <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
          Your Numbers
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-noir-muted mb-1.5">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="neon-input"
            >
              {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-noir-muted mb-1.5">Weekly Earnings</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-muted text-sm">$</span>
              <input
                type="number"
                value={weeklyEarnings}
                onChange={(e) => setWeeklyEarnings(parseFloat(e.target.value) || 0)}
                className="neon-input !pl-7"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-noir-muted mb-1.5">Hours/Week</label>
            <input
              type="number"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(parseFloat(e.target.value) || 0)}
              className="neon-input"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger">
        <div className="glass-card p-4 animate-fade-in-up">
          <p className="text-[10px] text-noir-muted uppercase tracking-wider">Platform Takes</p>
          <p className="text-2xl font-bold font-mono text-neon-magenta mt-1">{formatCurrency(result.platformFee)}</p>
          <p className="text-xs text-noir-muted">/week ({(result.feeRate * 100).toFixed(0)}%)</p>
        </div>
        <div className="glass-card p-4 animate-fade-in-up">
          <p className="text-[10px] text-noir-muted uppercase tracking-wider">Monthly Fees</p>
          <p className="text-2xl font-bold font-mono text-neon-amber mt-1">{formatCurrency(result.monthlyFee)}</p>
          <p className="text-xs text-noir-muted">gone to {PLATFORM_LABELS[platform]}</p>
        </div>
        <div className="glass-card p-4 animate-fade-in-up">
          <p className="text-[10px] text-noir-muted uppercase tracking-wider">Yearly Fees</p>
          <p className="text-2xl font-bold font-mono text-neon-magenta mt-1">{formatCurrency(result.yearlyFee)}</p>
          <p className="text-xs text-noir-muted">per year to platform</p>
        </div>
        <div className="glass-card p-4 animate-fade-in-up">
          <p className="text-[10px] text-noir-muted uppercase tracking-wider">Your Hourly</p>
          <p className="text-2xl font-bold font-mono text-neon-cyan mt-1">{formatCurrency(result.hourlyGross)}</p>
          <p className="text-xs text-noir-muted">before expenses</p>
        </div>
      </div>

      {/* The seed-planting section */}
      <div className="glass-card p-5 animate-fade-in-up border border-neon-green/20">
        <h3 className="text-sm font-semibold text-neon-green mb-3 font-[family-name:var(--font-display)]">
          What If Fees Were Lower?
        </h3>
        <p className="text-xs text-noir-text-secondary mb-4">
          {PLATFORM_LABELS[platform]} takes ~{(result.feeRate * 100).toFixed(0)}% of rider fares. Here's what you'd save with a lower-fee platform:
        </p>

        <div className="space-y-3">
          {result.savings.map((s) => (
            <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-noir-surface/50">
              <div>
                <p className="text-sm font-medium text-noir-text">{s.label} platform</p>
                <p className="text-xs text-noir-muted">vs {(result.feeRate * 100).toFixed(0)}% current</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-mono text-neon-green">
                  +{formatCurrency(s.saved)}<span className="text-xs text-noir-muted">/wk</span>
                </p>
                <p className="text-xs text-neon-green/70">
                  +{formatCurrency(s.saved * 52)}/year
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BenchmarksPage() {
  const [activeTab, setActiveTab] = useState<Tab>('benchmarks');

  const chartData = NATIONAL_DATA.map((d) => ({
    ...d,
    name: PLATFORM_LABELS[d.platform] || d.platform,
  }));

  const feeChartData = FEE_DATA.map((d) => ({
    ...d,
    name: PLATFORM_LABELS[d.platform] || d.platform,
  }));

  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative z-10 px-4 py-8 md:py-12 max-w-4xl mx-auto">
        <header className="mb-8 stagger">
          <p className="animate-fade-in-up text-xs font-medium uppercase tracking-[0.3em] text-neon-cyan/60 mb-3 font-[family-name:var(--font-display)]">
            Market Intelligence
          </p>
          <h1 className="animate-fade-in-up text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-noir-text">
            Earnings & Fee Transparency
          </h1>
          <p className="animate-fade-in-up text-noir-text-secondary text-sm mt-2">
            See what drivers really earn and how much platforms actually take.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([
            { key: 'benchmarks' as const, label: 'Earnings by Platform' },
            { key: 'fees' as const, label: 'Platform Fees' },
            { key: 'calculator' as const, label: 'Fee Calculator' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'glass-card neon-border-cyan text-neon-cyan'
                  : 'bg-noir-surface/50 text-noir-muted hover:text-noir-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'benchmarks' && (
          <div className="space-y-6 stagger">
            {/* National hourly earnings chart */}
            <div className="glass-card p-5 animate-fade-in-up">
              <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
                Average Hourly Earnings by Platform (National)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#e0e0f0', fontSize: 11 }}
                      axisLine={{ stroke: '#2a2a3e' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#8888aa', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                      tickFormatter={(v) => `$${v}`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#ffffff08' }} />
                    <Bar dataKey="avg_hourly" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.platform}
                          fill={PLATFORM_COLORS[entry.platform] || '#4a4a6a'}
                          style={{ filter: `drop-shadow(0 0 4px ${PLATFORM_COLORS[entry.platform]}40)` }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-noir-muted text-center mt-2">
                Based on national estimates. Community data improves accuracy over time.
              </p>
            </div>

            {/* Platform cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NATIONAL_DATA.map((d) => (
                <div key={d.platform} className="glass-card p-4 animate-fade-in-up">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PLATFORM_COLORS[d.platform], boxShadow: `0 0 8px ${PLATFORM_COLORS[d.platform]}40` }}
                    />
                    <span className="text-sm font-semibold text-noir-text">{PLATFORM_LABELS[d.platform]}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-noir-muted">Hourly</p>
                      <p className="text-sm font-mono font-bold text-neon-cyan">${d.avg_hourly.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-noir-muted">Tips</p>
                      <p className="text-sm font-mono font-bold text-neon-green">{d.avg_tips_pct}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-noir-muted">Fee</p>
                      <p className="text-sm font-mono font-bold text-neon-magenta">{d.avg_fee_pct}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="space-y-6 stagger">
            <div className="glass-card p-5 animate-fade-in-up">
              <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
                Platform Fee Comparison
              </h3>
              <p className="text-xs text-noir-text-secondary mb-4">
                Percentage of rider/customer payment taken by each platform before you get paid.
              </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feeChartData} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: '#8888aa', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                      tickFormatter={(v) => `${v}%`}
                      axisLine={{ stroke: '#2a2a3e' }}
                      domain={[0, 40]}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#e0e0f0', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#ffffff08' }} />
                    <Bar dataKey="avg_fee_pct" radius={[0, 6, 6, 0]} maxBarSize={24}>
                      {feeChartData.map((entry) => (
                        <Cell
                          key={entry.platform}
                          fill={entry.avg_fee_pct > 30 ? '#ff00aa' : entry.avg_fee_pct > 0 ? '#ffaa00' : '#39ff14'}
                          style={{ filter: 'drop-shadow(0 0 4px rgba(255,0,170,0.3))' }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Impact callout */}
            <div className="glass-card p-5 border border-neon-magenta/20 animate-fade-in-up">
              <h3 className="text-sm font-semibold text-neon-magenta mb-2">The Hidden Cost of High Fees</h3>
              <p className="text-sm text-noir-text-secondary">
                A driver earning $800/week on Uber loses approximately <span className="text-neon-magenta font-mono font-bold">$430/week</span> in platform fees.
                That's <span className="text-neon-magenta font-mono font-bold">$22,360/year</span> going to the platform instead of your pocket.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && <FeeCalculator />}
      </div>
    </div>
  );
}
