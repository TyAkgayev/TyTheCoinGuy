import PolicyScreen, { Section, Para, Bullet, SubHeading } from './PolicyScreen';

export default function DataRetentionScreen({ navigation }) {
  return (
    <PolicyScreen navigation={navigation} title="Data Retention & Disposal Policy">

      <Section>
        <Para>
          This Data Retention and Disposal Policy describes how TyTheCoinGuy, LLC retains, manages,
          and securely disposes of personal and financial data, including consumer data received from
          the Plaid API. This policy is reviewed annually and updated as required by applicable law
          or business changes.
        </Para>
      </Section>

      <Section title="1. Purpose and Scope">
        <Para>
          The purpose of this policy is to ensure that personal and financial data is retained only
          for as long as necessary for the purposes for which it was collected and to comply with
          applicable legal and regulatory obligations. This policy applies to all data processed by
          TyTheCoinGuy, including data stored in cloud databases, backups, logs, and third-party
          service integrations.
        </Para>
      </Section>

      <Section title="2. Data Categories and Retention Periods">

        <SubHeading>A. Account and Identity Data</SubHeading>
        <Para>
          Name, email address, account credentials, and profile information are retained for the life
          of the account plus 90 days following account deletion to allow dispute resolution.
        </Para>

        <SubHeading>B. Transaction and Order Records</SubHeading>
        <Para>
          Purchase history, order details, pricing, and shipping records are retained for a minimum
          of seven (7) years from the transaction date to comply with applicable financial recordkeeping
          regulations (including IRS requirements and state tax laws applicable to precious metals dealers).
        </Para>

        <SubHeading>C. Financial Data from Plaid</SubHeading>
        <Para>
          Consumer financial data received from the Plaid API — including tokenized account numbers,
          routing numbers, and balance data — is retained only for the duration required to complete
          the associated transaction or fulfill a legitimate business purpose. Consumer financial data
          is deleted within 30 days of the purpose being fulfilled unless longer retention is required
          by law. We do not retain Plaid access tokens beyond the user's active consent period.
        </Para>

        <SubHeading>D. Payment Processing Data</SubHeading>
        <Para>
          We do not store raw payment card data. Tokenized payment references provided by PCI-compliant
          payment processors are retained for the life of the associated transaction records (see B above).
        </Para>

        <SubHeading>E. Communication Records</SubHeading>
        <Para>
          Customer support tickets, emails, and in-app messages are retained for three (3) years from
          the date of the most recent interaction, then deleted.
        </Para>

        <SubHeading>F. Security and Access Logs</SubHeading>
        <Para>
          Authentication logs, MFA events, access logs, and security incident records are retained for
          two (2) years to support security investigations and compliance audits.
        </Para>

        <SubHeading>G. Marketing and Analytics Data</SubHeading>
        <Para>
          Aggregated and anonymized analytics data may be retained indefinitely. Personally identifiable
          marketing preferences are retained until you opt out, after which they are deleted within 30 days.
        </Para>
      </Section>

      <Section title="3. Data Deletion Process">
        <Para>
          When data reaches the end of its retention period, or when a consumer requests deletion
          (see Section 4), we apply the following disposal standards:
        </Para>
        <Bullet>Database records are permanently deleted and not recoverable from active systems</Bullet>
        <Bullet>Encrypted backups containing deleted data are purged on their normal backup rotation schedule (maximum 90 days)</Bullet>
        <Bullet>Log files containing deleted user data are overwritten as part of normal log rotation</Bullet>
        <Bullet>Third-party service providers are instructed to delete associated data in accordance with our data processing agreements</Bullet>
        <Bullet>Destruction of physical media (if any) follows NIST 800-88 guidelines</Bullet>
      </Section>

      <Section title="4. Consumer Deletion Requests">
        <Para>
          Consumers may request deletion of their personal data at any time. To submit a deletion
          request:
        </Para>
        <Bullet>Email privacy@tythecoinguy.com with subject "Data Deletion Request"</Bullet>
        <Bullet>Call 1-800-TY-COINS and request account deletion</Bullet>
        <Para>
          We will confirm receipt within 5 business days and complete deletion within 30 days, except
          for data we are required to retain by law (such as transaction records subject to financial
          recordkeeping requirements). We will inform you of any data we are legally required to retain
          and the basis for retention.
        </Para>
      </Section>

      <Section title="5. Third-Party Data Processors">
        <Para>
          All third-party service providers who process personal data on our behalf are bound by data
          processing agreements that require them to maintain appropriate retention and deletion
          practices. Upon termination of a third-party relationship, we require deletion or return of
          all consumer data within 30 days.
        </Para>
      </Section>

      <Section title="6. Consent and Legal Basis">
        <Para>
          We collect and process consumer data only with appropriate legal basis — either the consumer's
          informed consent, the necessity to fulfill a contract (purchase order), or a legitimate legal
          obligation. Consent records are maintained to document the basis for data collection and are
          retained for the life of the account.
        </Para>
      </Section>

      <Section title="7. Policy Review Schedule">
        <Para>
          This policy is reviewed and updated at least annually, or when any of the following occur:
          changes in applicable privacy or financial regulations, changes to our data processing
          activities, or following a data security incident. Questions regarding this policy should
          be directed to privacy@tythecoinguy.com.
        </Para>
      </Section>

    </PolicyScreen>
  );
}
