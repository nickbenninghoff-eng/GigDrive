export default function CookiePolicyPage() {
  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="relative z-10 px-4 py-8 md:py-12 max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-noir-text mb-2">
          Cookie Policy
        </h1>
        <p className="text-xs text-noir-muted mb-8">Last updated: March 29, 2026</p>

        <div className="glass-card p-6 md:p-8 space-y-6 text-sm text-noir-text-secondary leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device by websites you visit. GigDrive primarily
              uses browser local storage (a similar technology) rather than traditional cookies. This policy
              covers both cookies and local storage.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">2. What We Store</h2>

            <h3 className="text-sm font-semibold text-noir-text mt-4 mb-2">Essential (Required)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-noir-border">
                    <th className="text-left py-2 pr-4 text-noir-muted">Name</th>
                    <th className="text-left py-2 pr-4 text-noir-muted">Purpose</th>
                    <th className="text-left py-2 text-noir-muted">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-noir-border/30">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-neon-cyan">auth_token</td>
                    <td className="py-2 pr-4">Keeps you logged in (JWT authentication token)</td>
                    <td className="py-2">7 days</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-neon-cyan">cookie_consent</td>
                    <td className="py-2 pr-4">Remembers your cookie consent choice</td>
                    <td className="py-2">Permanent</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-neon-cyan">cookie_consent_date</td>
                    <td className="py-2 pr-4">Date you gave or declined consent</td>
                    <td className="py-2">Permanent</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-sm font-semibold text-noir-text mt-4 mb-2">Functional (Optional)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-noir-border">
                    <th className="text-left py-2 pr-4 text-noir-muted">Name</th>
                    <th className="text-left py-2 pr-4 text-noir-muted">Purpose</th>
                    <th className="text-left py-2 text-noir-muted">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-noir-border/30">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-neon-amber">calculator_state</td>
                    <td className="py-2 pr-4">Remembers your last calculator inputs</td>
                    <td className="py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">3. Third-Party Services</h2>
            <p>We may use the following third-party services that set their own cookies:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Stripe</strong> — Payment processing for Pro subscriptions</li>
              <li><strong>Argyle</strong> — Earnings sync for Pro users (connects to gig platforms)</li>
              <li><strong>Google AdSense / AdMob</strong> — Advertising on the free tier</li>
            </ul>
            <p className="mt-2">
              Each third-party service has its own privacy policy governing how they use cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">4. Managing Your Preferences</h2>
            <p>You can manage cookies and local storage in several ways:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Cookie consent banner:</strong> Accept or decline when you first visit GigDrive.</li>
              <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies and local storage.</li>
              <li><strong>Clearing data:</strong> You can clear all GigDrive data from your browser's developer tools
                  (Application &gt; Local Storage &gt; Clear).</li>
            </ul>
            <p className="mt-2">
              Note: Declining or clearing essential cookies will log you out and may affect Service functionality.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">5. Contact</h2>
            <p>
              For questions about this Cookie Policy, contact:<br />
              <strong className="text-noir-text">Phenomogen LLC</strong><br />
              Email: <span className="text-neon-cyan">privacy@gigdrive.app</span><br />
              St. Joseph County, Indiana
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
