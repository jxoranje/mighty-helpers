import Link from "next/link";

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgba(33,53,85,0.12)] sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.58)_36%,_transparent_68%)]" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-strong)]">
              Legal
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Privacy Policy &amp; Terms of Use
            </h1>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Last updated: August 26, 2026
            </p>

            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              >
                Back to home
              </Link>
            </div>

            {/* Table of contents for quick navigation on a long single page */}
            <nav className="mt-8 rounded-2xl border border-[var(--border-soft)] bg-white/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-strong)]">
                On this page
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>
                  <a href="#privacy-policy" className="text-[var(--accent)] hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms-of-use" className="text-[var(--accent)] hover:underline">
                    Terms of Use
                  </a>
                </li>
              </ul>
            </nav>

            <article className="prose prose-sm mt-10 max-w-none sm:prose-base prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[var(--accent)]">
              {/* ============ PRIVACY POLICY ============ */}
              <section id="privacy-policy">
                <h2>Privacy Policy</h2>
                <p>
                  Mighty Helpers (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a service of Kofe Labs LLC
                  (<a href="https://www.kofelabs.com">https://www.kofelabs.com</a>), registered in Texas. We are
                  committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
                  and safeguard information when you use our website and services.
                </p>
                <p>
                  By using Mighty Helpers, you agree to the collection and use of information in accordance with
                  this policy.
                </p>
                <p>
                  <strong>Operator contact information</strong> (required under COPPA, 16 CFR &sect; 312.4(d)):
                  <br />
                  Kofe Labs LLC
                  <br />
                  [Business mailing address]
                  <br />
                  [Business phone number]
                  <br />
                  Email: <a href="mailto:hello@kofelabs.com">hello@kofelabs.com</a>
                </p>

                <h3>1. Information We Collect</h3>

                <h4>Parent Account Information</h4>
                 <p>
                  When an adult creates a parent account, we collect the information needed to provide and secure
                  the service:
                </p>
                <ul>
                  <li>Email address</li>
                  <li>Password (encrypted)</li>
                  <li>Display name (optional)</li>
                  <li>Google account information if you choose to sign in with Google (email, name, Google ID)</li>
                </ul>

                  <p>
                    Mighty Helpers is intended for parents and legal guardians. Parent account holders must be at
                    least 18 years old and are responsible for any child profiles they create or manage.
                    </p>

                <h4>Child Account Information</h4>
                <p>
                  Mighty Helpers uses child sub-accounts that exist within a parent&rsquo;s household and can only be
                  created by a parent or legal guardian. When a parent creates a child account, we collect:
                </p>
                <ul>
                  <li>Username</li>
                  <li>Display name</li>
                  <li>Password (encrypted)</li>
                </ul>
                <p>
                  Child accounts do not require, and we do not collect, an email address, phone number, or any other
                  direct contact information from a child. Child accounts cannot be created independently &mdash;
                  only a verified parent account holder can create one.
                </p>

                <h4>Usage Information</h4>
                <p>We automatically collect the following when the service is used:</p>
                <ul>
                  <li>Chore assignments and completion records</li>
                  <li>Points earned and redeemed</li>
                  <li>Goals and rewards created</li>
                  <li>Login timestamps and activity logs</li>
                </ul>
                <p>
                  We do not use persistent identifiers to track children across other websites or services, and we
                  do not use children&rsquo;s activity data for advertising or profiling.
                </p>

                <h4>Payment Information</h4>
                <p>
                  Payment processing is handled by Stripe. We do not store your credit card numbers or full payment
                  details. We receive and store:
                </p>
                <ul>
                  <li>Transaction confirmation and IDs</li>
                  <li>Purchase amount and tier purchased</li>
                  <li>Billing email (as provided to Stripe)</li>
                </ul>

                <h3>2. How We Use Your Information</h3>
                <p>We use collected information to:</p>
                <ul>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Create and manage your account</li>
                  <li>Process transactions and send related information</li>
                  <li>Send administrative messages, updates, and security alerts</li>
                  <li>Respond to your comments, questions, and support requests</li>
                  <li>Monitor and analyze usage trends to improve user experience</li>
                  <li>Detect, prevent, and address technical issues or fraudulent activity</li>
                </ul>
                <p>
                  We do not use children&rsquo;s information for marketing, advertising, or any purpose beyond
                  operating the chore/rewards features the parent has set up.
                </p>

                <h3>3. Children&rsquo;s Privacy (COPPA)</h3>
                <p>
                  Mighty Helpers is designed to be used by families, including children under age 13. We comply with
                  the Children&rsquo;s Online Privacy Protection Act (COPPA), 16 CFR Part 312.
                </p>
                <p>
                  <strong>Parental creation and consent.</strong> Child profiles may be created only by a parent
                  or legal guardian through that adult&rsquo;s Mighty Helpers account. Before creating a child
                  profile, the parent or legal guardian is asked to review and agree to our Terms of Service and
                  Privacy Policy. By creating a child profile, the parent or legal guardian represents that they
                  are authorized to do so and consents to our collection, use, storage, and limited disclosure of
                  the child&rsquo;s information as described in this Privacy Policy.
                </p>
                <p>
                  We use child-profile information only to provide Mighty Helpers&rsquo; household chore,
                  completion-tracking, points, and rewards features. We do not require children to provide email
                  addresses, phone numbers, or other direct contact information, and we do not use children&rsquo;s
                  information for behavioral advertising, marketing, or profiling.
                </p>
                <p>
                  <strong>What we collect from children.</strong> We collect only a username, display name, and
                  encrypted password for each child sub-account &mdash; never an email address, phone number, or
                  other direct identifier.
                </p>
                <p>
                  <strong>How we use and disclose children&rsquo;s information.</strong> Children&rsquo;s information
                  is used solely to operate chore assignment, completion tracking, and the points/rewards system
                  inside the parent&rsquo;s household. We disclose it only to Supabase (secure data storage) and
                  never for marketing, advertising, or profiling.
                </p>
                <p>
                  <strong>Parental rights.</strong> As a parent, you may at any time, through your parent dashboard
                  or by contacting us:
                </p>
                <ul>
                  <li>Review the personal information we have collected from your child</li>
                  <li>Request correction or deletion of your child&rsquo;s information</li>
                  <li>
                    Refuse to permit any further collection or use of your child&rsquo;s information, which will
                    result in deactivation of that child&rsquo;s account
                  </li>
                </ul>
                <p>
                 <strong>Notice to parents.</strong> Before a child profile is created, the parent or legal
                  guardian is provided access to this Privacy Policy, which explains the categories of child
                  information we collect, how we use it, the limited service providers that may process it, and the
                  parent&rsquo;s choices and rights. Parents may contact us at{" "}
                  <a href="mailto:hello@kofelabs.com">hello@kofelabs.com</a> with questions or requests about a
                  child profile.
                </p>
                <p>
                  <strong>Retention.</strong> We retain a child&rsquo;s information only as long as the associated
                  parent account and household remain active. If deleted, we remove associated child data within 30
                  days, except where retention is required by law.
                </p>

                <h3>4. Information Sharing and Disclosure</h3>
                <p>
                  We do not sell, trade, or rent your personal information. We share information only in the
                  following circumstances:
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Purpose</th>
                      <th>Data Shared</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Supabase</td>
                      <td>Secure data storage and authentication</td>
                      <td>Account, household, and chore data</td>
                    </tr>
                    <tr>
                      <td>Stripe</td>
                      <td>Payment processing</td>
                      <td>Billing details, transaction status</td>
                    </tr>
                    <tr>
                      <td>Legal/regulatory authorities</td>
                      <td>Comply with law, respond to valid legal requests</td>
                      <td>As required by law</td>
                    </tr>
                  </tbody>
                </table>
                <p>
                  We do not disclose children&rsquo;s personal information to any party beyond Supabase and Stripe as
                  described above, and never for third-party marketing purposes.
                </p>

                <h3>5. Data Security</h3>
                <p>We implement technical and organizational measures to protect personal information, including:</p>
                <ul>
                  <li>Encryption of passwords</li>
                  <li>Secure HTTPS connections</li>
                  <li>Regular security assessments</li>
                  <li>Limited employee access to personal data</li>
                </ul>
                <p>
                  No method of transmission over the internet or electronic storage is 100% secure, and we cannot
                  guarantee absolute security.
                </p>

                <h3>6. Data Retention</h3>
                <p>
                  We retain information for as long as an account is active or as needed to provide the service. If
                  you delete your account, we delete personal information (including any associated child data)
                  within 30 days, except where retention is required by law or for legitimate business purposes
                  (e.g., transaction records).
                </p>

                <h3>7. Your Rights</h3>
                <ul>
                  <li><strong>Access</strong> &mdash; request a copy of the personal information we hold about you or your child</li>
                  <li><strong>Correction</strong> &mdash; request correction of inaccurate information</li>
                  <li><strong>Deletion</strong> &mdash; request deletion of your account, or a child&rsquo;s sub-account, and associated data</li>
                  <li><strong>Data portability</strong> &mdash; request an export of your data in a portable format</li>
                  <li><strong>Withdraw consent</strong> &mdash; withdraw consent for optional data processing, or for your child&rsquo;s account entirely, at any time</li>
                </ul>
                <p>
                  To exercise any of these rights, contact us at{" "}
                  <a href="mailto:hello@kofelabs.com">hello@kofelabs.com</a>.
                </p>

                <h3>8. Cookies and Tracking</h3>
                <p>
                  We use cookies and similar technologies to keep you logged in, remember preferences, and understand
                  how the service is used. You can control cookies through your browser settings; disabling cookies
                  may affect functionality.
                </p>

                <h3>9. Third-Party Services</h3>
                <ul>
                  <li>
                    <strong>Supabase</strong> &mdash; used for sign-in authentication and storage of account data.
                    Supabase&rsquo;s own privacy policy applies to information processed through their infrastructure.
                  </li>
                  <li>
                    <strong>Stripe</strong> &mdash; used for payment processing. Stripe&rsquo;s own privacy policy
                    applies to payment information you provide directly to them.
                  </li>
                </ul>

                <h3>10. Changes to This Policy</h3>
                <p>
                  We may update this Privacy Policy periodically. We will post the updated version here and revise
                  the &ldquo;Last Updated&rdquo; date. For material changes affecting how we collect, use, or
                  disclose children&rsquo;s information, we will provide direct notice to the affected parent account
                  and, where required, obtain renewed consent.
                </p>

                <h3>11. Contact Us</h3>
                <p>
                  Kofe Labs LLC
                  <br />
                  4416 Betty Street, Bellaire, Texas 77401
                  <br />
                  346-775-1578
                  <br />
                  Email: <a href="mailto:hello@kofelabs.com">hello@kofelabs.com</a>
                </p>
              </section>

              <hr className="my-10 border-[var(--border-soft)]" />

              {/* ============ TERMS OF USE ============ */}
              <section id="terms-of-use">
                <h2>Terms of Service</h2>
                <p>
                  Welcome to Mighty Helpers. These Terms of Service (&ldquo;Terms&rdquo;) govern your use of our
                  website and services. By accessing or using Mighty Helpers, you agree to be bound by these Terms.
                  Mighty Helpers is a service of Kofe Labs LLC
                  (<a href="https://www.kofelabs.com">https://www.kofelabs.com</a>), registered in Texas.
                </p>

                <h3>1. Acceptance of Terms</h3>
                <p>
                  By creating an account or using our service, you acknowledge that you have read, understood, and
                  agree to be bound by these Terms. If you do not agree, you may not use our service.
                </p>
                <p>
                  If you create a child sub-account, you represent that you are the parent or legal guardian of that
                  child and consent to these Terms, and to our Privacy Policy, on their behalf.
                </p>

                <h3>2. Description of Service</h3>
                <p>Mighty Helpers is a family chore management platform that allows parents to:</p>
                <ul>
                  <li>Create and manage child sub-accounts</li>
                  <li>Assign chores and set point values</li>
                  <li>Track chore completion</li>
                  <li>Manage a points-based reward system</li>
                </ul>
                <p>
                  Children, through the sub-account their parent creates for them, can view assigned chores, mark
                  them complete, track points, and redeem rewards.
                </p>

                <h3>3. Account Types and Registration</h3>
                <h4>Parent Accounts</h4>
                <p>To use Mighty Helpers, you must create a parent account. You must:</p>
                <ul>
                  <li>Be at least 18 years old</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized account access</li>
                </ul>
                <h4>Child Accounts</h4>
                <p>
                  Child accounts are sub-accounts that exist only within a parent&rsquo;s household and can be
                  created solely by the parent account holder. Children may not independently register for or create
                  their own account.
                </p>
                <p>
                  By creating or managing a child profile, you represent that you are the child&rsquo;s parent or
                  legal guardian, or otherwise have authority to create and manage the profile. You authorize
                  Mighty Helpers to collect, use, and store the limited child-profile information described in our
                  Privacy Policy solely to provide the service.
                </p>

                <h3>4. Account Tiers and Pricing</h3>
                <p>Mighty Helpers currently offers one subscription tier:</p>
                <ul>
                  <li><strong>Standard ($5/month, recurring):</strong> unlimited child sub-accounts</li>
                </ul>
                <p>
                  All payments are recurring monthly charges that grant access to the Standard tier for the billing
                  period in which payment is made. Payment processing is handled by Stripe. Creating a parent
                  account, accepting these Terms, and creating a child profile are separate steps from payment.
                  </p>  
                <p>
                  Prices are subject to change for new purchases; existing
                  subscribers will be notified in advance of any price change taking effect on their account.
                </p>

                <h3>5. Payment Terms</h3>
                <p>
                  Payments are processed securely through Stripe. By subscribing, you agree to Stripe&rsquo;s terms
                  of service.
                </p>
                <p>
                  <strong>Refunds:</strong> Subscriptions are billed monthly in advance. Charges already processed
                  for the current billing period are non-refundable, except as required by law. You may cancel your
                  subscription at any time to stop future renewals; cancellation takes effect at the end of the
                  current billing period.
                </p>

                <h3>6. Acceptable Use</h3>
                <p>You agree not to:</p>
                <ul>
                  <li>Use the service for any unlawful purpose</li>
                  <li>Impersonate any person or entity</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Upload malicious code or content</li>
                  <li>Harvest or collect other users&rsquo; information without consent</li>
                  <li>Use the service to harm, exploit, or endanger minors</li>
                  <li>Create multiple free or duplicate accounts to circumvent paid tiers</li>
                  <li>Share account credentials with anyone outside your household</li>
                </ul>

                <h3>7. User Content</h3>
                <p>
                  You retain ownership of content you create within Mighty Helpers (such as chore names and reward
                  descriptions). By using the service, you grant us a limited license to store, display, and process
                  this content solely to provide the service to you.
                </p>

                <h3>8. Privacy</h3>
                <p>
                  Your use of Mighty Helpers is governed by our Privacy Policy, which is incorporated into these
                  Terms by reference.
                </p>

                <h3>9. Intellectual Property</h3>
                <p>
                  Mighty Helpers and its original content, features, and functionality are owned by Kofe Labs LLC and
                  protected by copyright, trademark, and other intellectual property laws.
                </p>

                <h3>10. Third-Party Services</h3>
                <p>
                  Our service integrates with third-party providers including Supabase (data storage and
                  authentication) and Stripe (payments). We are not responsible for the practices of third-party
                  services.
                </p>

                <h3>11. Service Availability</h3>
                <p>
                  We strive to maintain reliable service but do not guarantee uninterrupted access. We may modify or
                  discontinue features, perform maintenance, and suspend accounts that violate these Terms.
                </p>

                <h3>12. Account Termination</h3>
                <p>
                  <strong>By you:</strong> You may delete your account at any time. Deleting a parent account also
                  deletes all associated child sub-accounts and their data.
                </p>
                <p>
                  <strong>By us:</strong> We may suspend or terminate your account if you violate these Terms, engage
                  in fraudulent activity, or at our discretion for other reasons.
                </p>

                <h3>13. Disclaimer of Warranties</h3>
                <p>
                  MIGHTY HELPERS IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF
                  ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
                  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>

                <h3>14. Limitation of Liability</h3>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, MIGHTY HELPERS AND ITS OWNERS, EMPLOYEES, AND AFFILIATES
                  SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR
                  TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE
                  CLAIM, OR $10, WHICHEVER IS GREATER.
                </p>

                <h3>15. Indemnification</h3>
                <p>
                  You agree to indemnify, defend, and hold harmless Mighty Helpers and its owners, employees, and
                  affiliates from any claims, damages, losses, liabilities, and expenses arising from your use of the
                  service or violation of these Terms.
                </p>

                <h3>16. Governing Law</h3>
                <p>
                  These Terms are governed by the laws of the State of Texas. Disputes will be resolved exclusively
                  in the state or federal courts located in Texas.
                </p>

                <h3>17. Changes to Terms</h3>
                <p>
                  We may modify these Terms at any time. Continued use after changes take effect constitutes
                  acceptance of the modified Terms.
                </p>

                <h3>18. Severability</h3>
                <p>
                  If any provision of these Terms is found unenforceable, that provision will be limited or
                  eliminated to the minimum extent necessary, and the remaining provisions remain in effect.
                </p>

                <h3>19. Entire Agreement</h3>
                <p>
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and
                  Mighty Helpers regarding your use of the service.
                </p>

                <h3>20. Contact Us</h3>
                <p>
                  Kofe Labs LLC
                  <br />
                  Email: <a href="mailto:hello@kofelabs.com">hello@kofelabs.com</a>
                </p>
              </section>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
