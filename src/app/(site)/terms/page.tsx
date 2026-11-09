import type { Metadata } from "next";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service — Shopilier",
  description: "The terms for using Shopilier to build and run your online store.",
};

export default function TermsPage() {
  return (
    <>
    <main className="container info-page">
      <section className="page-head"><span className="pill">Terms of Service</span>
        <h1>Terms of Service</h1>
        <p>Last updated: 10 November 2026</p>
      </section>
      <article className="card legal">
        <p>These terms are an agreement between you and Shopilier (&quot;we&quot;, &quot;us&quot;) for using shopilier.com and our service to build and run an online store. By creating an account or using Shopilier, you agree to these terms and to our{" "}<a className="link" href="/privacy">Privacy Policy</a>. If you don&apos;t agree, please don&apos;t use Shopilier.</p>

        <h2>Your account</h2>
        <ul>
          <li>You must be at least 18 years old, or have permission from a parent or guardian, and able to enter a contract under the laws of Bangladesh.</li>
          <li>Give us accurate details and keep them up to date, especially your email address, which we use to reach you.</li>
          <li>Keep your password safe. You are responsible for everything done through your account, including by staff you add.</li>
          <li>Tell us straight away at{" "}<a className="link" href="mailto:support@shopilier.com">support@shopilier.com</a>{" "}if you think someone else has used your account.</li>
        </ul>

        <h2>Your store and website address</h2>
        <ul>
          <li>Every plan includes a free address at <strong>yourname.shopilier.com</strong>. The name must follow our rules, can&apos;t already be used by another store, and some names are reserved.</li>
          <li>We may take back or change an address that copies another business&apos;s name or trademark, misleads visitors, or breaks these terms.</li>
          <li>The address belongs to Shopilier; you may use it while your account is active. If you connect your own domain, you remain responsible for registering and renewing it.</li>
        </ul>

        <h2>Plans, payments and renewals</h2>
        <ul>
          <li>Paid plans are billed in Bangladeshi Taka (৳), monthly or yearly, at the prices shown on our{" "}<a className="link" href="/pricing">Pricing page</a>{" "}when you subscribe.</li>
          <li>Plans renew for the same period unless you cancel before the renewal date. You can change or cancel your plan from your dashboard or by contacting us.</li>
          <li>If a payment isn&apos;t received, we may limit your store until it is paid. Each plan&apos;s limits (pages, products, staff) apply while you are on it.</li>
          <li>Payments already made are not refundable, except where Bangladeshi law requires a refund or where we tell you otherwise in writing.</li>
          <li>We may change our prices. We will tell you at least 30 days before a new price applies to you, and it will start from your next renewal.</li>
        </ul>

        <h2>What you sell and publish</h2>
        <p>You are the seller in every sale made on your store. You are responsible for your products, prices, descriptions, delivery, returns, customer service and taxes, and for following the laws that apply to your business, including consumer protection and e-commerce rules in Bangladesh.</p>
        <p>You may not use Shopilier to sell or publish anything illegal, including:</p>
        <ul>
          <li>Counterfeit goods, or content that infringes someone else&apos;s copyright or trademark.</li>
          <li>Drugs, weapons, or any other product that is banned or needs a licence you don&apos;t hold.</li>
          <li>Content that is hateful, harassing, sexually explicit involving minors, or that encourages violence.</li>
          <li>Scams, fake stores, phishing, or pages that collect payment or personal details under false pretences.</li>
          <li>Malware, or code that attacks visitors, other stores or Shopilier.</li>
        </ul>

        <h2>Your content</h2>
        <p>You keep ownership of the text, photos, products and other content you add. You give us permission to store, copy, display and process it only as needed to run your store and provide Shopilier, for example to show your website to visitors and keep backups. You confirm that you have the right to use everything you upload.</p>
        <p>Content written with &quot;Create with AI&quot; is a starting draft. Check it before you publish; you are responsible for what appears on your store.</p>

        <h2>Your customers&apos; information</h2>
        <p>Orders give you your customers&apos; names, phone numbers and addresses. Use them only to fulfil and support their orders and as the law allows, keep them private, and don&apos;t sell them. Custom code you add to your store (such as tracking pixels) is your responsibility.</p>

        <h2>Our service</h2>
        <ul>
          <li>We work to keep Shopilier available and secure, but we can&apos;t promise it will never be interrupted. We may pause it for maintenance or to fix problems.</li>
          <li>We may add, change or remove features over time. If a change removes something important you pay for, we will tell you in advance.</li>
          <li>Shopilier&apos;s software, design, templates and brand belong to us. You may use templates for your own store, but not resell or copy them outside Shopilier.</li>
        </ul>

        <h2>Suspending or closing an account</h2>
        <p>You can stop using Shopilier at any time; to delete your account and its data, contact us. We may suspend or close a store that breaks these terms, harms visitors or other users, or that the law requires us to remove. Where we reasonably can, we will warn you first and give you a chance to fix the problem.</p>

        <h2>Limits on our responsibility</h2>
        <p>Shopilier is provided &quot;as is&quot;. To the extent the law allows, we are not responsible for lost sales, lost profits or indirect losses, or for disputes between you and your customers, couriers or payment providers. Our total responsibility for any claim is limited to the amount you paid us in the 3 months before it arose. Nothing in these terms limits rights you have under Bangladeshi law that can&apos;t be limited.</p>

        <h2>Changes to these terms</h2>
        <p>We may update these terms. When we make an important change, we will tell you by email or in your dashboard before it applies, and update the date at the top of this page. If you keep using Shopilier after a change applies, you accept the new terms.</p>

        <h2>Governing law</h2>
        <p>These terms are governed by the laws of Bangladesh. Any dispute will be handled by the courts of Dhaka, Bangladesh, but we will always try to solve it with you directly first.</p>

        <h2>Contact us</h2>
        <p>Questions about these terms? Email{" "}<a className="link" href="mailto:support@shopilier.com">support@shopilier.com</a>{" "}or visit our{" "}<a className="link" href="/contact">Contact page</a>.</p>
      </article>
    </main>
      <SiteFooter />
    </>
  );
}
