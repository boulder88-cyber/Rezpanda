import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Shield, ChevronDown, ChevronUp, ArrowRight, Mail } from 'lucide-react';

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

const SECTIONS = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>HomeOS ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the HomeOS platform.</p>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'disc' }}>
          <li>HomeOS collects only what is necessary to provide the service.</li>
          <li>We never sell your personal data to third parties.</li>
          <li>You control your information at all times.</li>
          <li>All data is encrypted at rest and in transit.</li>
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
          <p className="font-semibold text-slate-800" style={{ fontSize: '15px', marginBottom: '8px' }}>a. Account Information</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'disc' }}>
            {['Name', 'Email address', 'Password (stored as a one-way hash — never in plain text)'].map((i, j) => <li key={j}>{i}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-800" style={{ fontSize: '15px', marginBottom: '8px' }}>b. Home Data</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'disc' }}>
            {['Property address and details', 'Documents you upload', 'Maintenance history', 'Utility accounts', 'Insurance policy information', 'Valuation inputs'].map((i, j) => <li key={j}>{i}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-800" style={{ fontSize: '15px', marginBottom: '8px' }}>c. Usage Data</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'disc' }}>
            {['Feature interactions and preferences', 'Device type and browser information', 'Session activity (for security and improvement purposes)'].map((i, j) => <li key={j}>{i}</li>)}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    content: (
      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'disc' }}>
        {['Provide and operate the HomeOS platform', 'Improve platform performance and features', 'Deliver maintenance reminders and proactive alerts', 'Generate homeowner insights and recommendations', 'Respond to customer service requests', 'Ensure platform security and prevent fraud'].map((i, j) => <li key={j}>{i}</li>)}
      </ul>
    ),
  },
  {
    id: 'protection',
    title: 'How We Protect Your Information',
    content: (
      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'disc' }}>
        {['AES-256 encryption for all data at rest', 'TLS 1.3 encryption for all data in transit', 'Strict role-based access controls', 'Regular security audits and monitoring', 'Encrypted document vault for uploaded files'].map((i, j) => <li key={j}>{i}</li>)}
      </ul>
    ),
  },
  {
    id: 'sharing',
    title: 'Data Sharing',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <p className="font-semibold text-slate-800" style={{ fontSize: '15px', marginBottom: '8px' }}>We do NOT:</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'disc' }}>
            {['Sell your personal data', 'Share data with advertisers', 'Share data without your explicit consent'].map((i, j) => <li key={j}>{i}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-800" style={{ fontSize: '15px', marginBottom: '8px' }}>We may share data with:</p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'disc' }}>
            {['Trusted infrastructure and analytics providers (subject to strict data processing agreements)', 'Legal authorities, only when required by law and with proper legal process'].map((i, j) => <li key={j}>{i}</li>)}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'retention',
    title: 'Data Retention',
    content: (
      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'disc' }}>
        {['Your data is retained for as long as your account is active.', 'You may request full deletion of your account and data at any time.', 'Upon deletion, your data is permanently removed from active systems within 30 days.', 'Encrypted backups may be retained for up to 90 days for disaster recovery purposes.'].map((i, j) => <li key={j}>{i}</li>)}
      </ul>
    ),
  },
  {
    id: 'rights',
    title: 'Your Rights',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
        {[
          ['Access', 'Request a copy of the data we hold about you.'],
          ['Correction', 'Request correction of inaccurate or incomplete data.'],
          ['Deletion', 'Request permanent deletion of your account and data.'],
          ['Export', 'Download a portable copy of your home data.'],
          ['Restrict Processing', 'Request that we limit how we use your data.'],
        ].map(([right, desc], j) => (
          <div key={j} style={{ padding: '12px 16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p className="font-semibold text-slate-800" style={{ fontSize: '14px' }}>{right}</p>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{desc}</p>
          </div>
        ))}
        <p>To exercise any of these rights, contact us at <span style={{ color: '#1e3a5f', fontWeight: 600 }}>privacy@homeos.com</span>.</p>
      </div>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p>For privacy-related questions, requests, or concerns, please contact our Privacy Team:</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', background: '#eef2f8', width: 'fit-content' }}>
          <Mail style={{ width: '16px', height: '16px', color: '#1e3a5f' }} />
          <span style={{ fontWeight: 600, color: '#1e3a5f', fontSize: '14px' }}>privacy@homeos.com</span>
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8' }}>We respond to privacy requests within 5 business days.</p>
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
          {section.content}
        </div>
      )}
    </div>
  );
};

const PrivacyPolicyPage = () => (
  <>
    <Helmet><title>Privacy Policy — HomeOS</title></Helmet>
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: '#1e3a5f', padding: '80px 32px 64px' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-5" style={{ width: '500px', height: '500px', background: '#e8604c', top: '-120px', right: '-80px' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center" style={{ marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
          </div>
          <h1 className="font-semibold text-white" style={{ fontSize: '44px', lineHeight: '1.15', marginBottom: '16px' }}>Your privacy is our priority.</h1>
          <p className="text-blue-200" style={{ fontSize: '17px', lineHeight: '1.75', maxWidth: '480px', margin: '0 auto 20px' }}>
            We protect your home's data with strict security, transparent policies, and full user control.
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Last updated: May 2026</p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '64px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <FadeIn>
            <div className="bg-white" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              {SECTIONS.map((section, i) => (
                <AccordionSection key={section.id} section={section} index={i} />
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div style={{ marginTop: '32px', padding: '20px 24px', borderRadius: '12px', background: '#eef2f8', border: '1px solid #c7d7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield style={{ width: '18px', height: '18px', color: '#1e3a5f', flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: '#1e3a5f', lineHeight: '1.6' }}>
                This policy applies to all HomeOS services. By using HomeOS, you agree to the collection and use of information as described here. For questions, contact <span style={{ fontWeight: 700 }}>privacy@homeos.com</span>.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <div className="flex flex-wrap gap-3 justify-center" style={{ marginTop: '32px' }}>
              {[['Terms of Service', '/terms'], ['Cookie Policy', '/cookies'], ['Security', '/security']].map(([label, href], i) => (
                <Link key={i} to={href} className="font-medium hover:opacity-70 transition-opacity" style={{ fontSize: '13px', color: '#1e3a5f', textDecoration: 'underline' }}>{label}</Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  </>
);

export default PrivacyPolicyPage;
