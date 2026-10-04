import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";

function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: 20 September 2026</p>
        <div className="mt-8 space-y-6 text-muted-foreground">{children}</div>
      </section>
    </PublicLayout>
  );
}

export function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        Welcome to CoreSkils. By accessing or using coreskils.com, you agree to
        these Terms of Service.
      </p>
      <h2 className="text-xl font-semibold text-foreground">1. Accounts</h2>
      <p>
        You are responsible for keeping your account credentials confidential
        and for all activity under your account. You must provide accurate
        information when registering.
      </p>
      <h2 className="text-xl font-semibold text-foreground">2. Digital products and courses</h2>
      <p>
        Unless stated otherwise, purchases grant you a non-exclusive,
        non-transferable license for personal use. Access duration (lifetime,
        fixed days, monthly, or yearly) is shown on each product page before
        purchase.
      </p>
      <h2 className="text-xl font-semibold text-foreground">3. Acceptable use</h2>
      <p>
        You may not redistribute, resell, or publicly share purchased content or
        your account access. CoreSkils may suspend accounts that violate these
        terms.
      </p>
      <h2 className="text-xl font-semibold text-foreground">4. Creator content</h2>
      <p>
        Creators retain ownership of their content and grant CoreSkils a license
        to distribute it through the platform. Creators are responsible for the
        accuracy and legality of their content.
      </p>
      <h2 className="text-xl font-semibold text-foreground">5. Contact</h2>
      <p>
        Questions about these terms? Reach us via the{" "}
        <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
      </p>
    </LegalPage>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what data CoreSkils collects and how we use it.
      </p>
      <h2 className="text-xl font-semibold text-foreground">Data we collect</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Account data: name, email address, and sign-in credentials.</li>
        <li>Purchase data: orders, enrollments, and product entitlements.</li>
        <li>Usage data: pages visited and interactions, used to improve the platform.</li>
      </ul>
      <h2 className="text-xl font-semibold text-foreground">How we use it</h2>
      <p>
        We use your data to operate the platform, deliver purchased content,
        process orders, and communicate with you about your account. We do not
        sell your personal data.
      </p>
      <h2 className="text-xl font-semibold text-foreground">Your rights</h2>
      <p>
        You may request a copy or deletion of your personal data at any time via
        the <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
      </p>
    </LegalPage>
  );
}

export function RefundPage() {
  return (
    <LegalPage title="Refund Policy">
      <p>
        We want you to be confident in every purchase on CoreSkils.
      </p>
      <h2 className="text-xl font-semibold text-foreground">Digital products</h2>
      <p>
        Because digital products are delivered instantly, refunds are considered
        on a case-by-case basis within 7 days of purchase — for example if the
        product is defective or materially different from its description.
      </p>
      <h2 className="text-xl font-semibold text-foreground">Courses</h2>
      <p>
        Course purchases can be refunded within 7 days if you have completed
        less than 20% of the course content.
      </p>
      <h2 className="text-xl font-semibold text-foreground">How to request</h2>
      <p>
        Contact us via the{" "}
        <Link to="/contact" className="text-primary hover:underline">contact page</Link>{" "}
        with your order details. Approved refunds are processed to the original
        payment method within 5–10 business days.
      </p>
    </LegalPage>
  );
}

export function ContactPage() {
  return (
    <LegalPage title="Contact Us">
      <p>
        Have a question about a product, an order, or your account? We'd love to
        hear from you.
      </p>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Email</h2>
        <p className="mt-1">
          <a href="mailto:support@coreskils.com" className="text-primary hover:underline">
            support@coreskils.com
          </a>
        </p>
        <p className="mt-4 text-sm">
          We typically respond within 1–2 business days.
        </p>
      </div>
    </LegalPage>
  );
}
