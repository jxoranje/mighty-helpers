import Image from "next/image";
import Link from "next/link";
import logo from "@/app/components/images/logo.png";

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-8 font-[family:var(--font-display)] text-3xl tracking-[-0.035em] text-[var(--foreground)] sm:text-4xl"
    >
      {children}
    </h2>
  );
}

function Subheading({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      id={id}
      className="scroll-mt-8 mt-10 text-xl font-semibold tracking-tight text-[var(--foreground)]"
    >
      {children}
    </h3>
  );
}

function MinorHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mt-6 text-base font-semibold text-[var(--foreground)]">
      {children}
    </h4>
  );
}

function LegalNav() {
  return (
    <nav
      aria-label="Legal page navigation"
      className="rounded-[1.5rem] border border-[var(--border-soft)] bg-white/78 p-5 shadow-sm backdrop-blur"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-strong)]">
        On this page
      </p>

      <div className="mt-4 space-y-2 text-sm">
        <a
          href="#privacy-policy"
          className="block rounded-xl px-3 py-2 font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]"
        >
          Privacy Policy
        </a>

        <a
          href="#information-we-collect"
          className="ml-2 block rounded-xl px-3 py-2 text-[var(--muted)] transition-colors hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]"
        >
          Information we collect
        </a>

        <a
          href="#childrens-privacy"
          className="ml-2 block rounded-xl px-3 py-2 text-[var(--muted)] transition-colors hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]"
        >
          Children’s privacy
        </a>

        <a
          href="#contact-us"
          className="ml-2 block rounded-xl px-3 py-2 text-[var(--muted)] transition-colors hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]"
        >
          Contact us
        </a>

        <div className="my-4 border-t border-[var(--border-soft)]" />

        <a
          href="#terms-of-use"
          className="block rounded-xl px-3 py-2 font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]"
        >
          Terms of Service
        </a>

        <a
          href="#pricing"
          className="ml-2 block rounded-xl px-3 py-2 text-[var(--muted)] transition-colors hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]"
        >
          Pricing and payment
        </a>

        <a
          href="#terms-contact"
          className="ml-2 block rounded-xl px-3 py-2 text-[var(--muted)] transition-colors hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]"
        >
          Terms contact
        </a>
      </div>
    </nav>
  );
}

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-3 rounded-2xl transition-transform duration-200 hover:-translate-y-0.5"
            aria-label="Mighty Helpers home"
          >
            <Image
              src={logo}
              alt="Mighty Helpers"
              width={52}
              height={52}
              className="h-11 w-11 rounded-2xl object-cover shadow-sm"
              priority
            />

            <span className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Mighty Helpers
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-[var(--border-strong)] bg-white/85 px-5 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
          >
            Back to home
          </Link>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] shadow-[0_20px_60px_rgba(33,53,85,0.12)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,255,255,0.58)_36%,_transparent_68%)]" />
          <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-[var(--blob-yellow)] blur-3xl opacity-55" />
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--blob-pink)] blur-3xl opacity-45" />
          <div className="pointer-events-none absolute bottom-0 right-16 h-40 w-40 rounded-full bg-[var(--blob-blue)] blur-3xl opacity-45" />

          <div className="relative border-b border-[var(--border-soft)] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-strong)]">
              Legal
            </p>

            <h1 className="mt-3 max-w-3xl font-[family:var(--font-display)] text-4xl leading-tight tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
              Privacy Policy &amp; Terms of Service
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)]">
              This page explains how Mighty Helpers handles information and the
              terms that apply when you use the service.
            </p>

            <p className="mt-4 text-sm font-medium text-[var(--muted-strong)]">
              Last updated: August 26, 2026
            </p>
          </div>

          <div className="relative grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-12 lg:py-12">
            <aside className="lg:sticky lg:top-6 lg:h-fit">
              <LegalNav />
            </aside>

            <article className="min-w-0 rounded-[1.75rem] border border-[var(--border-soft)] bg-white/78 p-6 shadow-sm backdrop-blur sm:p-8 lg:p-10">
              <div className="legal-copy">
                <section id="privacy-policy">
                  <div className="rounded-[1.25rem] border border-[var(--accent-soft)] bg-[var(--accent-soft)]/60 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                      Part one
                    </p>

                    <SectionHeading id="privacy-policy">
                      Privacy Policy
                    </SectionHeading>
                  </div>

                  <p>
                    Mighty Helpers (“we,” “us,” or “our”) is a service of Kofe
                    Labs LLC, a Texas company. This Privacy Policy explains how
                    we collect, use, store, and disclose information when you
                    use Mighty Helpers.
                  </p>

                  <p>
                    By using Mighty Helpers, you agree to the collection and
                    use of information as described in this Privacy Policy.
                  </p>

                  <div className="my-8 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--panel-muted)] p-5">
                    <p className="font-semibold text-[var(--foreground)]">
                      Operator contact information
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Kofe Labs LLC
                      <br />
                      4416 Betty Street
                      <br />
                      Bellaire, Texas 77401
                      <br />
                      346-775-1578
                      <br />
                      Email:{" "}
                      <a href="mailto:hello@kofelabs.com">
                        hello@kofelabs.com
                      </a>
                    </p>
                  </div>

                  <Subheading id="information-we-collect">
                    1. Information We Collect
                  </Subheading>

                  <MinorHeading>Parent account information</MinorHeading>

                  <p>
                    When an adult creates a Mighty Helpers account, we collect
                    the information needed to provide and secure the service:
                  </p>

                  <ul>
                    <li>Email address.</li>
                    <li>Password, which is handled and stored securely by our authentication provider.</li>
                    <li>Display name, if you choose to provide one.</li>
                    <li>
                      Google account information, if you choose a future Google
                      sign-in option, such as your email address, name, and
                      Google account identifier.
                    </li>
                  </ul>

                  <p>
                    Mighty Helpers is intended for parents and legal guardians.
                    Parent account holders must be at least 18 years old and
                    are responsible for the helper profiles they create and
                    manage.
                  </p>

                  <MinorHeading>Helper profile information</MinorHeading>

                  <p>
                    Mighty Helpers lets a parent or legal guardian create
                    helper profiles within their household. Helper profiles are
                    used on a shared family device and do not require a child
                    email address, phone number, or password.
                  </p>

                  <p>
                    When a parent creates a helper profile, we may collect:
                  </p>

                  <ul>
                    <li>A helper name or nickname.</li>
                    <li>An initial and visual tile-color preference.</li>
                    <li>Chore assignments, completions, stars, levels, streaks, and rewards activity.</li>
                  </ul>

                  <p>
                    Helper profiles cannot be created independently. They are
                    created and managed only by the parent or legal guardian
                    who controls the household account.
                  </p>

                  <MinorHeading>Usage information</MinorHeading>

                  <p>
                    We collect information generated through use of the
                    service, including:
                  </p>

                  <ul>
                    <li>Chores created and assigned by a parent.</li>
                    <li>Chore completion records.</li>
                    <li>Stars earned and rewards redeemed.</li>
                    <li>Rewards created by a parent.</li>
                    <li>Login timestamps and technical activity information needed to secure and operate the service.</li>
                  </ul>

                  <p>
                    We do not use helper-profile information for behavioral
                    advertising, marketing, or cross-site profiling.
                  </p>

                  <MinorHeading>Payment information</MinorHeading>

                  <p>
                    Stripe processes subscription payments. We do not store
                    full credit-card numbers or complete payment credentials.
                    We may receive and store subscription-related information,
                    such as:
                  </p>

                  <ul>
                    <li>Transaction confirmation and Stripe identifiers.</li>
                    <li>Subscription status and plan information.</li>
                    <li>Billing email address, as provided through Stripe.</li>
                  </ul>

                  <Subheading>2. How We Use Information</Subheading>

                  <p>We use information to:</p>

                  <ul>
                    <li>Provide, maintain, and improve Mighty Helpers.</li>
                    <li>Create and manage parent accounts and households.</li>
                    <li>Operate helper profiles, chores, stars, and rewards.</li>
                    <li>Process subscriptions and send related information.</li>
                    <li>Send administrative, security, and service-related messages.</li>
                    <li>Respond to support requests.</li>
                    <li>Detect, prevent, and address security, fraud, and technical issues.</li>
                  </ul>

                  <p>
                    We do not use helper-profile information for marketing,
                    advertising, or profiling.
                  </p>

                  <Subheading id="childrens-privacy">
                    3. Children’s Privacy
                  </Subheading>

                  <p>
                    Mighty Helpers is designed for families and may be used by
                    children under age 13 through parent-created helper
                    profiles. We intend to comply with applicable children’s
                    privacy requirements, including the Children’s Online
                    Privacy Protection Act (“COPPA”).
                  </p>

                  <p>
                    <strong>Parent creation and consent.</strong> Only a parent
                    or legal guardian may create a helper profile. By creating
                    and managing a helper profile, the parent or legal guardian
                    represents that they are authorized to do so and consents
                    to our collection and use of the limited helper-profile
                    information described in this policy.
                  </p>

                  <p>
                    <strong>Information collected from children.</strong> We
                    collect only information necessary to operate the
                    household’s chore, progress, stars, and rewards features.
                    We do not require a child to provide an email address,
                    phone number, password, or other direct contact
                    information.
                  </p>

                  <p>
                    <strong>How helper information is used.</strong> Helper
                    profile information is used only to provide Mighty
                    Helpers’ chore management, completion tracking, stars, and
                    rewards features within the parent’s household.
                  </p>

                  <p>
                    <strong>Parental choices and rights.</strong> A parent or
                    legal guardian may contact us to:
                  </p>

                  <ul>
                    <li>Review the personal information associated with a helper profile.</li>
                    <li>Request correction or deletion of helper-profile information.</li>
                    <li>Request that we stop further collection or use of helper-profile information.</li>
                  </ul>

                  <p>
                    Parents may contact us at{" "}
                    <a href="mailto:hello@kofelabs.com">
                      hello@kofelabs.com
                    </a>{" "}
                    with questions or requests concerning a helper profile.
                  </p>

                  <p>
                    <strong>Retention.</strong> We retain helper-profile
                    information only as long as the related parent account and
                    household remain active, unless a longer retention period
                    is required by law.
                  </p>

                  <Subheading>4. Information Sharing and Disclosure</Subheading>

                  <p>
                    We do not sell, trade, or rent personal information. We
                    share information only as needed to provide the service,
                    comply with the law, or protect rights and safety.
                  </p>

                  <div className="my-6 overflow-x-auto rounded-[1.25rem] border border-[var(--border-soft)]">
                    <table className="min-w-[620px] w-full border-collapse text-left text-sm">
                      <thead className="bg-[var(--panel-muted)] text-[var(--foreground)]">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Recipient</th>
                          <th className="px-4 py-3 font-semibold">Purpose</th>
                          <th className="px-4 py-3 font-semibold">Information shared</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[var(--border-soft)] text-[var(--muted)]">
                        <tr>
                          <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                            Supabase
                          </td>
                          <td className="px-4 py-3">
                            Authentication and secure data storage.
                          </td>
                          <td className="px-4 py-3">
                            Account, household, helper-profile, chore, and reward data.
                          </td>
                        </tr>

                        <tr>
                          <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                            Stripe
                          </td>
                          <td className="px-4 py-3">
                            Subscription payment processing.
                          </td>
                          <td className="px-4 py-3">
                            Billing details and subscription status.
                          </td>
                        </tr>

                        <tr>
                          <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                            Legal or regulatory authorities
                          </td>
                          <td className="px-4 py-3">
                            Compliance with valid legal requirements.
                          </td>
                          <td className="px-4 py-3">
                            Information required by applicable law.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p>
                    We do not disclose helper-profile information to third
                    parties for their own marketing purposes.
                  </p>

                  <Subheading>5. Data Security</Subheading>

                  <p>
                    We use reasonable technical and organizational safeguards
                    intended to protect personal information, including:
                  </p>

                  <ul>
                    <li>Secure HTTPS connections.</li>
                    <li>Authentication and access controls.</li>
                    <li>Secure third-party infrastructure for data storage and payments.</li>
                    <li>Limited access to personal information.</li>
                  </ul>

                  <p>
                    No method of transmitting information over the internet or
                    storing information electronically is completely secure. We
                    cannot guarantee absolute security.
                  </p>

                  <Subheading>6. Data Retention</Subheading>

                  <p>
                    We retain information while an account remains active or
                    as needed to provide the service. If an account is deleted,
                    we will delete associated personal information within a
                    reasonable period, generally within 30 days, except where
                    retention is required by law or appropriate for legitimate
                    business purposes such as transaction records.
                  </p>

                  <Subheading>7. Your Rights</Subheading>

                  <p>
                    Depending on applicable law, you may request:
                  </p>

                  <ul>
                    <li>Access to personal information we hold about you or your helper profiles.</li>
                    <li>Correction of inaccurate personal information.</li>
                    <li>Deletion of your account or a helper profile and associated information.</li>
                    <li>Export of certain data in a portable format.</li>
                    <li>Withdrawal of consent for optional data processing or a helper profile.</li>
                  </ul>

                  <p>
                    To make a request, contact{" "}
                    <a href="mailto:hello@kofelabs.com">
                      hello@kofelabs.com
                    </a>
                    .
                  </p>

                  <Subheading>8. Cookies and Similar Technologies</Subheading>

                  <p>
                    We use cookies and similar technologies to keep parents
                    signed in, maintain secure sessions, remember preferences,
                    and operate the service. You may control cookies through
                    your browser settings, although disabling cookies may
                    affect functionality.
                  </p>

                  <Subheading>9. Third-Party Services</Subheading>

                  <ul>
                    <li>
                      <strong>Supabase</strong> provides authentication and
                      secure data storage infrastructure.
                    </li>
                    <li>
                      <strong>Stripe</strong> provides payment processing for
                      subscriptions.
                    </li>
                  </ul>

                  <p>
                    These providers may process information according to their
                    own applicable privacy policies.
                  </p>

                  <Subheading>10. Changes to This Privacy Policy</Subheading>

                  <p>
                    We may update this Privacy Policy from time to time. We
                    will post the updated version here and revise the “Last
                    updated” date. Where required by law, we will provide
                    additional notice or seek renewed consent.
                  </p>

                  <Subheading id="contact-us">11. Contact Us</Subheading>

                  <p>
                    Kofe Labs LLC
                    <br />
                    4416 Betty Street
                    <br />
                    Bellaire, Texas 77401
                    <br />
                    346-775-1578
                    <br />
                    Email:{" "}
                    <a href="mailto:hello@kofelabs.com">
                      hello@kofelabs.com
                    </a>
                  </p>
                </section>

                <div className="my-14 border-t border-[var(--border-soft)]" />

                <section id="terms-of-use">
                  <div className="rounded-[1.25rem] border border-[var(--star-border)] bg-[var(--star-soft)]/65 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--star-text)]">
                      Part two
                    </p>

                    <SectionHeading id="terms-of-use">
                      Terms of Service
                    </SectionHeading>
                  </div>

                  <p>
                    Welcome to Mighty Helpers. These Terms of Service
                    (“Terms”) govern your use of our website and services.
                    Mighty Helpers is a service of Kofe Labs LLC, a Texas
                    company.
                  </p>

                  <Subheading>1. Acceptance of Terms</Subheading>

                  <p>
                    By creating an account or using Mighty Helpers, you
                    acknowledge that you have read, understood, and agree to be
                    bound by these Terms and the Privacy Policy. If you do not
                    agree, do not use the service.
                  </p>

                  <p>
                    If you create a helper profile, you represent that you are
                    the child’s parent or legal guardian, or otherwise have
                    authority to create and manage that profile.
                  </p>

                  <Subheading>2. Description of Service</Subheading>

                  <p>
                    Mighty Helpers is a family chore-management platform that
                    lets parents and guardians:
                  </p>

                  <ul>
                    <li>Create and manage household helper profiles.</li>
                    <li>Create chores and assign star values.</li>
                    <li>Track chore completion.</li>
                    <li>Manage a stars-based reward system.</li>
                  </ul>

                  <p>
                    Helpers can select their profile on a shared family device,
                    view chores, mark tasks complete, collect stars, and
                    redeem available rewards.
                  </p>

                  <Subheading>3. Parent Accounts and Helper Profiles</Subheading>

                  <MinorHeading>Parent accounts</MinorHeading>

                  <p>To use Mighty Helpers, you must create a parent account. You must:</p>

                  <ul>
                    <li>Be at least 18 years old.</li>
                    <li>Provide accurate and complete registration information.</li>
                    <li>Maintain the security of your account credentials.</li>
                    <li>Notify us promptly of unauthorized account access.</li>
                  </ul>

                  <MinorHeading>Helper profiles</MinorHeading>

                  <p>
                    Helper profiles exist only within a parent’s household and
                    are created and managed by the parent or legal guardian.
                    Children cannot independently register for Mighty Helpers
                    or create their own parent account.
                  </p>

                  <Subheading id="pricing">4. Subscription Pricing</Subheading>

                  <p>
                    Mighty Helpers currently offers one subscription plan:
                  </p>

                  <ul>
                    <li>
                      <strong>Standard plan — $5 per month:</strong> includes
                      unlimited helper profiles and access to available Mighty
                      Helpers features.
                    </li>
                  </ul>

                  <p>
                    Subscription payments are recurring monthly charges
                    processed through Stripe. Account creation, acceptance of
                    these Terms, household setup, and helper-profile setup are
                    separate from payment.
                  </p>

                  <p>
                    We may change prices for new subscriptions. Existing
                    subscribers will receive advance notice of material price
                    changes before they take effect for that subscriber.
                  </p>

                  <Subheading>5. Payment and Cancellation</Subheading>

                  <p>
                    Stripe processes subscription payments. By subscribing, you
                    also agree to Stripe’s applicable terms and policies.
                  </p>

                  <p>
                    <strong>Refunds.</strong> Subscriptions are billed in
                    advance. Amounts already paid for a current billing period
                    are generally non-refundable except where required by law.
                    You may cancel at any time to prevent future renewal.
                    Cancellation takes effect at the end of the current paid
                    billing period.
                  </p>

                  <Subheading>6. Acceptable Use</Subheading>

                  <p>You agree not to:</p>

                  <ul>
                    <li>Use Mighty Helpers for an unlawful purpose.</li>
                    <li>Impersonate a person or entity.</li>
                    <li>Attempt to gain unauthorized access to our systems.</li>
                    <li>Interfere with or disrupt the service.</li>
                    <li>Upload malicious code or content.</li>
                    <li>Collect other users’ information without consent.</li>
                    <li>Use the service to harm, exploit, or endanger minors.</li>
                    <li>Attempt to circumvent subscription requirements.</li>
                    <li>Share parent account credentials outside your household.</li>
                  </ul>

                  <Subheading>7. User Content</Subheading>

                  <p>
                    You retain ownership of content you create in Mighty
                    Helpers, including chore names and reward descriptions. You
                    grant us a limited license to store, display, and process
                    that content solely to operate and provide the service.
                  </p>

                  <Subheading>8. Privacy</Subheading>

                  <p>
                    Your use of Mighty Helpers is governed by the Privacy
                    Policy above, which is incorporated into these Terms.
                  </p>

                  <Subheading>9. Intellectual Property</Subheading>

                  <p>
                    Mighty Helpers and its original features, content, and
                    functionality are owned by Kofe Labs LLC and protected by
                    applicable intellectual-property laws.
                  </p>

                  <Subheading>10. Third-Party Services</Subheading>

                  <p>
                    Mighty Helpers integrates with service providers such as
                    Supabase for data storage and authentication and Stripe for
                    payment processing. We are not responsible for the
                    independent practices of third-party services.
                  </p>

                  <Subheading>11. Service Availability</Subheading>

                  <p>
                    We strive to maintain reliable service but do not guarantee
                    uninterrupted access. We may modify features, perform
                    maintenance, or suspend accounts that violate these Terms.
                  </p>

                  <Subheading>12. Account Termination</Subheading>

                  <p>
                    <strong>By you.</strong> You may request account deletion
                    by contacting us. Deleting a parent account may remove the
                    household and associated helper profiles, subject to the
                    retention practices described in the Privacy Policy.
                  </p>

                  <p>
                    <strong>By us.</strong> We may suspend or terminate access
                    if you violate these Terms, engage in fraud, or create a
                    risk to Mighty Helpers, its users, or others.
                  </p>

                  <Subheading>13. Disclaimer of Warranties</Subheading>

                  <p>
                    MIGHTY HELPERS IS PROVIDED “AS IS” AND “AS AVAILABLE”
                    WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED,
                    INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
                    FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>

                  <Subheading>14. Limitation of Liability</Subheading>

                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, MIGHTY HELPERS,
                    KOFE LABS LLC, AND THEIR OWNERS, EMPLOYEES, AND AFFILIATES
                    WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
                    CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR TOTAL LIABILITY
                    WILL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE
                    MONTHS BEFORE THE CLAIM OR $10, WHICHEVER IS GREATER.
                  </p>

                  <Subheading>15. Indemnification</Subheading>

                  <p>
                    You agree to indemnify, defend, and hold harmless Mighty
                    Helpers, Kofe Labs LLC, and their owners, employees, and
                    affiliates from claims, damages, losses, liabilities, and
                    expenses arising from your use of the service or violation
                    of these Terms.
                  </p>

                  <Subheading>16. Governing Law</Subheading>

                  <p>
                    These Terms are governed by the laws of the State of Texas.
                    Disputes will be resolved exclusively in the state or
                    federal courts located in Texas, unless applicable law
                    requires otherwise.
                  </p>

                  <Subheading>17. Changes to These Terms</Subheading>

                  <p>
                    We may modify these Terms from time to time. Continued use
                    of Mighty Helpers after updated Terms take effect
                    constitutes acceptance of the revised Terms, to the extent
                    permitted by law.
                  </p>

                  <Subheading>18. Severability</Subheading>

                  <p>
                    If any provision of these Terms is found unenforceable,
                    that provision will be limited or eliminated to the minimum
                    extent necessary, and the remaining provisions will remain
                    in effect.
                  </p>

                  <Subheading>19. Entire Agreement</Subheading>

                  <p>
                    These Terms and the Privacy Policy constitute the entire
                    agreement between you and Mighty Helpers regarding your use
                    of the service.
                  </p>

                  <Subheading id="terms-contact">20. Contact Us</Subheading>

                  <p>
                    Kofe Labs LLC
                    <br />
                    4416 Betty Street
                    <br />
                    Bellaire, Texas 77401
                    <br />
                    346-775-1578
                    <br />
                    Email:{" "}
                    <a href="mailto:hello@kofelabs.com">
                      hello@kofelabs.com
                    </a>
                  </p>
                </section>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}