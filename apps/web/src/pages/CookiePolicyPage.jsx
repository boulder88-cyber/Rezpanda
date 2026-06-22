import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import { Cookie, ChevronDown, ChevronUp, Mail, CheckCircle2 } from 'lucide-react';

/*
  CasaCEO — Cookie Policy (/cookies)
  --------------------------------------------------------------------------
  Branding + drift pass. Fixed palette (coral/blue/purple cookie colors ->
  warm), naming (HomeOS -> CasaCEO), wrong email (@homeos.com ->
  @casaceo.com). Softened the old page's confident third-party analytics
  claims to "if/when used" language, since the product may not run analytics
  cookies yet. Legal substance left for lawyer review.
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

const COOKIE_TYPES = [
  {
    label: 'Essential cookies',
    required: true,
    desc: 'Necessary for CasaCEO to function. These cannot be turned off.',
    uses: ['Sign-in and session management', 'Security and abuse prevention', 'Core functionality'],
  },
  {
    label: 'Preference cookies',
    required: false,
    desc: 'Remember your settings so the app behaves the way you left it.',
    uses: ['Interface and layout preferences', 'Regional settings'],
  },
  {
    label: 'Performance cookies',
    required: false,
    desc: 'If used, these help us understand how the app is performing so we can improve it. Aggregate and anonymized only.',
    uses: ['Basic usage statistics', 'Error and performance diagnostics'],
  },
];

const SECTIONS = [
  {
    title: 'What are cookies?',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>Cookies are small text files placed on your device when you use a web app. They help the app work, remember your preferences, and stay secure.</p>
        <p>CasaCEO uses cookies and similar technologies (such as session tokens) to operate the service and keep you signed in safely.</p>
      </div>
    ),
  },
  {
    title: 'Third-party cookies',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>CasaCEO relies on a small number of infrastructure providers to host and deliver the service. If any set cookies on our behalf, they do so under data processing agreements.</p>
        <p>CasaCEO does not use cookies for advertising or behavioral targeting, and there are no ads in the product.</p>
      </div>
    ),
  },
  {
    title: 'Managing your cookies',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>You can control cookies in a few ways:</p>
        <ul style={ulStyle}>
          <li><strong>Browser settings:</strong> Most browsers let you refuse or delete cookies \u2014 see your browser\u2019s help docs.</li>
          <li><strong>Essential cookies:</strong> These can\u2019t be disabled, since the app needs them to work.</li>
        </ul>
        <p>Turning off non-essential cookies won\u2019t stop you using CasaCEO, but some preferences may not be remembered.</p>
      </div>
    ),
  },
  {
    title: 'Contact',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p>Questions about cookies? Contact us:</p>
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

const CookiePolicyPage = () => (
  <SiteLayout seo={{ title: 'Cookie Policy — CasaCEO' }} fullWidth>
    <section style={{ background: INK, padding: '80px 24px 62px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(62,107,168,0.22)', filter: 'blur(20px)', top: '-180px', right: '-100px' }} />
      </div>
      <div style={{ maxWidth: '620px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <Cookie style={{ width: '26px', height: '26px', color: GOLD }} />
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 600, color: '#fff', marginBottom: '14px', letterSpacing: '-0.015em' }}>Cookie Policy</h1>
        <p style={{ fontFamily: sans, fontSize: '16px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, maxWidth: '460px', margin: '0 auto 18px' }}>
          How CasaCEO uses cookies to keep the app working and signed in.
        </p>
        <p style={{ fontFamily: sans, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Last updated: June 2026</p>
      </div>
    </section>

    <section style={{ padding: '60px 24px', background: PAPER }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <FadeIn>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>Types of cookies we use</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {COOKIE_TYPES.map((ct, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${LINE}`, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontFamily: sans, fontWeight: 700, color: INK, fontSize: '15px' }}>{ct.label}</p>
                    {ct.required
                      ? <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 700, color: SAGE, background: '#EEF2EC', padding: '1px 8px', borderRadius: '999px' }}>Required</span>
                      : <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 600, color: STONE, background: SAND, padding: '1px 8px', borderRadius: '999px' }}>Optional</span>
                    }
                  </div>
                </div>
                <p style={{ fontFamily: sans, fontSize: '13px', color: STONE, marginBottom: '10px', lineHeight: 1.6 }}>{ct.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {ct.uses.map((use, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 style={{ width: '13px', height: '13px', color: SAGE, flexShrink: 0 }} />
                      <p style={{ fontFamily: sans, fontSize: '13px', color: STONE }}>{use}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={80}>
          <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${LINE}`, overflow: 'hidden' }}>
            {SECTIONS.map((section, i) => (
              <AccordionSection key={i} section={section} index={i} />
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={130}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', marginTop: '32px' }}>
            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Security', '/security']].map(([label, href], i) => (
              <Link key={i} to={href} style={{ fontFamily: sans, fontSize: '13px', color: INK, textDecoration: 'underline', fontWeight: 500 }}>{label}</Link>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  </SiteLayout>
);

export default CookiePolicyPage;
