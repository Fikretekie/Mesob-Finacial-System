import React from "react";
import { Container, Row, Col } from "reactstrap";

const TermsOfUse = () => {
  return (
    <Container className="py-5 mb-5">
      <Row>
        <Col>
          <h1 className="mb-4">Terms of Use for Mesob Financial</h1>
          <p className="lead">
            <strong>Effective Date: 01/01/2025</strong>
          </p>
          <p>
            Welcome to Mesob Financial, an online service platform designed to
            help users record and track daily transactions for trucking,
            groceries, and service provider companies. By accessing or using our
            services, you agree to be bound by the following terms and
            conditions (&quot;Terms of Use&quot;).
          </p>

          <h2 className="mt-5 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Mesob Financial platform, you acknowledge
            and agree to abide by these Terms of Use, including any future
            modifications or updates. We reserve the right to update, modify, or
            change these Terms of Use at any time, and such changes will be
            effective immediately upon posting.
          </p>

          <h2 className="mt-5 mb-3">2. User Responsibility</h2>
          <p>
            You are solely responsible for all entries, data, and transactions
            you input into the Mesob Financial system. This includes but is not
            limited to recording transactions, managing receipts, and providing
            correct financial information. Mesob Financial is not responsible
            for any errors or inaccuracies in the data entered by the user.
            Users are responsible for ensuring that all transactions are
            accurate, and for the appropriate classification and categorization
            of financial data.
          </p>

          <h2 className="mt-5 mb-3">3. System Features</h2>
          <p>Mesob Financial provides users with the following features:</p>
          <ul>
            <li>
              <strong>Transaction Recording:</strong> Users can record daily
              transactions, including expenses, income, and other financial
              activities.
            </li>
            <li>
              <strong>
                Journal Entries, Balance Sheet, and Income Statement:
              </strong>
              All recorded transactions will be reflected in the system&apos;s
              journal entries and will be available to generate balance sheets
              and income statements.
            </li>
            <li>
              <strong>Daily, Monthly, and Yearly Summaries:</strong> Users will
              have access to a summary of their financial data in daily,
              monthly, or yearly intervals, showing total expenses, income, and
              other key financial metrics.
            </li>
            <li>
              <strong>Receipt Recording:</strong> Users have the option to
              upload and record receipts for every transaction input into the
              system, allowing for better tracking and documentation of
              expenses.
            </li>
          </ul>

          <h2 className="mt-5 mb-3">4. Limitation of Liability</h2>
          <p>
            Mesob Financial makes no representations or warranties regarding the
            accuracy, completeness, or reliability of the data or financial
            statements generated by the system. The system&apos;s reports,
            including but not limited to the journal entries, balance sheets,
            and income statements, are based on the information entered by the
            user.
          </p>
          <p>
            By using the Service, you acknowledge and agree that Mesob Financial
            is not responsible for any financial losses, damages, or
            consequences resulting from the user&apos;s data entries or
            decisions based on the system&apos;s output. You agree that any
            inaccuracies in data entries, calculations, or financial statements
            are solely your responsibility, and that Mesob Financial is not
            liable for any resulting issues.
          </p>

          <h2 className="mt-5 mb-3">5. User Conduct</h2>
          <p>
            Users agree to use the Service in compliance with all applicable
            laws, rules, and regulations. You must not use the Service for any
            unlawful or fraudulent activities, and you agree not to engage in
            conduct that may harm the functionality or security of the Service.
          </p>

          <h2 className="mt-5 mb-3">6. Data Privacy and Security</h2>
          <p>
            Mesob Financial takes the security of your data seriously and will
            take reasonable measures to protect your information. However, we
            cannot guarantee absolute security, and you acknowledge that any
            transmission of data over the internet carries inherent risks. By
            using our Service, you consent to the collection, use, and storage
            of your data as described in our Privacy Policy.
          </p>

          <h2 className="mt-5 mb-3">7. Termination</h2>
          <p>
            Mesob Financial reserves the right to suspend or terminate your
            access to the Service at any time, without prior notice, if you
            violate these Terms of Use or if we deem it necessary for any
            reason. Upon termination, your right to use the Service will
            immediately cease.
          </p>

          <h2 className="mt-5 mb-3">8. No Warranty</h2>
          <p>
            Mesob Financial provides the Service &quot;as is&quot; and without
            warranties of any kind, either express or implied. We do not
            guarantee the accuracy, reliability, or availability of the Service
            or the data you input into the system. You use the Service at your
            own risk.
          </p>

          <h2 className="mt-5 mb-3">9. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless Mesob Financial
            and its affiliates, employees, agents, and partners from any claims,
            damages, liabilities, or expenses (including legal fees) arising
            from your use of the Service, including but not limited to any
            errors in data entries or failure to comply with these Terms of Use.
          </p>

          <h2 className="mt-5 mb-3">10. Governing Law</h2>
          <p>
            These Terms of Use are governed by and construed in accordance with
            the laws of Columbus, OH USA, without regard to its conflict of law
            principles. Any disputes arising under or in connection with these
            Terms of Use will be subject to the exclusive jurisdiction of the
            courts located in Columbus, OH USA.
          </p>

          <h2 className="mt-5 mb-3">11. Contact Information</h2>
          <p>
            If you have any questions or concerns regarding these Terms of Use,
            please contact us at:
          </p>
          <p>
            Mesob Financial
            <br />
            Email: mesob@mesobstore.com
            <br />
            Website: mesobfinancial.com
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default TermsOfUse;
