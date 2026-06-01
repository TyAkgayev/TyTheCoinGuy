import PolicyScreen, { Section, Para, Bullet, SubHeading } from './PolicyScreen';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <PolicyScreen navigation={navigation} title="Privacy Policy">

      <Section>
        <Para>
          TyTheCoinGuy, LLC ("TyTheCoinGuy," "we," "us," or "our") is committed to protecting your
          privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
          information when you use our website, mobile application, and services (the "Services").
        </Para>
      </Section>

      <Section title="1. Information We Collect">
        <SubHeading>A. Information You Provide Directly</SubHeading>
        <Bullet>Full name, mailing address, and contact information (email, phone)</Bullet>
        <Bullet>Account credentials (email address and hashed password)</Bullet>
        <Bullet>Payment information — processed via PCI-compliant processors; we do not store raw card numbers</Bullet>
        <Bullet>Order and transaction history</Bullet>
        <Bullet>Communications you send us (support requests, feedback)</Bullet>

        <SubHeading>B. Financial Data via Plaid</SubHeading>
        <Para>
          When you choose to link a bank account to fund purchases, we use Plaid Technologies, Inc.
          to facilitate the connection. Through Plaid we may receive tokenized account numbers,
          routing numbers, and balance information. Your use of Plaid is also governed by Plaid's
          Privacy Policy at plaid.com/legal. We do not store your banking credentials.
        </Para>

        <SubHeading>C. Information Collected Automatically</SubHeading>
        <Bullet>Device identifiers, IP address, and browser or OS type</Bullet>
        <Bullet>Pages visited, links clicked, and session duration</Bullet>
        <Bullet>Crash reports and performance diagnostics</Bullet>
      </Section>

      <Section title="2. How We Use Your Information">
        <Bullet>Process and fulfill orders for precious metals and related products</Bullet>
        <Bullet>Maintain and secure your account, including enforcing multi-factor authentication</Bullet>
        <Bullet>Facilitate bank account linking and payment processing via Plaid</Bullet>
        <Bullet>Send order confirmations, shipping updates, and account notices</Bullet>
        <Bullet>Respond to support requests and inquiries</Bullet>
        <Bullet>Detect and prevent fraud, unauthorized access, and harmful activity</Bullet>
        <Bullet>Comply with legal obligations (AML, BSA, tax reporting requirements)</Bullet>
        <Bullet>Improve and personalize our Services based on usage patterns</Bullet>
        <Bullet>Send promotional communications — only with your consent; unsubscribe at any time</Bullet>
      </Section>

      <Section title="3. Information Sharing and Disclosure">
        <Para>
          We do not sell your personal information. We share your information only in the following
          circumstances:
        </Para>
        <Bullet>Service Providers: payment processors, shipping carriers, cloud infrastructure, and analytics tools — each bound by confidentiality obligations</Bullet>
        <Bullet>Plaid: to verify and link your bank account when you initiate that connection</Bullet>
        <Bullet>Legal Requirements: when required by law, regulation, or court order, or to protect the rights and safety of TyTheCoinGuy, customers, or the public</Bullet>
        <Bullet>Business Transfers: in connection with a merger, acquisition, or sale of assets — you will be notified of any change in control affecting your data</Bullet>
      </Section>

      <Section title="4. Data Security">
        <Para>
          We implement industry-standard security measures to protect your personal information:
        </Para>
        <Bullet>All data in transit is encrypted using TLS 1.2 or higher</Bullet>
        <Bullet>Consumer financial data received from Plaid is encrypted at rest using AES-256</Bullet>
        <Bullet>Access to production systems requires phishing-resistant multi-factor authentication (TOTP)</Bullet>
        <Bullet>Access to customer data is restricted on a need-to-know basis with role-based controls</Bullet>
        <Bullet>We conduct periodic vulnerability assessments and patch identified issues within a defined SLA</Bullet>
        <Para>
          No method of transmission over the Internet or electronic storage is 100% secure. While we
          strive to protect your information, we cannot guarantee absolute security.
        </Para>
      </Section>

      <Section title="5. Data Retention">
        <Para>
          We retain your personal information for as long as your account is active or as needed to
          provide Services. Transaction records are retained for a minimum of seven (7) years to comply
          with applicable financial regulations. When data is no longer needed, we securely delete or
          anonymize it. See our Data Retention and Disposal Policy for full details.
        </Para>
      </Section>

      <Section title="6. Your Rights and Choices">
        <SubHeading>All Users</SubHeading>
        <Bullet>Access or correct your account information by logging into your account settings</Bullet>
        <Bullet>Request deletion of your account and associated personal data</Bullet>
        <Bullet>Opt out of promotional emails via the unsubscribe link in any marketing email</Bullet>

        <SubHeading>California Residents (CCPA / CPRA)</SubHeading>
        <Para>
          California residents have the right to know what personal information we collect, the right
          to delete it, the right to opt out of sale or sharing (we do not sell your data), and the
          right to non-discrimination for exercising your rights. To submit a request, contact us at
          privacy@tythecoinguy.com or call 1-800-TY-COINS.
        </Para>
      </Section>

      <Section title="7. Children's Privacy">
        <Para>
          Our Services are not directed to individuals under 18. We do not knowingly collect personal
          information from minors. If you believe a minor has provided us personal information,
          contact us immediately and we will delete it.
        </Para>
      </Section>

      <Section title="8. Changes to This Policy">
        <Para>
          We may update this Privacy Policy periodically. When we make material changes, we will
          notify you via email or a prominent notice on our Services before the change takes effect.
          Continued use of our Services after the effective date constitutes acceptance.
        </Para>
      </Section>

      <Section title="9. Contact Us">
        <Para>If you have questions or requests regarding this Privacy Policy, contact our Privacy Team:</Para>
        <Bullet>Email: privacy@tythecoinguy.com</Bullet>
        <Bullet>Phone: 1-800-TY-COINS (toll free)</Bullet>
        <Bullet>Mail: TyTheCoinGuy, LLC, Attn: Privacy Team, United States</Bullet>
      </Section>

    </PolicyScreen>
  );
}
