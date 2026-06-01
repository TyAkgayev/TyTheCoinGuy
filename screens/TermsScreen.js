import PolicyScreen, { Section, Para, Bullet, SubHeading } from './PolicyScreen';

export default function TermsScreen({ navigation }) {
  return (
    <PolicyScreen navigation={navigation} title="Terms & Conditions">

      <Section>
        <Para>
          Welcome to TyTheCoinGuy. By accessing or using our website, mobile application, or any of
          our services (the "Services"), you agree to be bound by these Terms and Conditions ("Terms").
          If you do not agree, please do not use our Services. These Terms govern your purchase of
          precious metals, coins, and related products from TyTheCoinGuy, LLC.
        </Para>
      </Section>

      <Section title="1. Eligibility">
        <Bullet>You must be at least 18 years of age to create an account or make a purchase</Bullet>
        <Bullet>You must provide accurate and complete registration information</Bullet>
        <Bullet>You are responsible for maintaining the security of your account credentials and enabling multi-factor authentication</Bullet>
        <Bullet>You agree to notify us immediately of any unauthorized access to your account</Bullet>
      </Section>

      <Section title="2. Account Registration and Security">
        <Para>
          To access certain features, you must create an account. You agree to:
        </Para>
        <Bullet>Provide truthful, accurate, and current information during registration</Bullet>
        <Bullet>Enroll in and maintain multi-factor authentication (MFA) as required for account security</Bullet>
        <Bullet>Keep your password and MFA credentials confidential and not share them with others</Bullet>
        <Bullet>Accept responsibility for all activity occurring under your account</Bullet>
        <Para>
          We reserve the right to suspend or terminate accounts that violate these Terms or that we
          suspect have been compromised.
        </Para>
      </Section>

      <Section title="3. Purchases and Pricing">
        <SubHeading>Pricing</SubHeading>
        <Para>
          Precious metals prices fluctuate based on live spot market rates. Prices displayed on our
          platform reflect spot price plus a premium and are subject to change until your order is
          confirmed and locked in. We reserve the right to cancel any order placed at an incorrect
          price due to a system error.
        </Para>

        <SubHeading>Order Confirmation</SubHeading>
        <Para>
          An order is not considered accepted until you receive an email order confirmation. We
          reserve the right to cancel orders for any reason, including price errors, suspected fraud,
          or items that become unavailable. If we cancel your order after payment, you will receive a
          full refund.
        </Para>

        <SubHeading>Payment</SubHeading>
        <Para>
          We accept major credit cards, ACH bank transfers (via Plaid), checks, and wire transfers.
          Payment must be received within the timeframe specified at checkout. Orders not paid within
          that window may be cancelled, and market loss fees may apply per our cancellation policy.
        </Para>
      </Section>

      <Section title="4. Shipping and Insurance">
        <Bullet>All shipments are fully insured against loss or damage in transit at no additional cost</Bullet>
        <Bullet>Free shipping is available on qualifying orders over $499</Bullet>
        <Bullet>Estimated delivery times are not guarantees; we are not liable for carrier delays</Bullet>
        <Bullet>Risk of loss transfers to you upon delivery and signature (where required)</Bullet>
        <Bullet>Report any damaged or missing items within 5 business days of delivery</Bullet>
      </Section>

      <Section title="5. Returns and Cancellations">
        <Para>
          Precious metals are commodity products. All sales are final once your order is locked and
          confirmed. Cancellations requested before order lock-in will be processed without penalty.
          Cancellations after lock-in may be subject to a market loss fee equal to any difference in
          spot price between the time of purchase and cancellation. We do not accept returns for
          products that have left our facility unless they arrived damaged or are not as described.
        </Para>
      </Section>

      <Section title="6. Financial Account Linking (Plaid)">
        <Para>
          When you link a bank account for payment, you authorize TyTheCoinGuy and our service
          provider Plaid Technologies, Inc. to access your financial account data for the purpose of
          verifying your account and processing payments. You represent that you are the authorized
          holder of any bank account you link. You agree to Plaid's End User Privacy Policy in
          addition to this agreement.
        </Para>
      </Section>

      <Section title="7. Prohibited Conduct">
        <Para>You agree not to:</Para>
        <Bullet>Use our Services for any unlawful purpose, including money laundering or tax evasion</Bullet>
        <Bullet>Misrepresent your identity or provide false information at any stage of a transaction</Bullet>
        <Bullet>Attempt to gain unauthorized access to our systems, accounts, or infrastructure</Bullet>
        <Bullet>Engage in market manipulation, fraudulent chargebacks, or payment fraud</Bullet>
        <Bullet>Scrape, copy, or redistribute our pricing data or product catalog without written permission</Bullet>
        <Bullet>Use automated bots or scripts to place orders or access our platform</Bullet>
      </Section>

      <Section title="8. Disclaimer of Warranties">
        <Para>
          Our Services are provided "as is" and "as available" without warranties of any kind, express
          or implied. We do not warrant that our Services will be uninterrupted, error-free, or free
          of viruses. We make no representations regarding the investment value of any precious metals
          products. Past performance of precious metals prices does not guarantee future results.
        </Para>
      </Section>

      <Section title="9. Limitation of Liability">
        <Para>
          To the maximum extent permitted by applicable law, TyTheCoinGuy shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, including loss of profits,
          data, or goodwill. Our total liability to you for any claim arising out of or relating to
          these Terms or our Services shall not exceed the greater of (a) the amount you paid to us in
          the 12 months preceding the claim, or (b) $100.
        </Para>
      </Section>

      <Section title="10. Governing Law">
        <Para>
          These Terms are governed by and construed in accordance with the laws of the State of
          [State], without regard to conflict of law principles. Any disputes shall be resolved through
          binding arbitration in accordance with the rules of the American Arbitration Association.
          You waive any right to participate in a class-action lawsuit or class-wide arbitration.
        </Para>
      </Section>

      <Section title="11. Changes to These Terms">
        <Para>
          We may modify these Terms at any time. When we make material changes, we will provide at
          least 30 days' notice via email or prominent notice on our platform before the changes take
          effect. Continued use of our Services after the effective date of the updated Terms
          constitutes your acceptance.
        </Para>
      </Section>

      <Section title="12. Contact">
        <Para>Questions about these Terms? Contact us:</Para>
        <Bullet>Email: legal@tythecoinguy.com</Bullet>
        <Bullet>Phone: 1-800-TY-COINS</Bullet>
      </Section>

    </PolicyScreen>
  );
}
