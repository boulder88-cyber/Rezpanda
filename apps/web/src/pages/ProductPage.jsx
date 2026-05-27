import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import {
  Home, FileText, Wrench, Activity, TrendingUp, Shield,
  Zap, ArrowRight, CheckCircle2
} from 'lucide-react';

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};
const FadeIn = ({ children, delay = 0 }) => {
  const [ref, visible] = useFadeIn();
  return <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>{children}</div>;
};

const MODULES = [
  {
    id: 'home-profile',
    icon: Home,
    color: '#1e3a5f', bg: '#eef2f8',
    title: 'Home Profile',
    desc: 'Your property\'s command center. See current valuation, equity position, insurance summary, maintenance overview, and every document — all from one place.',
    points: ['Real-time valuation + equity tracking', 'Complete property details and history', 'Insurance + utilities summary', 'Quick actions to every module'],
  },
  {
    id: 'documents',
    icon: FileText,
    color: '#7c3aed', bg: '#f5f3ff',
    title: 'Document Vault',
    desc: 'Bank-grade encrypted storage for every document your home will ever need. AI auto-classifies uploads, extracts key dates, and alerts you before things expire.',
    points: ['AES-256 encrypted storage', 'AI classification and extraction', 'Expiration detection and alerts', 'Organized by type, tag, and date'],
  },
  {
    id: 'maintenance',
    icon: Wrench,
    color: '#f97316', bg: '#fff7ed',
    title: 'Maintenance Scheduler',
    desc: 'HomeOS predicts what your home needs before it becomes a problem. Seasonal reminders, vendor coordination, and cost forecasting — all automated.',
    points: ['Predictive maintenance scheduling', 'Seasonal + system-based reminders', 'Vendor marketplace integration', '12-month cost forecasting'],
  },
  {
    id: 'timeline',
    icon: Activity,
    color: '#059669', bg: '#ecfdf5',
    title: 'Home Timeline',
    desc: 'A permanent, chronological record of everything that has ever happened to your home. Improvements, repairs, documents, events — captured forever.',
    points: ['Complete property history', 'Auto-populated from documents', 'Manual event logging', 'Exportable for sale or estate planning'],
  },
  {
    id: 'valuation',
    icon: TrendingUp,
    color: '#1A73E8', bg: '#EFF6FF',
    title: 'Valuation & Equity',
    desc: 'Daily automated valuations, 12-month trend charts, equity meter, market comps, and sell-vs-hold analysis. Know exactly what your home is worth.',
    points: ['Daily automated valuation (AVM)', 'Equity meter and LTV tracking', 'Recent comparable sales', 'Sell vs. hold analysis'],
  },
  {
    id: 'insurance',
    icon: Shield,
    color: '#e8604c', bg: '#fdf0ee',
    title: 'Insurance & Utilities',
    desc: 'Track every insurance policy in one place, detect coverage gaps with AI, and monitor utility spend against neighborhood benchmarks.',
    points: ['Multi-policy tracking', 'AI coverage gap detection', 'Utility spend benchmarking', 'Renewal alerts and reminders'],
  },
  {
    id: 'copilot',
    icon: Zap,
    color: '#d97706', bg: '#fffbeb',
    title: 'HomeOS Copilot',
    desc: 'Ask anything about your home in plain English. Copilot answers questions about your documents, insurance, maintenance, and valuation — instantly.',
    points: ['Natural language home Q&A', 'Document summarization', 'Insurance gap analysis', 'Maintenance predictions'],
    badge: 'Coming Soon',
  },
];

const ModuleBlock = ({ mod, index }) => {
  const Icon = mod.icon;
  const isEven = index % 2 === 0;

  return (
    <div id={mod.id} style={{ padding: '72px 24px', background: index % 2 === 0 ? 'white' : '#f8fafc' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
        {/* Text — alternates left/right */}
        <FadeIn delay={isEven ? 0 : 100}>
          <div style={{ order: isEven ? 0 : 1 }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: mod.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Icon style={{ width: '24px', height: '24px', color: mod.color }} />
            </div>
            {mod.badge && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: mod.color, background: mod.bg, padding: '3px 10px', borderRadius: '999px', display: 'inline-block', marginBottom: '12px' }}>{mod.badge}</span>
            )}
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '14px' }}>{mod.title}</h2>
            <p style={{ fontSize: '16px', color: '#64748b', lineHeight: 1.75, marginBottom: '24px' }}>{mod.desc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mod.points.map((pt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: mod.color, flexShrink: 0 }} />
                  <p style={{ fontSize: '14px', color: '#334155' }}>{pt}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Screenshot placeholder */}
        <FadeIn delay={isEven ? 100 : 0}>
          <div style={{ order: isEven ? 1 : 0, borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', background: mod.bg, minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Icon style={{ width: '28px', height: '28px', color: mod.color }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: mod.color }}>{mod.title}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Screenshot coming soon</p>
          </div>
        </FadeIn>
      </div>

      {/* Mobile: stack vertically */}
      <style>{`
        @media (max-width: 768px) {
          #${mod.id} > div { grid-template-columns: 1fr !important; }
          #${mod.id} > div > div { order: unset !important; }
        }
      `}</style>
    </div>
  );
};

const ProductPage = () => (
  <SiteLayout seo={{ title: 'The HomeOS Platform — Everything Your Home Needs' }} fullWidth>
    {/* Page header */}
    <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '80px 24px 72px', textAlign: 'center' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#93c5fd', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px' }}>The Platform</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '16px' }}>
          The HomeOS Platform
        </h1>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
          Everything your home needs, in one place.
        </p>
      </div>
    </section>

    {/* Module blocks */}
    {MODULES.map((mod, i) => <ModuleBlock key={mod.id} mod={mod} index={i} />)}

    {/* CTA */}
    <section style={{ padding: '96px 24px', background: '#1A73E8', textAlign: 'center' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '16px' }}>Ready to get started?</h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.75)', marginBottom: '36px' }}>Free to start. No credit card required.</p>
        <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '15px 36px', borderRadius: '10px', background: 'white', color: '#1A73E8', fontSize: '16px', fontWeight: 700, textDecoration: 'none' }}>
          Get Started <ArrowRight style={{ width: '16px', height: '16px' }} />
        </Link>
      </div>
    </section>
  </SiteLayout>
);

export default ProductPage;
