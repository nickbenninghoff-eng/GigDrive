export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="relative z-10 px-4 py-8 md:py-12 max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-noir-text mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-noir-muted mb-8">Last updated: March 29, 2026</p>

        <div className="glass-card p-6 md:p-8 space-y-6 text-sm text-noir-text-secondary leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">1. Introduction</h2>
            <p>
              Phenomogen LLC ("Company," "we," "us," or "our") operates the GigDrive application and website
              (collectively, the "Service"). This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our Service.
            </p>
            <p className="mt-2">
              By using the Service, you agree to the collection and use of information in accordance with this policy.
              If you do not agree with the terms of this Privacy Policy, please do not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">2. Information We Collect</h2>
            <h3 className="text-sm font-semibold text-noir-text mt-4 mb-2">2.1 Personal Information</h3>
            <p>When you create an account, we may collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Email address</li>
              <li>Display name</li>
              <li>ZIP code</li>
              <li>Gig platform affiliations (e.g., Uber, Lyft, DoorDash)</li>
            </ul>

            <h3 className="text-sm font-semibold text-noir-text mt-4 mb-2">2.2 Financial and Vehicle Information</h3>
            <p>When you use our tracking features, we may collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Vehicle details (make, model, year, purchase price)</li>
              <li>Expense records (fuel, maintenance, insurance costs)</li>
              <li>Mileage logs and trip purposes</li>
              <li>Earnings data (imported via CSV or manual entry)</li>
              <li>Gas prices you report</li>
            </ul>

            <h3 className="text-sm font-semibold text-noir-text mt-4 mb-2">2.3 Community Contributions</h3>
            <p>When you participate in the community, we collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Repair cost reports</li>
              <li>Driver tips and forum posts</li>
              <li>Votes and interactions</li>
              <li>Satisfaction survey responses</li>
            </ul>

            <h3 className="text-sm font-semibold text-noir-text mt-4 mb-2">2.4 Automatically Collected Information</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Device type and browser information</li>
              <li>IP address (for rate limiting and security)</li>
              <li>Usage patterns and feature interactions</li>
              <li>Geolocation data (only when explicitly permitted for gas price features)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain the Service</li>
              <li>To calculate cost-per-mile and vehicle rankings</li>
              <li>To generate anonymized, aggregated benchmarks and market insights</li>
              <li>To display community repair costs and driver tips</li>
              <li>To personalize your dashboard and expense tracking</li>
              <li>To process Pro subscription payments</li>
              <li>To send account-related communications</li>
              <li>To detect, prevent, and address fraud or technical issues</li>
              <li>To improve and optimize the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">4. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share data in the following circumstances:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Aggregated Data:</strong> Community repair costs, earnings benchmarks, and satisfaction surveys are shared in anonymized, aggregated form.</li>
              <li><strong>Public Contributions:</strong> Forum posts, tips, and repair reports are visible to other users along with your display name.</li>
              <li><strong>Service Providers:</strong> We use third-party services for payment processing (Stripe), database hosting (Neon), and earnings sync (Argyle for Pro users).</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law, subpoena, or court order.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">5. Data Storage and Security</h2>
            <p>
              Your data is stored on secure servers provided by Neon (PostgreSQL database) with encryption in transit
              (TLS/SSL). Passwords are hashed using bcrypt with a cost factor of 12. Authentication tokens (JWT)
              are signed with a secure secret and expire after 7 days.
            </p>
            <p className="mt-2">
              While we implement commercially reasonable security measures, no method of transmission over the
              Internet or electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">6. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate personal data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data ("right to be forgotten").</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
              <li><strong>Opt-Out:</strong> Opt out of non-essential data collection and marketing communications.</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at <span className="text-neon-cyan">privacy@gigdrive.app</span> or
              use the account deletion feature in your dashboard settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">7. Cookies and Local Storage</h2>
            <p>
              We use browser local storage (not traditional cookies) to store your authentication token and
              preferences. See our <a href="/cookies" className="text-neon-cyan hover:underline">Cookie Policy</a> for
              full details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">8. Children's Privacy</h2>
            <p>
              The Service is not directed to individuals under the age of 18. We do not knowingly collect
              personal information from children under 18. If we become aware that a child under 18 has
              provided us with personal information, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">9. California Privacy Rights (CCPA)</h2>
            <p>
              California residents have additional rights under the California Consumer Privacy Act (CCPA),
              including the right to know what personal information is collected, the right to delete personal
              information, and the right to opt-out of the sale of personal information. We do not sell personal
              information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting
              the new Privacy Policy on this page and updating the "Last updated" date. Continued use of the
              Service after changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact:<br />
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
