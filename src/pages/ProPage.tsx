import { Link } from 'react-router-dom';

const FREE_FEATURES = [
  'CPM Calculator',
  'Vehicle Rankings',
  'Community Data (read & write)',
  'Expense Tracking (manual)',
  'CSV Earnings Import',
  'Mileage Logging',
  'Gas Price Finder',
];

const PRO_FEATURES = [
  { label: 'Auto-Sync Earnings', description: 'Uber, Lyft, DoorDash, Instacart via Argyle', highlight: true },
  { label: 'Advanced Tax Reports', description: 'Detailed IRS-ready deduction reports', highlight: true },
  { label: 'Ad-Free Experience', description: 'No banner or interstitial ads', highlight: true },
  { label: 'Priority Support', description: 'Direct access to the team', highlight: false },
  { label: 'Early Access', description: 'New features before everyone else', highlight: false },
];

export default function ProPage() {
  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative z-10 px-4 py-8 md:py-16 max-w-3xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 stagger">
          <div className="animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-neon-amber/10 border border-neon-amber/30 text-neon-amber text-xs font-medium mb-4">
              Upgrade to Pro
            </span>
          </div>
          <h1 className="animate-fade-in-up text-4xl md:text-5xl font-black font-[family-name:var(--font-display)] text-noir-text mb-4">
            Drive Smarter,<br />
            <span className="neon-text-cyan">Earn More</span>
          </h1>
          <p className="animate-fade-in-up text-noir-text-secondary text-lg max-w-md mx-auto">
            Auto-sync earnings, get advanced tax reports, and enjoy an ad-free experience.
          </p>
        </header>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 stagger">
          {/* Free tier */}
          <div className="glass-card p-6 animate-fade-in-up">
            <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-noir-text mb-1">Free</h2>
            <p className="text-3xl font-bold font-mono text-noir-text-secondary mb-1">$0</p>
            <p className="text-xs text-noir-muted mb-6">Ad-supported, forever free</p>

            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-noir-text-secondary">
                  <svg className="w-4 h-4 text-neon-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/"
              className="mt-6 block text-center py-3 px-6 rounded-xl border border-noir-border text-noir-text-secondary text-sm font-medium hover:bg-white/5 transition-all no-underline"
            >
              Current Plan
            </Link>
          </div>

          {/* Pro tier */}
          <div className="glass-card p-6 border-neon-cyan/30 animate-fade-in-up relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-cyan/5 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold font-[family-name:var(--font-display)] text-neon-cyan">Pro</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan font-medium">
                  Popular
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="text-3xl font-bold font-mono text-neon-cyan">$9.99</p>
                <p className="text-sm text-noir-muted">/month</p>
              </div>
              <p className="text-xs text-noir-muted mb-6">Everything in Free, plus:</p>

              <ul className="space-y-3">
                {PRO_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-start gap-3 text-sm">
                    <svg className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <div>
                      <span className={f.highlight ? 'text-noir-text font-medium' : 'text-noir-text-secondary'}>
                        {f.label}
                      </span>
                      <p className="text-xs text-noir-muted mt-0.5">{f.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <button className="mt-6 w-full neon-btn neon-btn-cyan text-center animate-pulse-glow">
                Upgrade to Pro
              </button>
              <p className="text-[10px] text-noir-muted text-center mt-2">
                Cancel anytime. 7-day free trial.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="glass-card p-6 animate-fade-in-up">
          <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
            FAQ
          </h3>
          <div className="space-y-4">
            {[
              {
                q: 'What is Argyle auto-sync?',
                a: 'Argyle connects directly to your Uber, Lyft, DoorDash, and Instacart accounts to automatically import your earnings. No more CSV uploads.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel from your account settings and you\'ll keep Pro access through the end of your billing period.',
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. We use bank-level encryption and never store your gig platform passwords. Argyle handles all authentication securely.',
              },
            ].map((faq) => (
              <div key={faq.q}>
                <p className="text-sm font-medium text-noir-text">{faq.q}</p>
                <p className="text-sm text-noir-text-secondary mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
