import PolicyScreen, { Section, Para, Bullet, SubHeading } from './PolicyScreen';

export default function AccessControlScreen({ navigation }) {
  return (
    <PolicyScreen navigation={navigation} title="Access Control Policy">

      <Section>
        <Para>
          This document describes the access controls TyTheCoinGuy, LLC has in place to limit
          access to production assets (physical and virtual) and sensitive data. These controls
          apply to all employees, contractors, and automated systems that interact with our
          production environment.
        </Para>
        <Para>
          Security Contact: tymur@tythecoinguy.com
        </Para>
      </Section>

      <Section title="1. Defined and Documented Access Control Policy">
        <Para>
          A formal, written access control policy is in place and reviewed at least annually. The
          policy governs all access to production systems, cloud infrastructure, consumer data, and
          sensitive business data. Access is granted on the basis of least privilege and a
          documented business need. All policy changes are version-controlled and communicated to
          affected personnel.
        </Para>
      </Section>

      <Section title="2. Role-Based Access Control (RBAC)">
        <Para>
          Role-based access control is implemented across all production systems. Each user and
          service account is assigned only the permissions required for their specific role.
          Privilege escalation requires documented approval and is subject to additional audit
          logging. Administrative roles are strictly limited and are not used for routine
          day-to-day operations.
        </Para>
      </Section>

      <Section title="3. Periodic Access Reviews and Audits">
        <Para>
          Access rights are formally reviewed on a quarterly basis. Privileged and administrative
          access is reviewed monthly. Reviews verify that access assignments remain appropriate,
          that permissions for inactive or changed roles are promptly revoked, and that no
          excessive permissions have accumulated over time.
        </Para>
      </Section>

      <Section title="4. Automated De-Provisioning for Terminated or Transferred Employees">
        <Para>
          Employee offboarding and role transfers trigger automated revocation or modification of
          access across all production systems within 24 hours of the effective date. Access
          changes are logged and confirmed as part of the offboarding checklist maintained by
          leadership. No manual step is required to initiate this process.
        </Para>
      </Section>

      <Section title="5. Zero Trust Access Architecture">
        <Para>
          TyTheCoinGuy operates under a zero trust model: no user, device, or service is implicitly
          trusted based on network location or prior authentication alone. Every access request to
          production assets and sensitive data is authenticated, authorized, and continuously
          validated at the application layer. This is enforced through:
        </Para>
        <Bullet>Identity-based access via Firebase Authentication with custom role claims</Bullet>
        <Bullet>Mandatory MFA verification at every session before any privileged or financial action</Bullet>
        <Bullet>Per-request server-side authorization checks independent of client-side state</Bullet>
        <Bullet>No implicit trust granted to internal services — each service call is authenticated</Bullet>
      </Section>

      <Section title="6. Centralized Identity and Access Management">
        <Para>
          All production system access is managed through a centralized identity provider (Firebase
          Authentication). Custom role claims are assigned and audited centrally, providing a single
          authoritative source of truth for user permissions across all environments. There is no
          fragmented or shadow identity system in use.
        </Para>
      </Section>

      <Section title="7. OAuth Tokens and TLS Certificates for Non-Human Authentication">
        <Para>
          Non-human service accounts and third-party integrations (including Plaid) authenticate
          exclusively via scoped OAuth tokens or TLS certificates. Raw credentials and long-lived
          static passwords are never used for service-to-service communication and are never stored
          in source code or unencrypted configuration files. All secrets are managed via environment
          variables and cloud secret management services with rotation policies enforced.
        </Para>
      </Section>

    </PolicyScreen>
  );
}
