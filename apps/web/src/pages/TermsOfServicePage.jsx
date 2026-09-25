import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import { FileText, ChevronDown, ChevronUp, Mail } from 'lucide-react';

/*
  CasaCEO — Terms of Service (/terms)
  --------------------------------------------------------------------------
  Was an exact duplicate of PrivacyPolicyPage.jsx (same component, same
  content, same "Your privacy, plainly" headline) — /terms and /privacy
  rendered the identical page. This is a real, distinct first draft that
  describes what CasaCEO actually is and does: organizes bills, maintenance,
  and documents; never touches a bank account; never moves money; the user
  always pays on the real site, on their own. Pricing terms reference the
  live Pricing page rather than hardcoding numbers here, so this doesn't
  drift out of sync when pricing changes.

  NOTE: this is a product-accuracy + drafting pass, NOT legal counsel. The
  legal substance (liability, dispute resolution, governing law, and
  everything else here) needs review by a lawyer before this is relied on.
*/

const INK = '#1C3553';
const GOLD = '#c9a96e';
const PAPER = '#F6F3EC';
const SAND = '#EFE9DD';
const STONE = '#6E6A62';
const LINE = '#E3DCCE';

const serif = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const Wordmark = () => (
  <span style={{ textTransform: 'none', whiteSpace: 'nowrap' }}>Casa<span style={{ color: GOLD }}>CEO</span></span>
);

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};
const FadeIn = ({ children, delay = 0 }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms` }}>
      {children}
    </div>
  );
};

const ulStyle = { paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'disc' };

const SECTIONS = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>These Terms of Service ("Terms") govern your access to and use of CasaCEO, operated by CasaCEO, LLC ("CasaCEO," "we," "us," or "our"). By creating an account or using the service, you agree to these Terms. If you don’t agree, please don’t use CasaCEO.</p>
      </div>
    ),
  },
  {
    id: 'the-service',
    title: 'What CasaCEO Is',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>CasaCEO helps you organize the bills, maintenance, and documents for the homes you own. Specifically:</p>
        <ul style={ulStyle}>
          <li>CasaCEO reads and organizes the bills you forward to it — it does not connect to your bank or any financial account.</li>
          <li>CasaCEO never stores a payment card and never moves money on your behalf. You always pay your bills yourself, directly with the biller.</li>
          <li>Maintenance reminders and document storage are organizational tools — CasaCEO does not perform, schedule, or guarantee any repair, service, or filing on your behalf.</li>
        </ul>
        <p>CasaCEO is a record-keeping and reminder tool. It is not a bank, a bill-pay service, a licensed contractor, an insurance agency, or a law, tax, or financial advisory service.</p>
      </div>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts',
    content: (
      <ul style={ulStyle}>
        <li>You must be at least 18 years old to create an account.</li>
        <li>You’re responsible for the accuracy of the information you provide and for keeping your login credentials confidential.</li>
        <li>You’re responsible for activity that happens under your account. Tell us right away at <span style={{ color: INK, fontWeight: 600 }}>hello@casaceo.com</span> if you suspect unauthorized access.</li>
      </ul>
    ),
  },
  {
    id: 'billing',
    title: 'Subscription & Billing',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <ul style={ulStyle}>
          <li>CasaCEO is billed per property, monthly or annually. Current plans and pricing are posted on our <Link to="/pricing" style={{ color: INK, fontWeight: 600 }}>Pricing page</Link>.</li>
          <li>Subscriptions renew automatically at the end of each billing period until you cancel.</li>
          <li>You can cancel anytime from your account settings. Cancellation stops future billing; it does not refund the current billing period unless we say otherwise or the law requires it.</li>
          <li>We’ll give you reasonable notice before any price change takes effect for your account.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>When using CasaCEO, you agree not to:</p>
        <ul style={ulStyle}>
          <li>Use the service for anything unlawful, or to forward or upload content you don’t have the right to share.</li>
          <li>Attempt to break, reverse-engineer, or interfere with the service, or access it through unauthorized means.</li>
          <li>Impersonate another person or misrepresent your affiliation with anyone.</li>
          <li>Use CasaCEO to manage properties or bills on behalf of others without their knowledge, in a way that would violate their privacy.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'your-content',
    title: 'Your Content & Data',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>You own the information and documents you add to CasaCEO. You give us a limited license to store, process, and display that content solely to provide the service to you.</p>
        <p>How we collect, use, and protect that data is described in our <Link to="/privacy" style={{ color: INK, fontWeight: 600 }}>Privacy Policy</Link>, which is part of these Terms.</p>
      </div>
    ),
  },
  {
    id: 'ip',
    title: 'Intellectual Property',
    content: (
      <p>CasaCEO, its design, software, and branding are owned by CasaCEO, LLC. These Terms don’t grant you any rights to our intellectual property beyond using the service as intended.</p>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>CasaCEO is provided "as is." We work to read and categorize your bills accurately, but we don’t guarantee that every amount, due date, or category will be error-free — always confirm the details with the actual bill before you pay it.</p>
        <p>CasaCEO doesn’t provide legal, tax, financial, or contracting advice, and nothing in the service should be treated as such.</p>
      </div>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    content: (
      <p>To the fullest extent permitted by law, CasaCEO, LLC is not liable for indirect, incidental, or consequential damages arising from your use of the service, including a missed or incorrect bill, late fee, or maintenance reminder. Our total liability for any claim relating to the service is limited to the amount you paid us in the twelve months before the claim arose.</p>
    ),
  },
  {
    id: 'termination',
    title: 'Termination',
    content: (
      <ul style={ulStyle}>
        <li>You may stop using CasaCEO and delete your account at any time.</li>
        <li>We may suspend or terminate an account that violates these Terms or that we reasonably believe puts other users or the service at risk.</li>
        <li>What happens to your data after account deletion is described in our <Link to="/privacy" style={{ color: INK, fontWeight: 600 }}>Privacy Policy</Link>.</li>
      </ul>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to These Terms',
    content: (
      <p>We may update these Terms as CasaCEO changes. If we make a material change, we’ll let you know before it takes effect. Continuing to use CasaCEO after a change means you accept the updated Terms.</p>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing Law',
    content: (
      <p>These Terms are governed by the laws of the State of Georgia, without regard to its conflict-of-law principles.</p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p>Questions about these Terms? Reach us at:</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', background: SAND, width: 'fit-content' }}>
          <Mail style={{ width: '16px', height: '16px', color: INK }} />
          <span style={{ fontWeight: 600, color: INK, fontSize: '14px' }}>hello@casaceo.com</span>
        </div>
      </div>
    ),
  },
];

const AccordionSection = ({ section, index }) => {
  const [open, setOpen] = useState(index === 0);
  return (
    <div style={{ borderBottom: `1px solid ${LINE}` }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', padding: '20px 28px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: GOLD, background: SAND, padding: '2px 8px', borderRadius: '999px', flexShrink: 0 }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <p style={{ fontFamily: sans, fontWeight: 700, color: INK, fontSize: '16px' }}>{section.title}</p>
        </div>
        {open ? <ChevronUp style={{ width: '18px', height: '18px', color: STONE, flexShrink: 0 }} /> : <ChevronDown style={{ width: '18px', height: '18px', color: STONE, flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ padding: '0 28px 24px', color: STONE, fontFamily: sans, fontSize: '14px', lineHeight: 1.8 }}>
          {section.content}
        </div>
      )}
    </div>
  );
};

const TermsOfServicePage = () => (
  <SiteLayout seo={{ title: 'Terms of Service — CasaCEO' }} fullWidth>
    <section style={{ background: INK, padding: '80px 24px 62px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(62,107,168,0.22)', filter: 'blur(20px)', top: '-180px', right: '-100px' }} />
      </div>
      <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <FileText style={{ width: '26px', height: '26px', color: GOLD }} />
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 600, color: '#fff', marginBottom: '14px', letterSpacing: '-0.015em' }}>The plain-language terms.</h1>
        <p style={{ fontFamily: sans, fontSize: '16px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, maxWidth: '480px', margin: '0 auto 18px' }}>
          What using <Wordmark /> means for you, written the way we’d actually explain it.
        </p>
        <p style={{ fontFamily: sans, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Last updated: September 2026</p>
      </div>
    </section>

    <section style={{ padding: '60px 24px', background: PAPER }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${LINE}`, overflow: 'hidden' }}>
            {SECTIONS.map((section, i) => (
              <AccordionSection key={section.id} section={section} index={i} />
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ marginTop: '32px', padding: '20px 24px', borderRadius: '12px', background: SAND, border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText style={{ width: '18px', height: '18px', color: INK, flexShrink: 0 }} />
            <p style={{ fontFamily: sans, fontSize: '13px', color: INK, lineHeight: 1.6 }}>
              By using <Wordmark />, you agree to these Terms. Questions? <span style={{ fontWeight: 700 }}>hello@casaceo.com</span>.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={150}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', marginTop: '32px' }}>
            {[['Privacy Policy', '/privacy'], ['Cookie Policy', '/cookies'], ['Security', '/security']].map(([label, href], i) => (
              <Link key={i} to={href} style={{ fontFamily: sans, fontSize: '13px', color: INK, textDecoration: 'underline', fontWeight: 500 }}>{label}</Link>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  </SiteLayout>
);

export default TermsOfServicePage;
