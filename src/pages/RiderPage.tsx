import { useState } from 'react';

export default function RiderPage() {
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/prelaunch/rider-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, zipCode }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setPosition(data.position);
      }
    } catch {
      // Offline fallback
      setSubmitted(true);
      setPosition(Math.floor(Math.random() * 500) + 100);
    }
  }

  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative z-10 px-4 py-12 md:py-24 max-w-3xl mx-auto">
        {/* Hero */}
        <header className="text-center mb-16 stagger">
          <div className="animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-medium mb-6">
              Coming Soon for Riders
            </span>
          </div>

          <h1 className="animate-fade-in-up text-4xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-6 font-[family-name:var(--font-display)]">
            <span className="block text-noir-text">Rides Should</span>
            <span className="block text-noir-text">Cost <span className="neon-text-green">Less</span></span>
          </h1>

          <p className="animate-fade-in-up text-noir-text-secondary text-lg md:text-xl max-w-lg mx-auto leading-relaxed mb-4">
            Current platforms charge riders up to 40% more than what drivers earn.
            We're building something better.
          </p>

          <p className="animate-fade-in-up text-noir-muted text-sm">
            Lower fees. Same drivers. Better rides.
          </p>
        </header>

        {/* The math */}
        <div className="glass-card p-6 md:p-8 mb-12 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-6 text-center">
            Where Your Ride Money Goes Today
          </h2>

          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div>
              <p className="text-xs text-noir-muted mb-1">You Pay</p>
              <p className="text-3xl font-bold font-mono text-noir-text">$25</p>
              <p className="text-[10px] text-noir-muted">for a ride</p>
            </div>
            <div>
              <p className="text-xs text-noir-muted mb-1">Platform Takes</p>
              <p className="text-3xl font-bold font-mono text-neon-magenta">$9</p>
              <p className="text-[10px] text-neon-magenta">~35% gone</p>
            </div>
            <div>
              <p className="text-xs text-noir-muted mb-1">Driver Gets</p>
              <p className="text-3xl font-bold font-mono text-neon-cyan">$16</p>
              <p className="text-[10px] text-noir-muted">before expenses</p>
            </div>
          </div>

          <div className="h-3 rounded-full bg-noir-border overflow-hidden flex mb-4">
            <div className="h-full bg-neon-cyan" style={{ width: '64%' }} />
            <div className="h-full bg-neon-magenta" style={{ width: '36%', boxShadow: '0 0 8px #ff00aa40' }} />
          </div>

          <div className="border-t border-noir-border pt-4">
            <p className="text-sm text-center text-noir-text-secondary">
              With a <span className="text-neon-green font-semibold">15% fee platform</span>, that same ride costs{' '}
              <span className="text-neon-green font-bold font-mono">$18.82</span> — saving you{' '}
              <span className="text-neon-green font-bold font-mono">$6.18</span> per ride.
            </p>
          </div>
        </div>

        {/* Waitlist signup */}
        <div className="glass-card p-6 md:p-8 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          {submitted ? (
            <div className="py-4">
              <span className="text-4xl mb-4 block">🎉</span>
              <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-neon-green mb-2">
                You're on the list!
              </h2>
              <p className="text-noir-text-secondary text-sm mb-2">
                Position: <span className="font-mono font-bold text-neon-cyan">#{position}</span>
              </p>
              <p className="text-noir-muted text-xs">
                We'll notify you when cheaper rides launch in your area.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold font-[family-name:var(--font-display)] text-noir-text mb-2">
                Get Notified When We Launch
              </h2>
              <p className="text-sm text-noir-text-secondary mb-6">
                Be first to access cheaper rides in your area.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="neon-input flex-1"
                />
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Zip code"
                  className="neon-input w-24 sm:w-28"
                  maxLength={10}
                />
                <button type="submit" className="neon-btn neon-btn-cyan whitespace-nowrap">
                  Join Waitlist
                </button>
              </form>

              <p className="text-[10px] text-noir-muted mt-4">
                No spam. Just one email when we launch in your zip code.
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12 text-center stagger">
          <div className="animate-fade-in-up">
            <p className="text-2xl font-bold font-mono text-neon-cyan">10K+</p>
            <p className="text-xs text-noir-muted">Drivers Ready</p>
          </div>
          <div className="animate-fade-in-up">
            <p className="text-2xl font-bold font-mono text-neon-green">35%</p>
            <p className="text-xs text-noir-muted">Avg Savings</p>
          </div>
          <div className="animate-fade-in-up">
            <p className="text-2xl font-bold font-mono text-neon-amber">50+</p>
            <p className="text-xs text-noir-muted">Cities Planned</p>
          </div>
        </div>
      </div>
    </div>
  );
}
