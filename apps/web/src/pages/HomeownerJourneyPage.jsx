import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Key, Home, Wrench, Shield, TrendingUp,
  FileText, Zap, Activity, CheckCircle2, Star, BarChart2,
  Calendar, DollarSign, Layers, BookOpen, ChevronRight
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
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
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

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════

const JOURNEY_STAGES = [
  {
    number: '01', label: 'Purchase', icon: Key, color: '#1e3a5f', bg: '#eef2f8', border: '#c7d7eb',
    headline: 'Your home\'s story begins here.',
    desc: 'Document organization, insurance setup, utility onboarding. HomeOS captures every detail from day one so nothing is ever lost.',
    modules: ['Document Vault', 'Insurance Analyzer', 'Utilities Dashboard'],
    moduleLinks: ['/documents', '/insurance-analyzer', '/utilities'],
  },
  {
    number: '02', label: 'Live', icon: Home, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0',
    headline: 'Every day, organized.',
    desc: 'Maintenance scheduling, utility tracking, policy management. HomeOS keeps your home running smoothly so you can focus on living in it.',
    modules: ['Maintenance Scheduler', 'Utilities Dashboard', 'Bill Pay'],
    moduleLinks: ['/maintenance-scheduler', '/utilities', '/bill-pay'],
  },
  {
    number: '03', label: 'Improve', icon: Wrench, color: '#f97316', bg: '#fff7ed', border: '#fed7aa',
    headline: 'Invest smarter.',
    desc: 'Renovation planning, ROI insights, contractor coordination. HomeOS helps you make every improvement decision with data — not guesswork.',
    modules: ['Valuation & Equity', 'Home Timeline', 'Vendor Directory'],
    moduleLinks: ['/valuation-equity', '/timeline', '/vendors'],
  },
  {
    number: '04', label: 'Protect', icon: Shield, color: '#e8604c', bg: '#fdf0ee', border: '#fca5a5',
    headline: 'Protected on every front.',
    desc: 'Insurance analysis, risk detection, document vault. HomeOS identifies gaps before they become expensive and keeps your coverage complete.',
    modules: ['Insurance Analyzer', 'Document Vault', 'Warranty Tracker'],
    moduleLinks: ['/insurance-analyzer', '/documents', '/warranty-tracker'],
  },
  {
    number: '05', label: 'Optimize', icon: TrendingUp, color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd',
    headline: 'Build wealth with clarity.',
    desc: 'Valuation tracking, equity insights, refinance readiness. HomeOS gives you a real-time picture of your home\'s financial performance.',
    modules: ['Valuation & Equity', 'Portfolio Overview', 'Property Tax'],
    moduleLinks: ['/valuation-equity', '/portfolio', '/property-tax'],
  },
  {
    number: '06', label: 'Sell', icon: Star, color: '#d97706', bg: '#fffbeb', border: '#fde68a',
    headline: 'Sell with confidence.',
    desc: 'Complete home history, documents, and maintenance records ready for listing. HomeOS turns your ownership record into a competitive advantage at resale.',
    modules: ['Ready to Sell', 'Home Timeline', 'Document Vault'],
    moduleLinks: ['/ready-to-sell', '/timeline', '/documents'],
  },
];

const MODULE_MAP = [
  { module: 'Home Profile', stages: ['Purchase', 'Live', 'Improve', 'Protect', 'Optimize', 'Sell'], icon: Home, href: '/home-profile' },
  { module: 'Maintenance Scheduler', stages: ['Live', 'Improve'], icon: Wrench, href: '/maintenance-scheduler' },
  { module: 'Insurance Analyzer', stages: ['Purchase', 'Protect'], icon: Shield, href: '/insurance-analyzer' },
  { module: 'Valuation & Equity', stages: ['Optimize', 'Sell'], icon: TrendingUp, href: '/valuation-equity' },
  { module: 'Document Vault', stages: ['Purchase', 'Protect', 'Sell'], icon: FileText, href: '/documents' },
  { module: 'Utilities Dashboard', stages: ['Purchase', 'Live'], icon: Zap, href: '/utilities' },
  { module: 'Home Timeline', stages: ['Improve', 'Sell'], icon: Activity, href: '/timeline' },
  { module: 'Portfolio Overview', stages: ['Optimize'], icon: Layers, href: '/portfolio' },
  { module: 'Ready to Sell', stages: ['Sell'], icon: Key, href: '/ready-to-sell' },
  { module: 'Learning Hub', stages: ['Purchase', 'Live', 'Improve'], icon: BookOpen, href: '/home-learn' },
];

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const HomeownerJourneyPage = () => (
  <>
    <Helmet><title>The Homeowner Journey — CasaCEO</title></Helmet>
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden" style={{ background: '#1e3a5f', padding: '120px 32px 96px' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-5" style={{ width: '600px', height: '600px', background: '#e8604c', top: '-150px', right: '-100px' }} />
          <div className="absolute rounded-full opacity-5" style={{ width: '350px', height: '350px', background: '#c9a96e', bottom: '-80px', left: '-60px' }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, background: 'rgba(232,96,76,0.15)', color: '#e8604c', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(232,96,76,0.3)' }}>
              The Homeownership Lifecycle
            </span>
          </div>
          <h1 className="font-semibold text-white" style={{ fontSize: '56px', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.02em' }}>
            A complete lifecycle —<br />supported by one system.
          </h1>
          <p className="text-blue-200" style={{ fontSize: '20px', lineHeight: '1.75', maxWidth: '600px', margin: '0 auto 48px' }}>
            HomeOS guides homeowners through every stage of ownership with clarity, intelligence, and continuity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/home-profile" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '16px 32px', fontSize: '16px' }}>
              Start Your Home Journey <ArrowRight style={{ width: '18px', height: '18px' }} />
            </Link>
            <Link to="/home-profile" className="flex items-center gap-2 font-semibold rounded-2xl border transition-all hover:bg-white/10" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '16px 32px', fontSize: '16px' }}>
              See Your Home Profile
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stage nav strip ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 32px', overflowX: 'auto' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', display: 'flex', gap: '0' }}>
          {JOURNEY_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <a key={i} href={`#stage-${stage.number}`} className="flex items-center gap-2 flex-shrink-0 hover:bg-slate-50 transition-colors" style={{ padding: '16px 20px', borderBottom: '2px solid transparent', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.borderBottomColor = stage.color}
                onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'transparent'}>
                <div className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '7px', background: stage.bg }}>
                  <Icon style={{ width: '14px', height: '14px', color: stage.color }} />
                </div>
                <span className="font-semibold text-slate-700" style={{ fontSize: '13px' }}>{stage.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* ── 2. JOURNEY TIMELINE ── */}
      <section style={{ padding: '96px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '64px' }}>
              <SectionLabel text="The Homeownership Lifecycle" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15' }}>
                Six stages. One system. Zero gaps.
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {JOURNEY_STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const isLast = i === JOURNEY_STAGES.length - 1;
              return (
                <FadeIn key={i} delay={i * 80}>
                  <div id={`stage-${stage.number}`} style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
                    {/* Left spine */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '64px', flexShrink: 0 }}>
                      <div className="flex items-center justify-center font-extrabold text-white" style={{ width: '56px', height: '56px', borderRadius: '50%', background: stage.color, fontSize: '16px', flexShrink: 0, zIndex: 1, boxShadow: `0 0 0 4px ${stage.bg}` }}>
                        {stage.number}
                      </div>
                      {!isLast && <div style={{ width: '2px', flex: 1, background: '#e2e8f0', minHeight: '48px' }} />}
                    </div>

                    {/* Content card */}
                    <div style={{ flex: 1, paddingBottom: isLast ? '0' : '40px', paddingLeft: '24px' }}>
                      <div className="bg-white" style={{ borderRadius: '16px', border: `1px solid ${stage.border}`, padding: '28px 32px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-4" style={{ marginBottom: '12px' }}>
                            <div className="flex items-center justify-center flex-shrink-0" style={{ width: '48px', height: '48px', borderRadius: '12px', background: stage.bg }}>
                              <Icon style={{ width: '24px', height: '24px', color: stage.color }} />
                            </div>
                            <div>
                              <span className="font-bold uppercase tracking-widest" style={{ fontSize: '11px', color: stage.color }}>{stage.label}</span>
                              <p className="font-semibold text-slate-900" style={{ fontSize: '20px', lineHeight: '1.2' }}>{stage.headline}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-500" style={{ fontSize: '15px', lineHeight: '1.8', marginBottom: '20px' }}>{stage.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {stage.modules.map((mod, j) => (
                            <Link key={j} to={stage.moduleLinks[j]} className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity rounded-xl" style={{ fontSize: '12px', color: stage.color, background: stage.bg, padding: '5px 12px' }}>
                              {mod} <ChevronRight style={{ width: '12px', height: '12px' }} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. MODULE → LIFECYCLE MAPPING ── */}
      <section style={{ padding: '96px 32px', background: 'white' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '48px' }}>
              <SectionLabel text="How HomeOS Supports Each Stage" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '16px' }}>
                Every module maps to your lifecycle.
              </h2>
              <p className="text-slate-500" style={{ fontSize: '17px', maxWidth: '520px', margin: '0 auto' }}>
                Each HomeOS module was built for a specific stage of the ownership lifecycle — so you always have the right tool at the right moment.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MODULE_MAP.map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={i} delay={i * 50}>
                  <div className="flex items-center gap-4 bg-white hover:bg-slate-50 transition-colors" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#eef2f8' }}>
                      <Icon style={{ width: '17px', height: '17px', color: '#1e3a5f' }} />
                    </div>
                    <p className="font-semibold text-slate-800" style={{ fontSize: '14px', minWidth: '180px' }}>{item.module}</p>
                    <div className="flex flex-wrap gap-2 flex-1">
                      {item.stages.map((stage, j) => {
                        const stageData = JOURNEY_STAGES.find(s => s.label === stage);
                        return (
                          <span key={j} className="font-semibold rounded-full" style={{ fontSize: '11px', background: stageData?.bg || '#f8fafc', color: stageData?.color || '#64748b', padding: '2px 10px' }}>
                            {stage}
                          </span>
                        );
                      })}
                    </div>
                    <Link to={item.href} className="flex items-center gap-1 font-semibold flex-shrink-0 hover:opacity-70 transition-opacity" style={{ fontSize: '12px', color: '#1e3a5f' }}>
                      Open <ChevronRight style={{ width: '13px', height: '13px' }} />
                    </Link>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. CTA ── */}
      <section style={{ padding: '96px 32px', background: '#1e3a5f', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full opacity-5" style={{ width: '500px', height: '500px', background: '#e8604c', top: '-100px', right: '-100px' }} />
          <div className="absolute rounded-full opacity-5" style={{ width: '300px', height: '300px', background: '#c9a96e', bottom: '-60px', left: '-60px' }} />
        </div>
        <div className="relative z-10" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <SectionLabel text="Begin Your Journey" light />
            <h2 className="font-semibold text-white" style={{ fontSize: '44px', lineHeight: '1.15', marginBottom: '20px' }}>
              Start Your Home Journey
            </h2>
            <p className="text-blue-200" style={{ fontSize: '18px', lineHeight: '1.7', marginBottom: '40px' }}>
              Every stage of homeownership — supported by one intelligent system. Start with your home profile.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/home-profile" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '16px 32px', fontSize: '16px' }}>
                Start Your Home Journey <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
              <Link to="/home-profile" className="flex items-center gap-2 font-semibold rounded-2xl border hover:bg-white/10 transition-all" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '16px 32px', fontSize: '16px' }}>
                See Your Home Profile
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  </>
);

export default HomeownerJourneyPage;
