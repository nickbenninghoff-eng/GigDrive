export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="relative z-10 px-4 py-8 md:py-12 max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-noir-text mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-noir-muted mb-8">Last updated: March 29, 2026</p>

        <div className="glass-card p-6 md:p-8 space-y-6 text-sm text-noir-text-secondary leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">1. Acceptance of Terms</h2>
            <p>
              These Terms of Service ("Terms") govern your access to and use of the GigDrive application,
              website, and services (collectively, the "Service") operated by Phenomogen LLC ("Company,"
              "we," "us," or "our"). By accessing or using the Service, you agree to be bound by these Terms.
              If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">2. Eligibility</h2>
            <p>
              You must be at least 18 years of age and capable of forming a binding contract to use the Service.
              By creating an account, you represent and warrant that you meet these requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">3. Account Registration</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>You must notify us immediately of any unauthorized access to your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">4. Service Description</h2>
            <p>
              GigDrive provides tools for gig economy drivers, including but not limited to: cost-per-mile
              calculators, vehicle rankings, expense tracking, mileage logging, earnings import, community
              repair cost data, driver tips, gas price tracking, and platform fee transparency tools.
            </p>
            <p className="mt-2">
              The Service is provided for informational and personal tracking purposes. We do not provide
              financial, tax, legal, or professional advice. Consult a qualified professional for advice
              specific to your situation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">5. User-Generated Content</h2>
            <p>
              You may submit content to the Service including repair cost reports, tips, forum posts, replies,
              reviews, gas price reports, and survey responses ("User Content"). By submitting User Content, you:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Grant Phenomogen LLC a non-exclusive, worldwide, royalty-free, perpetual license to use,
                  display, modify, and distribute your User Content in connection with the Service.</li>
              <li>Represent that your User Content is accurate to the best of your knowledge.</li>
              <li>Agree not to submit content that is false, misleading, defamatory, harassing, obscene,
                  or otherwise objectionable.</li>
              <li>Agree not to submit content that infringes on any third party's intellectual property rights.</li>
              <li>Acknowledge that User Content may be visible to other users of the Service.</li>
            </ul>
            <p className="mt-2">
              We reserve the right to remove any User Content that violates these Terms or that we deem
              inappropriate, without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">6. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Submit false, misleading, or fraudulent data (including fake repair costs or earnings)</li>
              <li>Attempt to gain unauthorized access to other users' accounts or data</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Scrape, harvest, or collect data from the Service without permission</li>
              <li>Use automated tools (bots, scrapers) to access the Service</li>
              <li>Impersonate another person or entity</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Manipulate voting systems (upvotes/downvotes) or leaderboards</li>
              <li>Circumvent rate limits or security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">7. Subscription Services (Pro Tier)</h2>
            <p>
              Certain features of the Service require a paid subscription ("Pro"). By subscribing:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You authorize us to charge the applicable subscription fee to your payment method.</li>
              <li>Subscriptions renew automatically unless cancelled before the renewal date.</li>
              <li>You may cancel your subscription at any time through your account settings.</li>
              <li>Cancellation takes effect at the end of the current billing period.</li>
              <li>Refunds are available within 7 days of initial purchase or renewal if the Service
                  is materially defective.</li>
            </ul>
            <p className="mt-2">
              Payment processing is handled by Stripe, Inc. Your payment information is transmitted
              directly to Stripe and is not stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">8. Affiliate Links</h2>
            <p>
              The Service may contain links to third-party products and services (auto parts stores, tire
              retailers, insurance providers, vehicle marketplaces). Some of these links may be affiliate
              links, meaning we earn a commission if you make a purchase. Affiliate relationships do not
              influence our rankings or recommendations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">9. Intellectual Property</h2>
            <p>
              The Service, including its design, code, text, graphics, logos, and features, is the property
              of Phenomogen LLC and is protected by copyright, trademark, and other intellectual property
              laws. You may not reproduce, distribute, modify, or create derivative works of the Service
              without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">10. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="mt-2">
              We do not warrant that: (a) the Service will be uninterrupted or error-free; (b) vehicle
              data, repair costs, gas prices, or earnings benchmarks are accurate or complete; (c) the
              Service will meet your specific requirements; (d) any calculations (including cost-per-mile,
              tax deductions, or fee transparency) constitute professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">11. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PHENOMOGEN LLC SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS
              OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE,
              WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY.
            </p>
            <p className="mt-2">
              OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THE SERVICE SHALL NOT
              EXCEED THE AMOUNT YOU HAVE PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR
              ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">12. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Phenomogen LLC, its officers, directors,
              employees, and agents from and against any claims, liabilities, damages, losses, and expenses
              (including reasonable attorneys' fees) arising out of or related to: (a) your use of the Service;
              (b) your User Content; (c) your violation of these Terms; or (d) your violation of any rights
              of another party.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">13. Dispute Resolution and Arbitration</h2>
            <p>
              Any dispute, claim, or controversy arising out of or relating to these Terms or the Service
              shall be resolved through binding arbitration administered in <strong className="text-noir-text">St.
              Joseph County, Indiana</strong>, in accordance with the rules of the American Arbitration
              Association. The arbitrator's decision shall be final and binding.
            </p>
            <p className="mt-2">
              You agree to waive any right to participate in a class action lawsuit or class-wide arbitration
              against Phenomogen LLC.
            </p>
            <p className="mt-2">
              <strong className="text-noir-text">Governing Law:</strong> These Terms shall be governed by and
              construed in accordance with the laws of the State of Indiana, without regard to its conflict
              of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">14. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service at our sole discretion,
              without prior notice, for conduct that we determine violates these Terms or is harmful to
              other users, us, or third parties, or for any other reason.
            </p>
            <p className="mt-2">
              Upon termination, your right to use the Service will immediately cease. You may request
              a copy of your data before termination by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">15. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of material
              changes by posting the updated Terms on the Service and updating the "Last updated" date.
              Your continued use of the Service after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-noir-text mb-3">16. Contact</h2>
            <p>
              For questions about these Terms, contact:<br />
              <strong className="text-noir-text">Phenomogen LLC</strong><br />
              Email: <span className="text-neon-cyan">legal@gigdrive.app</span><br />
              St. Joseph County, Indiana
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
