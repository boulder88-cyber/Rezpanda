import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Building2, TrendingUp, Database, Star,
  Shield, Users, BarChart2, DollarSign, CheckCircle2,
  Layers, Globe, RefreshCw, Lock, Calendar, Home
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION HOOK
// ═══════════════════════════════════════════════════════════════════════

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
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
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════════════════════════════════

const SectionLabel = ({ text, light = false }) => (
  <p style={{ fontSize: '12px', fontWeight: 600, color: light ? 'rgba(232,96,76,0.9)' : '#e8604c', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px' }}>
    {text}
  </p>
);

const Divider = () => (
  <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 32px' }}>
    <div style={{ height: '1px', background: '#e2e8f0' }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════

const VALUE_DRIVERS = [
  {
    number: '01', icon: Globe, color: '#1e3a5f', bg: '#eef2f8',
    title: 'Brand Permanence',
    desc: 'Your brand lives inside the homeowner\'s daily command center — not just in a closing folder. Every time a client opens HomeOS, they see your brokerage.',
  },
  {
    number: '02', icon: RefreshCw, color: '#059669', bg: '#ecfdf5',
    title: 'Client Retention',
    desc: 'HomeOS keeps clients connected to your ecosystem for years after the transaction. No more losing clients to competitors at the next purchase or refinance.',
  },
  {
    number: '03', icon: Database, color: '#7c3aed', bg: '#f5f3ff',
    title: 'Data Moat',
    desc: 'HomeOS builds a proprietary dataset of home events, valuations, maintenance history, and ownership behavior — an intelligence layer no competitor can replicate.',
  },
  {
    number: '04', icon: Star, color: '#d97706', bg: '#fffbeb',
    title: 'Differentiation',
    desc: 'Brokerages offering HomeOS stand apart in agent recruiting, retention, and listing presentations. It\'s the most compelling value proposition in the industry.',
  },
  {
    number: '05', icon: DollarSign, color: '#e8604c', bg: '#fdf0ee',
    title: 'Lifetime Value Expansion',
    desc: 'HomeOS opens the door to mortgage, insurance, and service integrations — creating new revenue streams tied directly to the client relationship.',
  },
];

const DASHBOARD_METRICS = [
  { label: 'Active Client Homes', value: '1,284', trend: '+12%', color: '#1e3a5f', bg: '#eef2f8' },
  { label: 'Engagement Rate', value: '74%', trend: '+8%', color: '#059669', bg: '#ecfdf5' },
  { label: 'Renewals This Quarter', value: '48', trend: '+22%', color: '#d97706', bg: '#fffbeb' },
  { label: 'Portfolio Value Tracked', value: '$2.1B', trend: '+5%', color: '#7c3aed', bg: '#f5f3ff' },
];

const ENTERPRISE_FEATURES = [
  { icon: Users, label: 'Agent Integration', desc: 'Connect every agent to their client\'s HomeOS instance.' },
  { icon: BarChart2, label: 'Brokerage Dashboards', desc: 'Portfolio-wide insights across all client homes.' },
  { icon: TrendingUp, label: 'Client Engagement Metrics', desc: 'Track activity, retention, and lifecycle milestones.' },
  { icon: Layers, label: 'White-Label Customization', desc: 'Your brand, your colors, your client experience.' },
  { icon: Shield, label: 'Enterprise Security', desc: 'Bank-grade encryption and compliance-ready infrastructure.' },
  { icon: Globe, label: 'Multi-Market Deployment', desc: 'Scale HomeOS across regions and offices seamlessly.' },
];

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const BrokerageValuePage = () => (
  <>
    <Helmet><title>Why Brokerages Choose HomeOS — CasaCEO</title></Helmet>
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden" style={{ background: '#1e3a5f', padding: '120px 32px 96px' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-5" style={{ width: '700px', height: '700px', background: '#e8604c', top: '-200px', right: '-150px' }} />
          <div className="absolute rounded-full opacity-5" style={{ width: '400px', height: '400px', background: '#c9a96e', bottom: '-100px', left: '-80px' }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, background: 'rgba(232,96,76,0.15)', color: '#e8604c', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(232,96,76,0.3)' }}>
              For Brokerages & Enterprise
            </span>
          </div>
          <h1 className="font-semibold text-white" style={{ fontSize: '56px', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.02em' }}>
            A platform that transforms<br />brokerage value.
          </h1>
          <p className="text-blue-200" style={{ fontSize: '20px', lineHeight: '1.75', maxWidth: '600px', margin: '0 auto 48px' }}>
            HomeOS gives brokerages a permanent presence in the homeowner's life — long after the transaction.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/home-profile" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '16px 32px', fontSize: '16px' }}>
              Bring HomeOS to Your Brokerage <ArrowRight style={{ width: '18px', height: '18px' }} />
            </Link>
            <Link to="/homeos" className="flex items-center gap-2 font-semibold rounded-2xl border transition-all hover:bg-white/10" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '16px 32px', fontSize: '16px' }}>
              Request an Enterprise Demo
            </Link>
          </div>
          {/* Stat strip */}
          <div className="flex items-center justify-center gap-10 flex-wrap" style={{ marginTop: '64px', paddingTop: '48px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { value: '36%', label: 'US Market Coverage' },
              { value: '20+', label: 'Brokerage Brands' },
              { value: '∞', label: 'Post-Closing Value' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-extrabold text-white" style={{ fontSize: '32px', lineHeight: 1 }}>{s.value}</p>
                <p className="text-blue-300" style={{ fontSize: '13px', marginTop: '4px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. THE BROKERAGE PROBLEM ── */}
      <section style={{ padding: '96px 32px', background: 'white' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <SectionLabel text="The Brokerage Problem" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '24px' }}>
                Brokerages lose visibility<br />after closing.
              </h2>
              <p className="text-slate-500" style={{ fontSize: '17px', lineHeight: '1.8', marginBottom: '32px' }}>
                Once the deal closes, the brokerage disappears from the homeowner's life. There's no ongoing engagement, no brand presence, no data continuity, and no long-term value.
              </p>
              <p className="font-bold" style={{ fontSize: '22px', color: '#e8604c' }}>HomeOS solves this.</p>
            </FadeIn>
            <FadeIn delay={120}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'At Closing', value: 'Brokerage brand visible', status: 'ok' },
                  { label: '30 Days Later', value: 'Moving chaos — no touchpoint', status: 'bad' },
                  { label: '6 Months Later', value: 'Brand forgotten', status: 'bad' },
                  { label: '3 Years Later', value: 'Client buys through a competitor', status: 'bad' },
                  { label: 'With HomeOS', value: 'Brand inside their home every day', status: 'highlight' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between" style={{
                    padding: '14px 18px', borderRadius: '12px',
                    background: row.status === 'highlight' ? '#1e3a5f' : row.status === 'ok' ? '#ecfdf5' : '#fef2f2',
                    border: `1px solid ${row.status === 'highlight' ? '#1e3a5f' : row.status === 'ok' ? '#a7f3d0' : '#fecaca'}`,
                  }}>
                    <p className="font-semibold" style={{ fontSize: '14px', color: row.status === 'highlight' ? 'white' : '#334155' }}>{row.label}</p>
                    <p style={{ fontSize: '13px', color: row.status === 'highlight' ? '#93c5fd' : row.status === 'ok' ? '#059669' : '#dc2626' }}>{row.value}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 3. ENTERPRISE VALUE DRIVERS ── */}
      <section style={{ padding: '96px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '56px' }}>
              <SectionLabel text="Enterprise Value Drivers" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '16px' }}>
                HomeOS creates durable,<br />compounding value for brokerages.
              </h2>
              <p className="text-slate-500" style={{ fontSize: '17px', maxWidth: '520px', margin: '0 auto' }}>
                Five strategic advantages that compound over time — creating a moat no competitor can bridge.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUE_DRIVERS.map((vd, i) => {
              const Icon = vd.icon;
              return (
                <FadeIn key={i} delay={i * 70}>
                  <div className="bg-white" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '14px' }}>
                      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '46px', height: '46px', borderRadius: '12px', background: vd.bg }}>
                        <Icon style={{ width: '22px', height: '22px', color: vd.color }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: vd.color, background: vd.bg, padding: '2px 8px', borderRadius: '999px' }}>{vd.number}</span>
                    </div>
                    <p className="font-semibold text-slate-900" style={{ fontSize: '17px', marginBottom: '8px' }}>{vd.title}</p>
                    <p className="text-slate-500" style={{ fontSize: '14px', lineHeight: '1.7' }}>{vd.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
            {/* Filler CTA card */}
            <FadeIn delay={350}>
              <div style={{ borderRadius: '16px', border: '2px dashed #c7d7eb', padding: '28px', background: '#eef2f8', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <Building2 style={{ width: '32px', height: '32px', color: '#1e3a5f', marginBottom: '12px' }} />
                <p className="font-semibold" style={{ fontSize: '16px', color: '#1e3a5f', marginBottom: '8px' }}>Ready to lead the category?</p>
                <Link to="/homeos" style={{ fontSize: '14px', color: '#e8604c', fontWeight: 600 }}>Request a Demo →</Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 4. BROKERAGE DASHBOARD PREVIEW ── */}
      <section style={{ padding: '96px 32px', background: 'white' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '48px' }}>
              <SectionLabel text="Brokerage Dashboard" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '16px' }}>
                Portfolio-wide intelligence<br />at a glance.
              </h2>
              <p className="text-slate-500" style={{ fontSize: '17px', maxWidth: '500px', margin: '0 auto' }}>
                The HomeOS brokerage dashboard gives leadership a real-time view of client engagement, portfolio health, and market trends.
              </p>
            </div>
          </FadeIn>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: '32px' }}>
            {DASHBOARD_METRICS.map((m, i) => (
              <FadeIn key={i} delay={i * 60}>
                <div className="bg-white" style={{ borderRadius: '14px', border: `1px solid ${m.bg}`, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <p className="font-extrabold" style={{ fontSize: '28px', lineHeight: 1, color: m.color }}>{m.value}</p>
                  <p className="font-medium text-slate-600" style={{ fontSize: '13px', marginTop: '4px' }}>{m.label}</p>
                  <p className="font-semibold" style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>{m.trend} vs last quarter</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Dashboard mockup */}
          <FadeIn delay={200}>
            <div style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fecaca' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fde68a' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#a7f3d0' }} />
                <p className="font-semibold text-slate-400" style={{ fontSize: '13px', marginLeft: '8px' }}>HomeOS Brokerage Dashboard — Preview</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Client Engagement', desc: 'Monthly active users, session depth, module usage by client segment.' },
                  { title: 'Portfolio Insights', desc: 'Total value tracked, equity trends, maintenance load across all client homes.' },
                  { title: 'Renewal Cycles', desc: 'Insurance renewals, mortgage milestones, and upcoming lifecycle events.' },
                  { title: 'Market Trends', desc: 'Neighborhood valuation trends, appreciation benchmarks, and market comparisons.' },
                  { title: 'Agent Performance', desc: 'Client connection rate, post-closing touchpoints, and referral attribution.' },
                  { title: 'Risk Indicators', desc: 'Insurance gaps, missing documents, and overdue maintenance across the portfolio.' },
                ].map((panel, i) => (
                  <div key={i} className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px' }}>
                    <p className="font-semibold text-slate-900" style={{ fontSize: '14px', marginBottom: '6px' }}>{panel.title}</p>
                    <p className="text-slate-400" style={{ fontSize: '12px', lineHeight: '1.6' }}>{panel.desc}</p>
                    <div style={{ height: '32px', borderRadius: '8px', background: '#f1f5f9', marginTop: '12px' }} />
                  </div>
                ))}
              </div>
              <div className="text-center" style={{ marginTop: '24px' }}>
                <span className="font-semibold text-slate-400" style={{ fontSize: '13px' }}>Full dashboard available in enterprise demo</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── Enterprise Features ── */}
      <section style={{ padding: '96px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '48px' }}>
              <SectionLabel text="Enterprise Features" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15' }}>
                Built for enterprise scale.
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ENTERPRISE_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeIn key={i} delay={i * 60}>
                  <div className="bg-white flex items-start gap-4" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2f8' }}>
                      <Icon style={{ width: '20px', height: '20px', color: '#1e3a5f' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900" style={{ fontSize: '15px', marginBottom: '4px' }}>{f.label}</p>
                      <p className="text-slate-500" style={{ fontSize: '13px', lineHeight: '1.6' }}>{f.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <section style={{ padding: '96px 32px', background: '#1e3a5f', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full opacity-5" style={{ width: '500px', height: '500px', background: '#e8604c', top: '-100px', right: '-100px' }} />
          <div className="absolute rounded-full opacity-5" style={{ width: '300px', height: '300px', background: '#c9a96e', bottom: '-60px', left: '-60px' }} />
        </div>
        <div className="relative z-10" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <SectionLabel text="Get Started" light />
            <h2 className="font-semibold text-white" style={{ fontSize: '44px', lineHeight: '1.15', marginBottom: '20px' }}>
              Bring HomeOS to Your Brokerage
            </h2>
            <p className="text-blue-200" style={{ fontSize: '18px', lineHeight: '1.7', marginBottom: '40px' }}>
              Lead the category. Create a permanent brand presence. Build the data moat your competitors can't touch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/home-profile" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '16px 32px', fontSize: '16px' }}>
                Bring HomeOS to Your Brokerage <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
              <Link to="/homeos" className="flex items-center gap-2 font-semibold rounded-2xl border hover:bg-white/10 transition-all" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '16px 32px', fontSize: '16px' }}>
                Request an Enterprise Demo
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  </>
);

export default BrokerageValuePage;
