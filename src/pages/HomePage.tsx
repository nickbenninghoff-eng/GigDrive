import CpmCalculator from '../components/calculator/CpmCalculator';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-grid">
      {/* Atmospheric glow */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      {/* Scanline effect — very subtle */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015] overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="w-full h-px bg-neon-cyan"
          style={{ animation: 'scanline 8s linear infinite' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-8 md:py-12 max-w-5xl mx-auto">
        {/* Hero header */}
        <header className="text-center mb-10 stagger">
          <div className="animate-fade-in-up">
            <p className="text-xs md:text-sm font-medium uppercase tracking-[0.3em] text-neon-cyan/60 mb-3 font-[family-name:var(--font-display)]">
              Gig Driver Intelligence
            </p>
          </div>

          <h1 className="animate-fade-in-up text-4xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-4 font-[family-name:var(--font-display)]">
            <span className="block text-noir-text">Know Your</span>
            <span className="block neon-text-cyan">True Cost</span>
          </h1>

          <p className="animate-fade-in-up text-noir-text-secondary text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Every mile you drive costs more than just gas. Calculate your
            <span className="text-neon-cyan font-medium"> real cost per mile</span> — fuel, insurance,
            depreciation, maintenance, and financing — in under 60 seconds.
          </p>

          {/* Quick stats bar */}
          <div className="animate-fade-in-up flex items-center justify-center gap-6 mt-6 text-xs text-noir-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              Free Forever
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
              10,000+ Vehicles
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-amber" />
              Uber / Lyft / DoorDash
            </span>
          </div>
        </header>

        {/* Calculator */}
        <CpmCalculator />

        {/* Bottom CTA */}
        <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="glass-card inline-flex items-center gap-4 px-6 py-4">
            <p className="text-sm text-noir-text-secondary">
              Want vehicle rankings, expense tracking & community repair data?
            </p>
            <a
              href="/rankings"
              className="neon-btn neon-btn-cyan text-xs !py-2 !px-4 whitespace-nowrap no-underline"
            >
              Explore Rankings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
