import { Outlet, Link, useLocation } from 'react-router-dom';
import CookieConsent from './CookieConsent';

const navLinks = [
  { path: '/', label: 'Calculator', icon: '⚡' },
  { path: '/rankings', label: 'Rankings', icon: '🏆' },
  { path: '/benchmarks', label: 'Insights', icon: '📈' },
  { path: '/community', label: 'Community', icon: '👥' },
  { path: '/gas-prices', label: 'Gas', icon: '⛽' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
];

const currentYear = new Date().getFullYear();

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop Navbar */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 border-b border-glass-border bg-glass-bg backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-sm font-bold text-noir-deep">
            GD
          </div>
          <span className="text-lg font-bold neon-text-cyan">GigDrive</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 no-underline ${
                location.pathname === link.path
                  ? 'text-neon-cyan bg-neon-cyan/10 shadow-[0_0_15px_var(--color-neon-cyan-glow)]'
                  : 'text-noir-text-secondary hover:text-noir-text hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/pro"
            className="neon-btn neon-btn-cyan text-xs !py-2 !px-4 no-underline"
          >
            Go Pro
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-glass-border bg-noir-surface/50 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 no-underline mb-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-[10px] font-bold text-noir-deep">
                  GD
                </div>
                <span className="text-sm font-bold text-neon-cyan">GigDrive</span>
              </Link>
              <p className="text-xs text-noir-muted leading-relaxed">
                Know your true cost per mile. Optimize your gig earnings.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-semibold text-noir-text-secondary uppercase tracking-wider mb-3">Product</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">Calculator</Link>
                <Link to="/rankings" className="block text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">Rankings</Link>
                <Link to="/benchmarks" className="block text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">Insights</Link>
                <Link to="/community" className="block text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">Community</Link>
                <Link to="/pro" className="block text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">Go Pro</Link>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-semibold text-noir-text-secondary uppercase tracking-wider mb-3">Resources</h4>
              <div className="space-y-2">
                <Link to="/forum" className="block text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">Forum</Link>
                <Link to="/advocacy" className="block text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">Driver Rights</Link>
                <Link to="/gas-prices" className="block text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">Gas Prices</Link>
                <Link to="/riders" className="block text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">For Riders</Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold text-noir-text-secondary uppercase tracking-wider mb-3">Legal</h4>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">Privacy Policy</Link>
                <Link to="/terms" className="block text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">Terms of Service</Link>
                <Link to="/cookies" className="block text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">Cookie Policy</Link>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-noir-border/50 flex items-center justify-between">
            <p className="text-[10px] text-noir-muted">
              &copy; {currentYear} Phenomogen LLC. All rights reserved.
            </p>
            <p className="text-[10px] text-noir-muted">
              GigDrive is not affiliated with Uber, Lyft, DoorDash, Instacart, or Amazon.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 bg-noir-surface/95 backdrop-blur-xl border-t border-glass-border"
        style={{ paddingBottom: 'max(8px, var(--safe-area-bottom))' }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex flex-col items-center gap-1 py-3 px-3 min-w-[56px] rounded-lg transition-all duration-300 no-underline ${
              location.pathname === link.path
                ? 'text-neon-cyan'
                : 'text-noir-muted'
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            <span className="text-[10px] font-medium">{link.label}</span>
            {location.pathname === link.path && (
              <div className="absolute bottom-1 w-6 h-0.5 rounded-full bg-neon-cyan shadow-[0_0_8px_var(--color-neon-cyan-glow)]" />
            )}
          </Link>
        ))}
      </nav>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
