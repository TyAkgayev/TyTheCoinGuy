import PolicyScreen, { Section, Para, Bullet, SubHeading } from './PolicyScreen';

export default function SecurityPolicyScreen({ navigation }) {
  return (
    <PolicyScreen navigation={navigation} title="Information Security & Access Controls Policy">

      <Section>
        <Para>
          This document constitutes the Information Security Policy and Access Controls Policy for
          TyTheCoinGuy, LLC. It describes the governance, controls, and operational practices in
          place to identify, mitigate, and monitor information security risks relevant to our business
          and to the consumer data we process.
        </Para>
        <Para>
          Security Contact: tymur@tythecoinguy.com
        </Para>
      </Section>

      <Section title="1. Governance and Risk Management">
        <Para>
          TyTheCoinGuy maintains a documented information security program that is continuously
          reviewed and improved. The program is owned by executive leadership and operationalized
          across development, infrastructure, and customer-facing teams.
        </Para>
        <Bullet>An information security policy is in place and reviewed at least annually</Bullet>
        <Bullet>Security risks are identified, evaluated, and treated on an ongoing basis</Bullet>
        <Bullet>All employees receive security awareness training upon onboarding and annually thereafter</Bullet>
        <Bullet>Third-party vendors with access to consumer data are subject to security review prior to engagement</Bullet>
      </Section>

      <Section title="2. Access Control Policy">
        <SubHeading>2.1 Principles</SubHeading>
        <Para>
          Access to all production systems, consumer data, and sensitive business data follows the
          principle of least privilege. Access is granted based on business need and reviewed
          periodically.
        </Para>

        <SubHeading>2.2 Controls in Place</SubHeading>
        <Bullet>A defined and documented access control policy governs all access to production assets and sensitive data</Bullet>
        <Bullet>Role-based access control (RBAC) is implemented — users are assigned only the permissions their role requires</Bullet>
        <Bullet>Access reviews are performed on a quarterly basis; privileged access is reviewed monthly</Bullet>
        <Bullet>Employee offboarding triggers automated revocation of all system access within 24 hours of termination</Bullet>
        <Bullet>Centralized identity management is used for all production system access (Firebase Authentication with custom claims)</Bullet>
        <Bullet>Non-human service accounts use scoped API keys and OAuth tokens; raw credentials are never embedded in source code</Bullet>

        <SubHeading>2.3 Multi-Factor Authentication (MFA)</SubHeading>
        <Para>
          Phishing-resistant MFA is required for all access to production systems and for consumers
          before financial features (including Plaid Link) are surfaced. We implement TOTP-based MFA
          (time-based one-time passwords via authenticator apps such as Google Authenticator and
          Authy), which qualifies as phishing-resistant under NIST SP 800-63B.
        </Para>
        <Bullet>All consumer accounts must enroll in TOTP MFA at registration</Bullet>
        <Bullet>TOTP verification is required at every login session before Plaid Link is accessible</Bullet>
        <Bullet>Administrative access to production infrastructure requires TOTP MFA</Bullet>
        <Bullet>MFA enrollment and verification events are logged and retained for audit purposes</Bullet>

        <SubHeading>2.4 Physical Access</SubHeading>
        <Bullet>All production infrastructure is hosted in cloud environments (Google Cloud / Firebase) with SOC 2 Type II certification</Bullet>
        <Bullet>No physical on-premises servers store consumer financial data</Bullet>
      </Section>

      <Section title="3. Infrastructure and Network Security">
        <Bullet>All data in transit between clients and servers is encrypted using TLS 1.2 or higher</Bullet>
        <Bullet>Consumer financial data received from Plaid is encrypted at rest using AES-256</Bullet>
        <Bullet>All other consumer personal data is encrypted at rest within Firebase/Google Cloud infrastructure</Bullet>
        <Bullet>Production environments are logically separated from development and staging</Bullet>
        <Bullet>API keys and secrets are managed via environment variables and secret management services, never committed to source control</Bullet>
      </Section>

      <Section title="4. Vulnerability Management">
        <Bullet>Automated dependency scanning runs on every code commit via CI/CD pipeline</Bullet>
        <Bullet>Identified vulnerabilities in production assets are patched within a defined SLA (critical: 24 hours, high: 7 days, medium: 30 days)</Bullet>
        <Bullet>End-of-life (EOL) software and dependencies are actively monitored and replaced before EOL dates</Bullet>
        <Bullet>Periodic security reviews of application code are conducted prior to major releases</Bullet>
      </Section>

      <Section title="5. Incident Response">
        <Para>
          TyTheCoinGuy maintains an incident response plan. In the event of a confirmed or suspected
          security incident involving consumer data:
        </Para>
        <Bullet>Incidents are reported to tymur@tythecoinguy.com and triaged within 4 hours of discovery</Bullet>
        <Bullet>Affected consumers are notified as required by applicable state and federal breach notification laws</Bullet>
        <Bullet>Plaid is notified of any incident involving data received from the Plaid API within 48 hours</Bullet>
        <Bullet>Post-incident reviews are conducted to identify root causes and prevent recurrence</Bullet>
      </Section>

      <Section title="6. Policy Review">
        <Para>
          This policy is reviewed and updated at least annually, or following a significant security
          incident, major infrastructure change, or change in applicable regulatory requirements.
          Questions regarding this policy should be directed to tymur@tythecoinguy.com.
        </Para>
      </Section>

    </PolicyScreen>
  );
}
