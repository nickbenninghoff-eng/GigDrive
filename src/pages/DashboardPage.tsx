import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../utils/formatCurrency';

type Tab = 'overview' | 'expenses' | 'mileage' | 'earnings' | 'tax';

const EXPENSE_CATEGORIES = [
  { key: 'fuel', label: 'Fuel', icon: '⛽', color: '#00f0ff' },
  { key: 'oil_change', label: 'Oil Change', icon: '🛢️', color: '#ffaa00' },
  { key: 'tires', label: 'Tires', icon: '🔧', color: '#ff00aa' },
  { key: 'repair', label: 'Repair', icon: '🔩', color: '#bf00ff' },
  { key: 'insurance', label: 'Insurance', icon: '🛡️', color: '#39ff14' },
  { key: 'car_wash', label: 'Car Wash', icon: '🧽', color: '#00f0ff' },
  { key: 'other', label: 'Other', icon: '📋', color: '#8888aa' },
];

function LoginForm() {
  const { login, register, isLoading } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="glass-card p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-noir-text mb-2 text-center">
          {isRegister ? 'Create Account' : 'Sign In'}
        </h2>
        <p className="text-sm text-noir-text-secondary text-center mb-6">
          {isRegister
            ? 'Start tracking your gig driving costs'
            : 'Access your dashboard and expense tracking'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs text-noir-muted mb-1.5">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="neon-input"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-noir-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="neon-input"
              placeholder="driver@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-noir-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="neon-input"
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>

          {error && (
            <p className="text-xs text-neon-magenta bg-neon-magenta/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="neon-btn neon-btn-cyan w-full text-center disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => { setIsRegister(!isRegister); setError(''); }}
          className="w-full text-center text-xs text-noir-muted hover:text-neon-cyan mt-4 transition-colors"
        >
          {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  );
}

function DashboardOverview() {
  // Mock data for UI development
  const mockData = {
    totalExpenseCents: 97475,
    totalMiles: 2450,
    costPerMile: 0.3979,
    breakdown: {
      fuel: 42000,
      insurance: 25000,
      maintenance: 15000,
      repair: 8475,
      car_wash: 4000,
      other: 3000,
    },
  };

  return (
    <div className="space-y-6 stagger">
      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Cost/Mile" value={`${(mockData.costPerMile * 100).toFixed(1)}¢`} color="cyan" />
        <MetricCard label="Monthly Cost" value={formatCurrency(mockData.totalExpenseCents / 100)} color="magenta" />
        <MetricCard label="Miles Driven" value={`${mockData.totalMiles.toLocaleString()}`} color="green" />
        <MetricCard label="30d Expenses" value={Object.keys(mockData.breakdown).length.toString()} color="amber" sub="categories" />
      </div>

      {/* Expense breakdown */}
      <div className="glass-card p-5 animate-fade-in-up">
        <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
          Expense Breakdown (Last 30 Days)
        </h3>
        <div className="space-y-3">
          {Object.entries(mockData.breakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, cents]) => {
              const info = EXPENSE_CATEGORIES.find((c) => c.key === cat);
              const pct = (cents / mockData.totalExpenseCents) * 100;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-lg w-8">{info?.icon || '📋'}</span>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-sm text-noir-text">{info?.label || cat}</span>
                      <span className="text-xs font-mono text-noir-text-secondary">
                        {formatCurrency(cents / 100)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-noir-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: info?.color || '#4a4a6a',
                          boxShadow: `0 0 6px ${info?.color}40`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Quick add expense CTA */}
      <div className="glass-card p-5 text-center animate-fade-in-up">
        <p className="text-sm text-noir-text-secondary mb-3">
          Track expenses to see your real cost per mile over time
        </p>
        <p className="text-xs text-noir-muted">
          Connect your backend server to start logging expenses
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'border-neon-cyan/20 text-neon-cyan',
    magenta: 'border-neon-magenta/20 text-neon-magenta',
    green: 'border-neon-green/20 text-neon-green',
    amber: 'border-neon-amber/20 text-neon-amber',
  };

  return (
    <div className={`glass-card p-4 border ${colorMap[color]} animate-fade-in-up`}>
      <p className="text-[10px] text-noir-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono ${colorMap[color]?.split(' ')[1]}`}>{value}</p>
      {sub && <p className="text-[10px] text-noir-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function ExpensesView() {
  const [category, setCategory] = useState('fuel');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [gallons, setGallons] = useState('');
  const [pricePerGallon, setPricePerGallon] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [recentExpenses] = useState([
    { id: 1, category: 'fuel', amount_cents: 4520, date: '2026-03-28', notes: 'Shell station on Main St', gallons: 12.4 },
    { id: 2, category: 'car_wash', amount_cents: 1500, date: '2026-03-26', notes: 'Quick exterior wash' },
    { id: 3, category: 'oil_change', amount_cents: 7500, date: '2026-03-20', notes: 'Full synthetic at Jiffy Lube' },
    { id: 4, category: 'fuel', amount_cents: 3890, date: '2026-03-18', notes: 'Costco gas', gallons: 11.2 },
    { id: 5, category: 'repair', amount_cents: 15000, date: '2026-03-10', notes: 'New brake pads - front' },
  ]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setAmount(''); setNotes(''); setGallons(''); setPricePerGallon(''); }, 2000);
  }

  return (
    <div className="space-y-6 stagger">
      {/* Quick add form */}
      <div className="glass-card p-5 animate-fade-in-up">
        <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
          Log Expense
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category selector */}
          <div className="flex gap-2 flex-wrap">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  category === cat.key
                    ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                    : 'bg-noir-surface/50 text-noir-muted hover:text-noir-text border border-transparent'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-noir-muted mb-1.5">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="neon-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-noir-muted mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="neon-input"
                required
              />
            </div>
          </div>

          {category === 'fuel' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-noir-muted mb-1.5">Gallons</label>
                <input
                  type="number"
                  step="0.001"
                  value={gallons}
                  onChange={(e) => setGallons(e.target.value)}
                  placeholder="12.5"
                  className="neon-input"
                />
              </div>
              <div>
                <label className="block text-xs text-noir-muted mb-1.5">Price/Gallon ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={pricePerGallon}
                  onChange={(e) => setPricePerGallon(e.target.value)}
                  placeholder="3.50"
                  className="neon-input"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-noir-muted mb-1.5">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Station name, details..."
              className="neon-input"
            />
          </div>

          <button
            type="submit"
            className={`neon-btn w-full text-center text-sm ${
              submitted ? 'bg-neon-green/20 border-neon-green text-neon-green' : 'neon-btn-cyan'
            }`}
          >
            {submitted ? 'Saved!' : 'Log Expense'}
          </button>
        </form>
      </div>

      {/* Recent expenses list */}
      <div className="glass-card p-5 animate-fade-in-up">
        <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
          Recent Expenses
        </h3>

        <div className="space-y-2">
          {recentExpenses.map((exp) => {
            const catInfo = EXPENSE_CATEGORIES.find((c) => c.key === exp.category);
            return (
              <div key={exp.id} className="flex items-center gap-3 py-3 border-b border-noir-border/30 last:border-0">
                <span className="text-lg w-8">{catInfo?.icon || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-noir-text">{catInfo?.label || exp.category}</span>
                    <span className="text-sm font-mono font-bold" style={{ color: catInfo?.color }}>
                      {formatCurrency(exp.amount_cents / 100)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-noir-muted">{exp.date}</span>
                    {exp.notes && <span className="text-[10px] text-noir-text-secondary truncate">{exp.notes}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MileageView() {
  const [miles, setMiles] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('gig_rideshare');
  const [platform, setPlatform] = useState('uber');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [recentMileage] = useState([
    { id: 1, miles: 142.5, date: '2026-03-28', purpose: 'gig_rideshare', gig_platform: 'uber' },
    { id: 2, miles: 89.3, date: '2026-03-27', purpose: 'gig_delivery', gig_platform: 'doordash' },
    { id: 3, miles: 155.0, date: '2026-03-26', purpose: 'gig_rideshare', gig_platform: 'uber' },
    { id: 4, miles: 22.0, date: '2026-03-26', purpose: 'personal', gig_platform: null },
    { id: 5, miles: 118.7, date: '2026-03-25', purpose: 'gig_rideshare', gig_platform: 'lyft' },
    { id: 6, miles: 96.2, date: '2026-03-24', purpose: 'gig_delivery', gig_platform: 'doordash' },
  ]);

  const totalBusiness = recentMileage.filter((m) => m.purpose.startsWith('gig_')).reduce((a, m) => a + m.miles, 0);
  const totalPersonal = recentMileage.filter((m) => !m.purpose.startsWith('gig_')).reduce((a, m) => a + m.miles, 0);

  const purposeLabels: Record<string, { label: string; color: string }> = {
    gig_rideshare: { label: 'Rideshare', color: 'text-neon-cyan' },
    gig_delivery: { label: 'Delivery', color: 'text-neon-amber' },
    personal: { label: 'Personal', color: 'text-noir-muted' },
    commute: { label: 'Commute', color: 'text-neon-purple' },
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setMiles(''); setNotes(''); }, 2000);
  }

  return (
    <div className="space-y-6 stagger">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
        <div className="glass-card p-4 border border-neon-cyan/20">
          <p className="text-[10px] text-noir-muted uppercase tracking-wider">Business Miles</p>
          <p className="text-2xl font-bold font-mono text-neon-cyan mt-1">{totalBusiness.toFixed(1)}</p>
          <p className="text-xs text-noir-muted">IRS deductible</p>
        </div>
        <div className="glass-card p-4 border border-noir-border">
          <p className="text-[10px] text-noir-muted uppercase tracking-wider">Personal Miles</p>
          <p className="text-2xl font-bold font-mono text-noir-text-secondary mt-1">{totalPersonal.toFixed(1)}</p>
          <p className="text-xs text-noir-muted">Not deductible</p>
        </div>
      </div>

      {/* Log form */}
      <div className="glass-card p-5 animate-fade-in-up">
        <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
          Log Mileage
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-noir-muted mb-1.5">Miles</label>
              <input
                type="number"
                step="0.1"
                value={miles}
                onChange={(e) => setMiles(e.target.value)}
                placeholder="0.0"
                className="neon-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-noir-muted mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="neon-input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-noir-muted mb-1.5">Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="neon-input"
              >
                <option value="gig_rideshare">Rideshare (Uber/Lyft)</option>
                <option value="gig_delivery">Delivery (DoorDash/etc)</option>
                <option value="personal">Personal</option>
                <option value="commute">Commute</option>
              </select>
            </div>
            {purpose.startsWith('gig_') && (
              <div>
                <label className="block text-xs text-noir-muted mb-1.5">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="neon-input"
                >
                  <option value="uber">Uber</option>
                  <option value="lyft">Lyft</option>
                  <option value="doordash">DoorDash</option>
                  <option value="instacart">Instacart</option>
                  <option value="amazon_flex">Amazon Flex</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-noir-muted mb-1.5">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Trip details..."
              className="neon-input"
            />
          </div>

          <button
            type="submit"
            className={`neon-btn w-full text-center text-sm ${
              submitted ? 'bg-neon-green/20 border-neon-green text-neon-green' : 'neon-btn-cyan'
            }`}
          >
            {submitted ? 'Saved!' : 'Log Mileage'}
          </button>
        </form>
      </div>

      {/* Recent mileage log */}
      <div className="glass-card p-5 animate-fade-in-up">
        <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
          Recent Mileage
        </h3>

        <div className="space-y-2">
          {recentMileage.map((entry) => {
            const pInfo = purposeLabels[entry.purpose] || { label: entry.purpose, color: 'text-noir-muted' };
            return (
              <div key={entry.id} className="flex items-center justify-between py-3 border-b border-noir-border/30 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${pInfo.color}`}>{pInfo.label}</span>
                    {entry.gig_platform && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-noir-card text-noir-muted">{entry.gig_platform}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-noir-muted">{entry.date}</span>
                </div>
                <span className="text-sm font-mono font-bold text-noir-text">{entry.miles.toFixed(1)} mi</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EarningsView() {
  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <h3 className="text-lg font-semibold text-noir-text mb-2 font-[family-name:var(--font-display)]">
        Import Earnings
      </h3>
      <p className="text-sm text-noir-text-secondary mb-6">
        Import your gig earnings to see your true profit per mile.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="glass-card glass-card-hover p-4 cursor-pointer text-center">
          <span className="text-2xl mb-2 block">📄</span>
          <p className="text-sm font-medium text-noir-text">Upload CSV</p>
          <p className="text-xs text-noir-muted mt-1">Uber, Lyft, DoorDash</p>
        </div>
        <div className="glass-card glass-card-hover p-4 cursor-pointer text-center">
          <span className="text-2xl mb-2 block">✏️</span>
          <p className="text-sm font-medium text-noir-text">Manual Entry</p>
          <p className="text-xs text-noir-muted mt-1">Any platform</p>
        </div>
      </div>

      <div className="border border-dashed border-noir-border rounded-xl p-8 text-center">
        <p className="text-noir-muted text-sm">No earnings imported yet</p>
        <p className="text-noir-muted text-xs mt-1">Upload a CSV or manually enter your earnings</p>
      </div>
    </div>
  );
}

function TaxView() {
  // Mock tax comparison data
  const standardDeduction = 1715; // $0.70 * 2450 miles
  const actualExpenses = 974.75;

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <h3 className="text-lg font-semibold text-noir-text mb-2 font-[family-name:var(--font-display)]">
        Tax Deduction Comparison
      </h3>
      <p className="text-sm text-noir-text-secondary mb-6">
        IRS Standard Mileage Rate vs. Actual Expenses
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`glass-card p-4 border ${standardDeduction > actualExpenses ? 'border-neon-green/30' : 'border-noir-border'}`}>
          <p className="text-xs text-noir-muted uppercase tracking-wider mb-1">Standard Rate</p>
          <p className="text-2xl font-bold font-mono text-neon-green">{formatCurrency(standardDeduction)}</p>
          <p className="text-xs text-noir-muted mt-1">$0.70/mi x 2,450 mi</p>
          {standardDeduction > actualExpenses && (
            <p className="text-xs text-neon-green mt-2 font-medium">Recommended</p>
          )}
        </div>
        <div className={`glass-card p-4 border ${actualExpenses > standardDeduction ? 'border-neon-green/30' : 'border-noir-border'}`}>
          <p className="text-xs text-noir-muted uppercase tracking-wider mb-1">Actual Expenses</p>
          <p className="text-2xl font-bold font-mono text-neon-amber">{formatCurrency(actualExpenses)}</p>
          <p className="text-xs text-noir-muted mt-1">Tracked business expenses</p>
        </div>
      </div>

      <div className="bg-neon-green/5 border border-neon-green/20 rounded-xl p-4">
        <p className="text-sm text-noir-text">
          The <span className="text-neon-green font-semibold">Standard Mileage Rate</span> saves you{' '}
          <span className="font-mono font-bold text-neon-green">
            {formatCurrency(Math.abs(standardDeduction - actualExpenses))}
          </span>{' '}
          more in deductions this period.
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'mileage', label: 'Mileage' },
    { key: 'earnings', label: 'Earnings' },
    { key: 'tax', label: 'Tax' },
  ];

  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative z-10 px-4 py-8 md:py-12 max-w-4xl mx-auto">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-neon-purple/60 mb-3 font-[family-name:var(--font-display)]">
            Driver Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-noir-text">
            {user ? `Welcome, ${user.displayName || 'Driver'}` : 'Your Dashboard'}
          </h1>
        </header>

        {!user ? (
          <LoginForm />
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? 'bg-neon-cyan/15 text-neon-cyan shadow-[0_0_12px_var(--color-neon-cyan-glow)]'
                      : 'text-noir-muted hover:text-noir-text hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'expenses' && <ExpensesView />}
            {activeTab === 'mileage' && <MileageView />}
            {activeTab === 'earnings' && <EarningsView />}
            {activeTab === 'tax' && <TaxView />}
          </>
        )}
      </div>
    </div>
  );
}
