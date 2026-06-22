import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import { ShieldCheck, ChevronDown, ChevronUp, Mail } from 'lucide-react';

/*
  CasaCEO — Privacy Policy (/privacy)
  --------------------------------------------------------------------------
  Reframed from the HomeOS version. Fixed: palette (coral/slate -> warm),
  naming (HomeOS -> CasaCEO), wrong email domain (@homeos.com -> @casaceo.com),
  and — importantly — product-description DRIFT. The old policy described data
  the product doesn't handle (uploaded documents, connected utility accounts,
  insurance/valuation inputs) and made unverifiable security claims (AES-256
  at rest, security audits). This version describes what CasaCEO actually
  does: stores the parsed FIELDS of a bill, no bank access, no stored card,
  encrypted in transit.

  NOTE: this is a product-accuracy + branding pass, NOT legal counsel. The
  legal substance (rights, retention, jurisdiction) should be reviewed by a
  lawyer before launch.
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
    id: 'introduction',
    title: 'Introduction',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>CasaCEO ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use CasaCEO.</p>
        <ul style={ulStyle}>
          <li>We collect only what is necessary to provide the service.</li>
          <li>We never sell your personal data, and we don\u2019t show ads.</li>
          <li>We never connect to your bank or store your card.</li>
          <li>You can export or delete your data at any time.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'information-collected',
    title: 'Information We Collect',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <p style={{ fontFamily: sans, fontWeight: 700, color: INK, fontSize: '15px', marginBottom: '8px' }}>a. Account information</p>
          <ul style={ulStyle}>
            {['Name', 'Email address', 'Password (stored as a one-way hash \u2014 never in plain text)'].map((i, j) => <li key={j}>{i}</li>)}
          </ul>
        </div>
        <div>
          <p style={{ fontFamily: sans, fontWeight: 700, color: INK, fontSize: '15px', marginBottom: '8px' }}>b. Home and bill information</p>
          <ul style={ulStyle}>
            {['Property name and address', 'The parsed details of bills you add \u2014 provider, amount, due date, category', 'Maintenance tasks and the dates you log them'].map((i, j) => <li key={j}>{i}</li>)}
          </ul>
          <p style={{ fontSize: '13px', color: STONE, marginTop: '8px', lineHeight: 1.6 }}>
            When you forward a bill, we read and keep the structured fields above \u2014 not a long-term copy of the original email or PDF.
          </p>
        </div>
        <div>
          <p style={{ fontFamily: sans, fontWeight: 700, color: INK, fontSize: '15px', marginBottom: '8px' }}>c. Usage data</p>
          <ul style={ulStyle}>
            {['Basic device and browser information', 'Session activity (for security purposes)'].map((i, j) => <li key={j}>{i}</li>)}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    content: (
      <ul style={ulStyle}>
        {['Operate CasaCEO and keep your bills and tasks organized', 'Send maintenance reminders and due-date alerts', 'Respond to support requests', 'Keep the service secure and prevent abuse'].map((i, j) => <li key={j}>{i}</li>)}
      </ul>
    ),
  },
  {
    id: 'protection',
    title: 'How We Protect Your Information',
    content: (
      <ul style={ulStyle}>
        {['Connections are encrypted in transit over HTTPS/TLS', 'We never connect to your bank account', 'We never store your card or payment credentials', 'We keep the amount of data we hold deliberately small', 'Passwords are stored only as a one-way hash'].map((i, j) => <li key={j}>{i}</li>)}
      </ul>
    ),
  },
  {
    id: 'sharing',
    title: 'Data Sharing',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <p style={{ fontFamily: sans, fontWeight: 700, color: INK, fontSize: '15px', marginBottom: '8px' }}>We do NOT:</p>
          <ul style={ulStyle}>
            {['Sell your personal data', 'Share data with advertisers', 'Share data without your consent, except as required by law'].map((i, j) => <li key={j}>{i}</li>)}
          </ul>
        </div>
        <div>
          <p style={{ fontFamily: sans, fontWeight: 700, color: INK, fontSize: '15px', marginBottom: '8px' }}>We may share data with:</p>
          <ul style={ulStyle}>
            {['Infrastructure providers that host the service (under data processing agreements)', 'Legal authorities, only when required by law'].map((i, j) => <li key={j}>{i}</li>)}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'retention',
    title: 'Data Retention',
    content: (
      <ul style={ulStyle}>
        {['Your data is retained while your account is active.', 'You may request deletion of your account and data at any time.', 'On deletion, your data is removed from active systems.'].map((i, j) => <li key={j}>{i}</li>)}
      </ul>
    ),
  },
  {
    id: 'rights',
    title: 'Your Rights',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>Depending on where you live, you may have the following rights regarding your data:</p>
        {[
          ['Access', 'Request a copy of the data we hold about you.'],
          ['Correction', 'Request correction of inaccurate or incomplete data.'],
          ['Deletion', 'Request deletion of your account and data.'],
          ['Export', 'Download a portable copy of your records.'],
        ].map(([right, desc], j) => (
          <div key={j} style={{ padding: '12px 16px', borderRadius: '10px', background: PAPER, border: `1px solid ${LINE}` }}>
            <p style={{ fontFamily: sans, fontWeight: 700, color: INK, fontSize: '14px' }}>{right}</p>
            <p style={{ fontSize: '13px', color: STONE, marginTop: '2px' }}>{desc}</p>
          </div>
        ))}
        <p>To exercise any of these rights, contact us at <span style={{ color: INK, fontWeight: 600 }}>hello@casaceo.com</span>.</p>
      </div>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p>For privacy questions or requests, please contact us:</p>
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

const PrivacyPolicyPage = () => (
  <SiteLayout seo={{ title: 'Privacy Policy — CasaCEO' }} fullWidth>
    <section style={{ background: INK, padding: '80px 24px 62px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(62,107,168,0.22)', filter: 'blur(20px)', top: '-180px', right: '-100px' }} />
      </div>
      <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <ShieldCheck style={{ width: '26px', height: '26px', color: GOLD }} />
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 600, color: '#fff', marginBottom: '14px', letterSpacing: '-0.015em' }}>Your privacy, plainly.</h1>
        <p style={{ fontFamily: sans, fontSize: '16px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, maxWidth: '480px', margin: '0 auto 18px' }}>
          We hold a small amount of data, we never sell it, and you can take it or delete it whenever you like.
        </p>
        <p style={{ fontFamily: sans, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Last updated: June 2026</p>
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
            <ShieldCheck style={{ width: '18px', height: '18px', color: INK, flexShrink: 0 }} />
            <p style={{ fontFamily: sans, fontSize: '13px', color: INK, lineHeight: 1.6 }}>
              This policy applies to <Wordmark />. By using the service, you agree to the collection and use of information as described here. Questions? <span style={{ fontWeight: 700 }}>hello@casaceo.com</span>.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={150}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', marginTop: '32px' }}>
            {[['Terms of Service', '/terms'], ['Cookie Policy', '/cookies'], ['Security', '/security']].map(([label, href], i) => (
              <Link key={i} to={href} style={{ fontFamily: sans, fontSize: '13px', color: INK, textDecoration: 'underline', fontWeight: 500 }}>{label}</Link>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  </SiteLayout>
);

export default PrivacyPolicyPage;
