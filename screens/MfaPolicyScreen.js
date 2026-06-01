import PolicyScreen, { Section, Para, Bullet, SubHeading } from './PolicyScreen';

export default function MfaPolicyScreen({ navigation }) {
  return (
    <PolicyScreen navigation={navigation} title="Multi-Factor Authentication (MFA) Policy">

      <Section>
        <Para>
          TyTheCoinGuy, LLC requires phishing-resistant multi-factor authentication for all
          consumers on both mobile and web applications before Plaid Link is surfaced. This
          document describes how MFA is implemented, enforced, and audited across our platform.
        </Para>
        <Para>
          Security Contact: tymur@tythecoinguy.com
        </Para>
      </Section>

      <Section title="1. MFA Requirement Before Plaid Link">
        <Para>
          Plaid Link is never surfaced to a consumer until phishing-resistant MFA has been
          successfully completed in the current session. This applies to both the mobile app (iOS
          and Android via Expo/React Native) and the web application. There is no path through
          which a consumer can reach Plaid Link without completing MFA first.
        </Para>
      </Section>

      <Section title="2. Phishing-Resistant MFA Methods">
        <Para>
          TyTheCoinGuy implements the following phishing-resistant MFA methods, consistent with
          NIST SP 800-63B Authenticator Assurance Level 2 (AAL2):
        </Para>

        <SubHeading>Time-Based One-Time Passwords (TOTP)</SubHeading>
        <Para>
          Consumers enroll a TOTP authenticator app (Google Authenticator, Authy, or any
          RFC 6238-compliant app) at account registration. A fresh 6-digit code is required at
          every login session. TOTP codes are time-bound (30-second window) and single-use,
          making them resistant to replay and phishing attacks.
        </Para>

        <SubHeading>Hardware OTP Support</SubHeading>
        <Para>
          Consumers may use hardware OTP tokens (e.g., YubiKey OTP mode) as their TOTP source.
          These qualify as hardware OTP authenticators under NIST SP 800-63B and provide the
          highest level of phishing resistance available to consumers.
        </Para>
      </Section>

      <Section title="3. Enrollment and Enforcement">
        <Bullet>MFA enrollment is mandatory at account registration — it cannot be skipped or deferred</Bullet>
        <Bullet>MFA verification is required at the start of every new login session, regardless of device or location</Bullet>
        <Bullet>Sessions that have not completed MFA are blocked from accessing any financial feature, including Plaid Link</Bullet>
        <Bullet>MFA enrollment status is stored server-side and verified by the backend before Plaid Link tokens are issued</Bullet>
        <Bullet>Re-authentication (fresh MFA) is required if a session expires or is flagged as suspicious</Bullet>
      </Section>

      <Section title="4. MFA for Administrative Access">
        <Bullet>All administrative and production system access requires the same TOTP MFA as consumer accounts</Bullet>
        <Bullet>Admin sessions that fail or skip MFA are automatically terminated</Bullet>
        <Bullet>No service account or non-human process bypasses MFA requirements via shared credentials</Bullet>
      </Section>

      <Section title="5. Audit and Logging">
        <Bullet>All MFA enrollment events are logged with timestamp, user ID, and authenticator type</Bullet>
        <Bullet>All MFA verification attempts (success and failure) are logged and retained for audit purposes</Bullet>
        <Bullet>Failed MFA attempts trigger rate-limiting and, after repeated failures, temporary account lockout</Bullet>
        <Bullet>Logs are stored in Google Cloud / Firebase with tamper-evident controls and retained for a minimum of 12 months</Bullet>
      </Section>

      <Section title="6. Policy Review">
        <Para>
          This policy is reviewed at least annually and updated whenever MFA implementation
          changes, new authenticator methods are adopted, or relevant regulatory guidance is
          updated. Questions should be directed to tymur@tythecoinguy.com.
        </Para>
      </Section>

    </PolicyScreen>
  );
}
