import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type Tab = 'rights' | 'satisfaction' | 'profile';

const GUIDES = [
  { slug: 'deactivation-appeal', title: 'How to Appeal a Deactivation', category: 'deactivation', icon: '🛡️' },
  { slug: 'uber-deactivation-process', title: 'Uber Deactivation: What You Need to Know', category: 'deactivation', icon: '🚗' },
  { slug: 'lyft-deactivation-process', title: 'Lyft Deactivation Appeal Process', category: 'deactivation', icon: '🚗' },
  { slug: 'tax-standard-mileage', title: 'IRS Standard Mileage Deduction Guide', category: 'tax', icon: '💰' },
  { slug: 'tax-actual-expenses', title: 'Actual Expense Method for Gig Drivers', category: 'tax', icon: '💰' },
  { slug: 'independent-contractor-rights', title: 'Your Rights as an Independent Contractor', category: 'rights', icon: '⚖️' },
  { slug: 'insurance-coverage-gaps', title: 'Insurance Coverage Gaps for Rideshare', category: 'insurance', icon: '📋' },
  { slug: 'safety-tips-rideshare', title: 'Safety Tips for Rideshare Drivers', category: 'safety', icon: '🔒' },
];

const CATEGORY_COLORS: Record<string, string> = {
  deactivation: 'bg-neon-magenta/10 text-neon-magenta border-neon-magenta/20',
  tax: 'bg-neon-green/10 text-neon-green border-neon-green/20',
  rights: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20',
  insurance: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20',
  safety: 'bg-neon-purple/10 text-neon-purple border-neon-purple/20',
};

const SATISFACTION_DATA = [
  { platform: 'Amazon Flex', overall: 3.5, pay: 3.3, support: 2.2, fear: 4.0, color: '#ffaa00' },
  { platform: 'Lyft', overall: 3.4, pay: 3.0, support: 2.7, fear: 3.5, color: '#ff00aa' },
  { platform: 'Uber', overall: 3.2, pay: 2.8, support: 2.5, fear: 3.8, color: '#00f0ff' },
  { platform: 'DoorDash', overall: 3.1, pay: 2.6, support: 2.3, fear: 3.2, color: '#ff4500' },
  { platform: 'Instacart', overall: 3.0, pay: 2.5, support: 2.4, fear: 3.0, color: '#39ff14' },
];

function SatisfactionTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-noir-text">{d.platform}</p>
      <p>Overall: <span className="font-mono text-neon-cyan">{d.overall}/5</span></p>
      <p>Pay Fairness: <span className="font-mono text-neon-green">{d.pay}/5</span></p>
      <p>Support: <span className="font-mono text-neon-amber">{d.support}/5</span></p>
      <p>Deactivation Fear: <span className="font-mono text-neon-magenta">{d.fear}/5</span></p>
    </div>
  );
}

function DriverProfileCard() {
  return (
    <div className="space-y-6 stagger">
      <div className="glass-card p-6 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-noir-text mb-4 font-[family-name:var(--font-display)]">
          Your Driver Portfolio
        </h3>
        <p className="text-sm text-noir-text-secondary mb-6">
          Build a portable reputation that travels with you. Unlike platform ratings, your GigDrive profile belongs to <span className="text-neon-cyan font-medium">you</span>.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-noir-surface/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold font-mono text-neon-cyan">4.92</p>
            <p className="text-[10px] text-noir-muted uppercase">Avg Rating</p>
          </div>
          <div className="bg-noir-surface/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold font-mono text-neon-green">3,247</p>
            <p className="text-[10px] text-noir-muted uppercase">Total Trips</p>
          </div>
          <div className="bg-noir-surface/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold font-mono text-neon-amber">52k</p>
            <p className="text-[10px] text-noir-muted uppercase">Miles Driven</p>
          </div>
          <div className="bg-noir-surface/50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold font-mono text-neon-magenta">2.3</p>
            <p className="text-[10px] text-noir-muted uppercase">Years Active</p>
          </div>
        </div>

        <div className="border border-neon-cyan/20 rounded-xl p-4 bg-neon-cyan/5">
          <p className="text-sm text-noir-text">
            Your portable profile proves your experience to any platform. When new platforms emerge, bring your <span className="text-neon-cyan font-semibold">verified reputation</span> with you instead of starting from zero.
          </p>
        </div>
      </div>

      <div className="glass-card p-5 animate-fade-in-up">
        <h4 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider mb-3 font-[family-name:var(--font-display)]">
          Platforms & Specialties
        </h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {['Uber', 'Lyft', 'DoorDash'].map((p) => (
            <span key={p} className="text-xs px-3 py-1.5 rounded-lg bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
              {p}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {['Airport Runs', 'Late Night', 'Long Distance'].map((s) => (
            <span key={s} className="text-xs px-3 py-1.5 rounded-lg bg-neon-amber/10 text-neon-amber border border-neon-amber/20">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdvocacyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('rights');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(GUIDES.map((g) => g.category))];
  const filteredGuides = selectedCategory ? GUIDES.filter((g) => g.category === selectedCategory) : GUIDES;

  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative z-10 px-4 py-8 md:py-12 max-w-4xl mx-auto">
        <header className="mb-8 stagger">
          <p className="animate-fade-in-up text-xs font-medium uppercase tracking-[0.3em] text-neon-green/60 mb-3 font-[family-name:var(--font-display)]">
            Driver Advocacy
          </p>
          <h1 className="animate-fade-in-up text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-noir-text">
            Know Your Rights
          </h1>
          <p className="animate-fade-in-up text-noir-text-secondary text-sm mt-2">
            Protect your livelihood. Understand your rights. Own your reputation.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([
            { key: 'rights' as const, label: 'Rights & Guides' },
            { key: 'satisfaction' as const, label: 'Satisfaction Index' },
            { key: 'profile' as const, label: 'Driver Portfolio' },
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

        {activeTab === 'rights' && (
          <div className="space-y-6">
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap animate-fade-in-up">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${!selectedCategory ? 'bg-neon-cyan/15 text-neon-cyan' : 'bg-noir-surface/50 text-noir-muted hover:text-noir-text'}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-all ${selectedCategory === cat ? 'bg-neon-cyan/15 text-neon-cyan' : 'bg-noir-surface/50 text-noir-muted hover:text-noir-text'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Guide list */}
            <div className="space-y-2 stagger">
              {filteredGuides.map((guide) => (
                <div key={guide.slug} className="glass-card glass-card-hover p-4 cursor-pointer animate-fade-in-up">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{guide.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-noir-text">{guide.title}</h3>
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full capitalize mt-1 border ${CATEGORY_COLORS[guide.category] || ''}`}>
                        {guide.category}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-noir-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'satisfaction' && (
          <div className="space-y-6 stagger">
            <div className="glass-card p-5 animate-fade-in-up">
              <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
                Driver Satisfaction Index
              </h3>
              <p className="text-xs text-noir-text-secondary mb-4">
                How drivers rate each platform. Based on community surveys.
              </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SATISFACTION_DATA} margin={{ left: 0, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
                    <XAxis dataKey="platform" tick={{ fill: '#e0e0f0', fontSize: 10 }} axisLine={{ stroke: '#2a2a3e' }} tickLine={false} />
                    <YAxis tick={{ fill: '#8888aa', fontSize: 11, fontFamily: 'JetBrains Mono' }} domain={[0, 5]} axisLine={false} tickLine={false} />
                    <Tooltip content={<SatisfactionTooltip />} cursor={{ fill: '#ffffff08' }} />
                    <Bar dataKey="overall" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {SATISFACTION_DATA.map((entry) => (
                        <Cell key={entry.platform} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color}40)` }} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detail cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SATISFACTION_DATA.map((d) => (
                <div key={d.platform} className="glass-card p-4 animate-fade-in-up">
                  <h4 className="text-sm font-semibold text-noir-text mb-3" style={{ color: d.color }}>
                    {d.platform}
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Overall', value: d.overall, max: 5 },
                      { label: 'Pay Fairness', value: d.pay, max: 5 },
                      { label: 'Support', value: d.support, max: 5 },
                      { label: 'Deactivation Fear', value: d.fear, max: 5 },
                    ].map((metric) => (
                      <div key={metric.label} className="flex items-center gap-2">
                        <span className="text-[10px] text-noir-muted w-24 shrink-0">{metric.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-noir-border overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(metric.value / metric.max) * 100}%`,
                              backgroundColor: metric.label === 'Deactivation Fear' ? '#ff00aa' : d.color,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono w-6 text-right text-noir-text-secondary">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-5 text-center animate-fade-in-up">
              <p className="text-sm text-noir-text-secondary mb-3">Help shape the Satisfaction Index</p>
              <button className="neon-btn neon-btn-cyan text-sm">Take the Survey</button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && <DriverProfileCard />}
      </div>
    </div>
  );
}
