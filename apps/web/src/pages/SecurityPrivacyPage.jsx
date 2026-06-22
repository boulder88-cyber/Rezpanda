import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import {
  ArrowRight, ShieldCheck, Lock, CreditCard, FileText,
  CheckCircle2, ChevronDown, ChevronUp, Eye
} from 'lucide-react';

/*
  CasaCEO — Security & Privacy (/security)
  --------------------------------------------------------------------------
  Reframed from the old HomeOS page, which made specific claims that aren't
  verifiable for this product (AES-256 at rest, zero-knowledge storage, audit
  logs, 99.9% SLA, SOC 2). Those are removed — false security claims are a
  real liability.

  This version anchors on what is architecturally TRUE and is also the
  product's actual differentiator:
    • No bank access, no stored card, no money moved by the app
    • Stores the parsed FIELDS of a bill, not a long-term copy of the file
    • Encrypted in transit (TLS/HTTPS — true on the hosting in use)
    • No selling data, no ads; export or delete anytime

  Data-protection is described as PRINCIPLES, not compliance badges. If/when
  formal certifications or at-rest encryption are confirmed, add them here.
  Tokens mirror the rest of the marketing site.
*/

const INK = '#1C3553';
const SKY = '#3E6BA8';
const GOLD = '#c9a96e';
const PAPER = '#F6F3EC';
const SAND = '#EFE9DD';
const SAGE = '#6B8F71';
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
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};
const FadeIn = ({ children, delay = 0 }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
};

// The real security story — architecture first
const PILLARS = [
  {
    icon: CreditCard,
    title: 'No access to your money',
    points: [
      'No connection to your bank',
      'No card or payment details stored',
      'No money ever moved by the app',
      'You pay every bill yourself, your own way',
    ],
  },
  {
    icon: FileText,
    title: 'We keep less about you',
    points: [
      'Stores the parsed details of a bill — provider, amount, due date',
      'Not a long-term copy of the original email or PDF',
      'Less data held means less at risk',
      'Your records, structured and yours',
    ],
  },
  {
    icon: Lock,
    title: 'Protected in transit',
    points: [
      'Every connection is encrypted over HTTPS / TLS',
      'Your data isn\u2019t sent in the clear',
      'Standard, modern transport security',
    ],
  },
  {
    icon: Eye,
    title: 'Private by principle',
    points: [
      'We never sell or rent your data',
      'No advertising, ever',
      'Export or delete your data anytime',
      'Data minimization by design',
    ],
  },
];

const FAQS = [
  { q: 'Can CasaCEO access my bank account?', a: 'No. CasaCEO never connects to your bank, never stores a card, and never moves money. It tracks what\u2019s due and reminds you — you pay each bill yourself. This boundary is the foundation of how the product protects you: even a convincing fake bill can\u2019t auto-pay anyone, because the app simply has no ability to pay.' },
  { q: 'What do you actually store about my bills?', a: 'The structured details — provider, amount, due date, category — rather than a long-term copy of the original email or PDF. Keeping the fields instead of the file means there\u2019s less held about you, and less at risk.' },
  { q: 'Do you sell my information?', a: 'Never. CasaCEO does not sell, rent, or share your personal or home information for commercial purposes, and there is no advertising in the product.' },
  { q: 'Is my data encrypted?', a: 'Connections to CasaCEO are encrypted in transit over HTTPS/TLS, so your information isn\u2019t sent in the clear. We keep the amount of data we hold deliberately small.' },
  { q: 'Can I delete my data?', a: 'Yes. You can delete your account and records from your settings. If you\u2019d like a copy first, reach out and we\u2019ll help you export it.' },
];

const FAQItem = ({ faq }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${LINE}` }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '16px' }}>
        <p style={{ fontFamily: sans, fontSize: '16px', fontWeight: 600, color: INK, flex: 1 }}>{faq.q}</p>
        {open ? <ChevronUp style={{ width: '18px', height: '18px', color: STONE, flexShrink: 0 }} /> : <ChevronDown style={{ width: '18px', height: '18px', color: STONE, flexShrink: 0 }} />}
      </button>
      {open && <div style={{ padding: '0 24px 20px' }}><p style={{ fontFamily: sans, fontSize: '15px', color: STONE, lineHeight: 1.75 }}>{faq.a}</p></div>}
    </div>
  );
};

const SecurityPrivacyPage = () => (
  <SiteLayout seo={{ title: 'Security & privacy — CasaCEO' }} fullWidth>
    {/* Hero */}
    <section style={{ background: INK, padding: '84px 24px 70px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '560px', height: '560px', borderRadius: '50%', background: 'rgba(62,107,168,0.22)', filter: 'blur(20px)', top: '-200px', right: '-130px' }} />
      </div>
      <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShieldCheck style={{ width: '30px', height: '30px', color: GOLD }} />
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 4.5vw, 2.9rem)', fontWeight: 600, color: '#fff', lineHeight: 1.12, letterSpacing: '-0.015em', marginBottom: '16px' }}>
          The safest thing about <Wordmark /> is what it can\u2019t do.
        </h1>
        <p style={{ fontFamily: sans, fontSize: '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
          No bank access. No stored card. No money moved by the app. Your protection is built into how it works — not bolted on.
        </p>
      </div>
    </section>

    {/* Pillars */}
    <section style={{ padding: '76px 24px', background: PAPER }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '46px' }}>
            <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>How your data is protected</p>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 600, color: INK, letterSpacing: '-0.015em' }}>
              Protection by design, not by promise.
            </h2>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', alignItems: 'stretch' }}>
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <FadeIn key={i} delay={i * 70}>
                <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${LINE}`, padding: '26px', height: '100%' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Icon style={{ width: '23px', height: '23px', color: INK }} />
                  </div>
                  <p style={{ fontFamily: serif, fontSize: '18px', fontWeight: 600, color: INK, marginBottom: '14px', letterSpacing: '-0.01em' }}>{p.title}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                    {p.points.map((pt, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                        <CheckCircle2 style={{ width: '15px', height: '15px', color: SAGE, flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ fontFamily: sans, fontSize: '13px', color: STONE, lineHeight: 1.5 }}>{pt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>

    {/* Data ownership panel */}
    <section style={{ padding: '76px 24px', background: '#fff', borderTop: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
        <FadeIn>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '12px' }}>Your data is yours</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', fontWeight: 600, color: INK, lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.015em' }}>
            No lock-in. No surprises.
          </h2>
          <p style={{ fontFamily: sans, fontSize: '15px', color: STONE, lineHeight: 1.7 }}>
            CasaCEO holds a deliberately small amount of information, and what it holds is yours to take or remove whenever you like.
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <div style={{ background: INK, borderRadius: '18px', padding: '32px' }}>
            <Lock style={{ width: '30px', height: '30px', color: GOLD, marginBottom: '18px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Export your records anytime',
                'Delete your account completely',
                'No hidden long-term retention',
                'No data sold, no ads',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#9CC5A2', flexShrink: 0 }} />
                  <p style={{ fontFamily: sans, fontSize: '14px', color: 'rgba(255,255,255,0.82)' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>

    {/* FAQ */}
    <section style={{ padding: '70px 24px', background: PAPER, borderTop: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>Questions about your data</p>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', fontWeight: 600, color: INK, letterSpacing: '-0.015em' }}>Straight answers.</h2>
          </div>
        </FadeIn>
        <FadeIn delay={80}>
          <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${LINE}`, overflow: 'hidden' }}>
            {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} />)}
          </div>
        </FadeIn>
      </div>
    </section>

    {/* CTA */}
    <section style={{ background: INK, padding: '82px 24px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 600, color: '#fff', letterSpacing: '-0.015em', marginBottom: '16px', lineHeight: 1.15 }}>
            Questions about privacy? Ask us.
          </h2>
          <p style={{ fontFamily: sans, fontSize: '16px', color: 'rgba(255,255,255,0.72)', marginBottom: '32px', lineHeight: 1.6 }}>
            We\u2019re happy to explain exactly what we hold and how it\u2019s handled.
          </p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '14px 30px', borderRadius: '11px', background: '#fff', color: INK, fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>
            Contact us <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
        </FadeIn>
      </div>
    </section>
  </SiteLayout>
);

export default SecurityPrivacyPage;
