import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Lock, Shield, Server, Eye, CheckCircle2,
  ChevronDown, ChevronUp, FileText, Users, Globe, Bell
} from 'lucide-react';

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
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
      transform: visible ? 'translateY(0)' : 'translateY(22px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

const SectionLabel = ({ text, light = false }) => (
  <p style={{ fontSize: '12px', fontWeight: 600, color: light ? 'rgba(232,96,76,0.9)' : '#e8604c', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px' }}>
    {text}
  </p>
);

const Divider = () => (
  <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px' }}>
    <div style={{ height: '1px', background: '#e2e8f0' }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════

const PILLARS = [
  {
    icon: Lock,
    title: 'Encryption',
    color: '#1e3a5f', bg: '#eef2f8',
    points: [
      'AES-256 encryption at rest',
      'TLS 1.3 in transit',
      'Encrypted document vault',
      'Zero-knowledge document storage',
    ],
  },
  {
    icon: Users,
    title: 'Access Control',
    color: '#059669', bg: '#ecfdf5',
    points: [
      'Role-based permissions',
      'No third-party data sharing',
      'You control who sees what',
      'Audit logs on sensitive actions',
    ],
  },
  {
    icon: Server,
    title: 'Infrastructure',
    color: '#7c3aed', bg: '#f5f3ff',
    points: [
      'Secure cloud hosting',
      'Redundant backups',
      'Continuous monitoring',
      '99.9% uptime SLA (enterprise)',
    ],
  },
  {
    icon: Eye,
    title: 'Privacy',
    color: '#e8604c', bg: '#fdf0ee',
    points: [
      'No selling of your data',
      'No advertising',
      'Transparent policies',
      'You can delete everything',
    ],
  },
];

const COMPLIANCE = [
  { label: 'SOC 2', status: 'In Progress', color: '#d97706', bg: '#fffbeb' },
  { label: 'GDPR-Aligned', status: 'Active', color: '#059669', bg: '#ecfdf5' },
  { label: 'CCPA-Aligned', status: 'Active', color: '#059669', bg: '#ecfdf5' },
  { label: 'SSL/TLS', status: 'Active', color: '#059669', bg: '#ecfdf5' },
];

const FAQS = [
  {
    q: 'Who can access my data?',
    a: 'Only you — and anyone you explicitly authorize. HomeOS uses role-based permissions so you control exactly who can view or edit your home data. We never access your data except to provide the service.',
  },
  {
    q: 'Do you sell my information?',
    a: 'Never. HomeOS does not sell, rent, or share your personal data or home information with third parties for commercial purposes. Your data is yours — full stop.',
  },
  {
    q: 'How is my home history stored?',
    a: 'Your home history is stored in an encrypted database with AES-256 encryption at rest. Documents are stored in an encrypted vault. All data is backed up redundantly and can be exported or deleted at any time.',
  },
  {
    q: 'Can I delete my data?',
    a: 'Yes — you can export or permanently delete your home data at any time from your account settings. When you delete, your data is fully removed from our systems within 30 days.',
  },
  {
    q: 'Is HomeOS compliant with GDPR and CCPA?',
    a: 'HomeOS aligns with GDPR and CCPA principles including data minimization, transparency, right to access, and right to deletion. SOC 2 certification is currently in progress.',
  },
];

// ═══════════════════════════════════════════════════════════════════════
// FAQ ACCORDION
// ═══════════════════════════════════════════════════════════════════════

const FAQItem = ({ faq }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between text-left" style={{ padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <p className="font-semibold text-slate-900" style={{ fontSize: '16px', paddingRight: '16px' }}>{faq.q}</p>
        {open
          ? <ChevronUp style={{ width: '18px', height: '18px', color: '#94a3b8', flexShrink: 0 }} />
          : <ChevronDown style={{ width: '18px', height: '18px', color: '#94a3b8', flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div style={{ padding: '0 24px 20px' }}>
          <p className="text-slate-500" style={{ fontSize: '15px', lineHeight: '1.8' }}>{faq.a}</p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const SecurityPrivacyPage = () => (
  <>
    <Helmet><title>Security & Privacy — HomeOS</title></Helmet>
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: '#1e3a5f', padding: '100px 32px 80px' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-5" style={{ width: '600px', height: '600px', background: '#e8604c', top: '-150px', right: '-100px' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, background: 'rgba(232,96,76,0.15)', color: '#e8604c', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(232,96,76,0.3)' }}>
              Security & Privacy
            </span>
          </div>
          <div className="flex items-center justify-center" style={{ marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
          </div>
          <h1 className="font-semibold text-white" style={{ fontSize: '52px', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-0.02em' }}>
            Your home's data stays<br />your data.
          </h1>
          <p className="text-blue-200" style={{ fontSize: '18px', lineHeight: '1.75', maxWidth: '540px', margin: '0 auto' }}>
            HomeOS uses enterprise-grade encryption, strict access controls, and transparent privacy practices to keep your information safe.
          </p>
        </div>
      </section>

      {/* ── SECURITY PILLARS ── */}
      <section style={{ padding: '80px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '48px' }}>
              <SectionLabel text="Security Architecture" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '36px', lineHeight: '1.15' }}>
                Enterprise-grade protection<br />at every layer.
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <FadeIn key={i} delay={i * 80}>
                  <div className="bg-white" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', height: '100%' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <Icon style={{ width: '24px', height: '24px', color: p.color }} />
                    </div>
                    <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '16px' }}>{p.title}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {p.points.map((pt, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <CheckCircle2 style={{ width: '14px', height: '14px', color: p.color, flexShrink: 0, marginTop: '2px' }} />
                          <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{pt}</p>
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

      <Divider />

      {/* ── COMPLIANCE ── */}
      <section style={{ padding: '80px 32px', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <SectionLabel text="Compliance" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '36px', lineHeight: '1.15', marginBottom: '20px' }}>
                Built to meet the highest<br />industry standards.
              </h2>
              <p className="text-slate-500" style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '32px' }}>
                HomeOS aligns with global data protection regulations and is actively working toward SOC 2 certification. Your data is protected by law and by design.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {COMPLIANCE.map((c, i) => (
                  <div key={i} style={{ padding: '14px 18px', borderRadius: '12px', background: c.bg, border: `1px solid ${c.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p className="font-semibold" style={{ fontSize: '14px', color: '#1e293b' }}>{c.label}</p>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: c.color, background: 'white', padding: '2px 8px', borderRadius: '999px' }}>{c.status}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={120}>
              <div style={{ background: '#1e3a5f', borderRadius: '20px', padding: '36px', color: 'white' }}>
                <Lock style={{ width: '32px', height: '32px', color: '#93c5fd', marginBottom: '20px' }} />
                <p className="font-semibold" style={{ fontSize: '20px', marginBottom: '16px', lineHeight: '1.3' }}>
                  Your home's data is yours.<br />Forever.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    'Export everything at any time',
                    'Delete your account completely',
                    'No lock-in, no hidden retention',
                    'Full data portability',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 style={{ width: '16px', height: '16px', color: '#86efac', flexShrink: 0 }} />
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── FAQ ── */}
      <section style={{ padding: '80px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '48px' }}>
              <SectionLabel text="FAQ" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '36px', lineHeight: '1.15' }}>Common questions about your data.</h2>
            </div>
          </FadeIn>
          <FadeIn delay={80}>
            <div className="bg-white" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} />)}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 32px', background: '#1e3a5f', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full opacity-5" style={{ width: '400px', height: '400px', background: '#e8604c', top: '-80px', right: '-80px' }} />
        </div>
        <div className="relative z-10" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <h2 className="font-semibold text-white" style={{ fontSize: '38px', lineHeight: '1.15', marginBottom: '16px' }}>Your data is safe with us.</h2>
            <p className="text-blue-200" style={{ fontSize: '16px', lineHeight: '1.7', marginBottom: '36px' }}>
              Read our full privacy policy or contact our security team with any questions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '14px 28px', fontSize: '15px' }}>
                View Our Privacy Policy <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
              <Link to="/contact" className="flex items-center gap-2 font-semibold rounded-2xl border hover:bg-white/10 transition-all" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '14px 28px', fontSize: '15px' }}>
                Contact Security Team
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  </>
);

export default SecurityPrivacyPage;
