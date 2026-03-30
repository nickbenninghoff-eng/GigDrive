import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-[100] flex justify-center animate-fade-in-up">
      <div className="glass-card p-4 md:p-5 max-w-2xl w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-noir-border shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-noir-text font-medium mb-1">We value your privacy</p>
          <p className="text-xs text-noir-text-secondary leading-relaxed">
            We use essential cookies and local storage to keep you logged in and remember your preferences.
            We also use analytics to improve GigDrive.
            See our{' '}
            <Link to="/privacy" className="text-neon-cyan hover:underline">Privacy Policy</Link>
            {' '}and{' '}
            <Link to="/cookies" className="text-neon-cyan hover:underline">Cookie Policy</Link>
            {' '}for details.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-xs font-medium text-noir-muted hover:text-noir-text border border-noir-border rounded-lg transition-all hover:bg-white/5"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="neon-btn neon-btn-cyan !py-2 !px-4 text-xs"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
