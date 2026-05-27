import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Cookie, ChevronDown, ChevronUp, Mail, CheckCircle2 } from 'lucide-react';

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.06 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
};

const FadeIn = ({ children, delay = 0 }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

const COOKIE_TYPES = [
  {
    label: 'Essential Cookies',
    required: true,
    color: '#059669', bg: '#ecfdf5', border: '#a7f3d0',
    desc: 'These cookies are necessary for HomeOS to function. They cannot be disabled.',
    uses: ['User authentication and session management', 'Security and fraud prevention', 'Core platform functionality'],
  },
  {
    label: 'Performance Cookies',
    required: false,
    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
    desc: 'Help us understand how users interact with the platform so we can improve it.',
    uses: ['Analytics and usage statistics', 'Page load performance measurement', 'Error tracking and diagnostics'],
  },
  {
    label: 'Preference Cookies',
    required: false,
    color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd',
    desc: 'Remember your settings and preferences to personalize your experience.',
    uses: ['UI settings and layout preferences', 'Language and regional settings', 'Dashboard customization state'],
  },
];

const SECTIONS = [
  {
    title: 'What Are Cookies?',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>Cookies are small text files that are placed on your device when you visit a website or use a web application. They are widely used to make websites work efficiently, remember your preferences, and provide information to site owners.</p>
        <p>HomeOS uses cookies and similar tracking technologies (such as local storage and session tokens) to operate the platform, improve your experience, and ensure security.</p>
      </div>
    ),
  },
  {
    title: 'Third-Party Cookies',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>HomeOS works with a small number of trusted third-party service providers who may set cookies on our behalf. These providers are subject to strict data processing agreements.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Infrastructure Providers', desc: 'Hosting and content delivery networks that ensure platform availability.' },
            { label: 'Analytics Partners', desc: 'Aggregate, anonymized usage analytics to improve platform performance.' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '12px 16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', marginBottom: '3px' }}>{item.label}</p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <p>HomeOS does not use cookies for advertising or behavioral targeting purposes.</p>
      </div>
    ),
  },
  {
    title: 'Managing Your Cookies',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>You can control and manage cookies in several ways:</p>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'disc' }}>
          <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies. Refer to your browser's help documentation for instructions.</li>
          <li><strong>Opt-Out Tools:</strong> You may opt out of analytics cookies at any time through your HomeOS account settings.</li>
          <li><strong>Essential Cookies:</strong> These cannot be disabled as they are required for the platform to function.</li>
        </ul>
        <p>Disabling non-essential cookies will not prevent you from using HomeOS, but may affect certain features and preferences.</p>
      </div>
    ),
  },
  {
    title: 'Contact',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p>For questions about our use of cookies and tracking technologies, please contact:</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', background: '#eef2f8', width: 'fit-content' }}>
          <Mail style={{ width: '16px', height: '16px', color: '#1e3a5f' }} />
          <span style={{ fontWeight: 600, color: '#1e3a5f', fontSize: '14px' }}>cookies@homeos.com</span>
        </div>
      </div>
    ),
  },
];

const AccordionSection = ({ section, index }) => {
  const [open, setOpen] = useState(index === 0);
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between text-left" style={{ padding: '20px 28px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#e8604c', background: '#fdf0ee', padding: '2px 8px', borderRadius: '999px', flexShrink: 0 }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <p className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>{section.title}</p>
        </div>
        {open
          ? <ChevronUp style={{ width: '18px', height: '18px', color: '#94a3b8', flexShrink: 0 }} />
          : <ChevronDown style={{ width: '18px', height: '18px', color: '#94a3b8', flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div style={{ padding: '0 28px 24px', color: '#475569', fontSize: '14px', lineHeight: '1.8' }}>
          {typeof section.content === 'string' ? <p>{section.content}</p> : section.content}
        </div>
      )}
    </div>
  );
};

const CookiePolicyPage = () => (
  <>
    <Helmet><title>Cookie Policy — HomeOS</title></Helmet>
    <div className="min-h-screen bg-white overflow-x-hidden">

      <section className="relative overflow-hidden" style={{ background: '#1e3a5f', padding: '80px 32px 64px' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-5" style={{ width: '500px', height: '500px', background: '#e8604c', top: '-120px', right: '-80px' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center" style={{ marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cookie style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
          </div>
          <h1 className="font-semibold text-white" style={{ fontSize: '44px', lineHeight: '1.15', marginBottom: '16px' }}>Cookie Policy</h1>
          <p className="text-blue-200" style={{ fontSize: '17px', lineHeight: '1.75', maxWidth: '460px', margin: '0 auto 20px' }}>
            Learn how HomeOS uses cookies to improve your experience.
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Last updated: May 2026</p>
        </div>
      </section>

      <section style={{ padding: '64px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Cookie type cards */}
          <FadeIn>
            <p className="font-semibold text-slate-500 uppercase tracking-widest" style={{ fontSize: '12px', marginBottom: '16px', letterSpacing: '0.12em' }}>Types of Cookies We Use</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {COOKIE_TYPES.map((ct, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '14px', border: `1px solid ${ct.border}`, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{ct.label}</p>
                      {ct.required && (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: ct.color, background: ct.bg, padding: '1px 7px', borderRadius: '999px' }}>Required</span>
                      )}
                    </div>
                    {!ct.required && (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', background: '#f8fafc', padding: '1px 7px', borderRadius: '999px', border: '1px solid #e2e8f0' }}>Optional</span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px', lineHeight: '1.6' }}>{ct.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {ct.uses.map((use, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <CheckCircle2 style={{ width: '13px', height: '13px', color: ct.color, flexShrink: 0 }} />
                        <p style={{ fontSize: '13px', color: '#475569' }}>{use}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Additional accordion sections */}
          <FadeIn delay={80}>
            <div className="bg-white" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              {SECTIONS.map((section, i) => (
                <AccordionSection key={i} section={section} index={i} />
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={130}>
            <div className="flex flex-wrap gap-3 justify-center" style={{ marginTop: '32px' }}>
              {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Security', '/security']].map(([label, href], i) => (
                <Link key={i} to={href} className="font-medium hover:opacity-70 transition-opacity" style={{ fontSize: '13px', color: '#1e3a5f', textDecoration: 'underline' }}>{label}</Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  </>
);

export default CookiePolicyPage;
