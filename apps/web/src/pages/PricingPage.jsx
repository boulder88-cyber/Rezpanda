import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, X, Home, Star, Building2,
  Users, Zap, FileText, Shield, Wrench, TrendingUp,
  Download, BarChart2, Headphones, Crown
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

const FadeIn = ({ children, delay = 0, style = {} }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      ...style,
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

const HOMEOWNER_PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    desc: 'Everything you need to get started.',
    icon: Home,
    color: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
    cta: 'Start Free',
    ctaStyle: 'outline',
    features: [
      '1 Home Profile',
      'Document Vault (up to 25 files)',
      'Basic Maintenance Reminders',
      'Basic Valuation',
      'Timeline History',
      'Email Support',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 8, annual: 80 },
    desc: 'The complete HomeOS experience.',
    icon: Star,
    color: '#1e3a5f',
    bg: '#1e3a5f',
    border: '#1e3a5f',
    cta: 'Start Pro',
    ctaStyle: 'solid',
    badge: 'Most Popular',
    features: [
      'Everything in Free, plus:',
      'Unlimited Documents',
      'Predictive Maintenance',
      'Insurance Analyzer',
      'Utility Tracking',
      'Advanced Valuation & Equity',
      'Exportable Home History',
      'Priority Support',
    ],
  },
  {
    name: 'Portfolio',
    price: { monthly: null, annual: null },
    desc: 'For multi-property owners and family offices.',
    icon: Crown,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    cta: 'Contact Sales',
    ctaStyle: 'outline-purple',
    features: [
      'Multi-Property Dashboard',
      'Dedicated Support',
      'White-Glove Onboarding',
      'API Access (future)',
      'Custom Integrations',
      'Everything in Pro',
    ],
  },
];

const PROFESSIONAL_PLANS = [
  {
    name: 'Agent',
    price: '$19/mo',
    desc: 'Stay connected with every client, long after closing.',
    icon: Users,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    cta: 'Start Agent Plan',
    features: [
      'Client Home Profiles',
      'Automated Touchpoints',
      'Branded HomeOS Experience',
      'Client Retention Analytics',
      'Post-Closing Engagement Tools',
    ],
  },
  {
    name: 'Brokerage Enterprise',
    price: 'Custom',
    desc: 'White-label HomeOS for your entire brokerage.',
    icon: Building2,
    color: '#1e3a5f',
    bg: '#1e3a5f',
    border: '#1e3a5f',
    cta: 'Request Enterprise Demo',
    features: [
      'White-Label CompassHomeOS',
      'Brokerage Dashboards',
      'Client Engagement Metrics',
      'Agent Integration',
      'Dedicated Enterprise Support',
      'Custom SLA',
    ],
    dark: true,
  },
];

const COMPARISON = [
  { feature: 'Homes Supported', free: '1', pro: 'Unlimited', portfolio: 'Unlimited' },
  { feature: 'Documents', free: '25 files', pro: 'Unlimited', portfolio: 'Unlimited' },
  { feature: 'Maintenance Scheduler', free: 'Basic', pro: 'Predictive', portfolio: 'Predictive' },
  { feature: 'Insurance Analyzer', free: false, pro: true, portfolio: true },
  { feature: 'Utilities Dashboard', free: false, pro: true, portfolio: true },
  { feature: 'Valuation & Equity', free: 'Basic', pro: 'Advanced', portfolio: 'Advanced' },
  { feature: 'Export Home History', free: false, pro: true, portfolio: true },
  { feature: 'Portfolio Overview', free: false, pro: false, portfolio: true },
  { feature: 'API Access', free: false, pro: false, portfolio: 'Coming soon' },
  { feature: 'Support', free: 'Email', pro: 'Priority', portfolio: 'Dedicated' },
];

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const PricingPage = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <Helmet><title>Pricing & Plans — HomeOS</title></Helmet>
      <div className="min-h-screen bg-white overflow-x-hidden">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden" style={{ background: '#1e3a5f', padding: '100px 32px 80px' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute rounded-full opacity-5" style={{ width: '600px', height: '600px', background: '#e8604c', top: '-150px', right: '-100px' }} />
            <div className="absolute rounded-full opacity-5" style={{ width: '350px', height: '350px', background: '#c9a96e', bottom: '-80px', left: '-60px' }} />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, background: 'rgba(232,96,76,0.15)', color: '#e8604c', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(232,96,76,0.3)' }}>
                Pricing & Plans
              </span>
            </div>
            <h1 className="font-semibold text-white" style={{ fontSize: '52px', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-0.02em' }}>
              Simple, transparent pricing<br />for every homeowner.
            </h1>
            <p className="text-blue-200" style={{ fontSize: '18px', lineHeight: '1.75', maxWidth: '540px', margin: '0 auto 40px' }}>
              Start free. Upgrade when you're ready. HomeOS grows with you — from one home to a full portfolio.
            </p>
            {/* Annual toggle */}
            <div className="flex items-center justify-center gap-3">
              <span style={{ fontSize: '14px', color: annual ? 'rgba(255,255,255,0.5)' : 'white', fontWeight: 600 }}>Monthly</span>
              <button onClick={() => setAnnual(a => !a)} style={{ width: '48px', height: '26px', borderRadius: '999px', background: annual ? '#e8604c' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: annual ? '25px' : '3px', transition: 'left 0.2s' }} />
              </button>
              <span style={{ fontSize: '14px', color: annual ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                Annual <span style={{ fontSize: '12px', color: '#86efac', marginLeft: '4px' }}>Save 17%</span>
              </span>
            </div>
          </div>
        </section>

        {/* ── HOMEOWNER PRICING TIERS ── */}
        <section style={{ padding: '80px 32px', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <FadeIn>
              <p className="text-center font-semibold text-slate-500 uppercase tracking-widest" style={{ fontSize: '12px', marginBottom: '40px', letterSpacing: '0.15em' }}>For Homeowners</p>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HOMEOWNER_PLANS.map((plan, i) => {
                const Icon = plan.icon;
                const isDark = plan.name === 'Pro';
                const price = annual ? plan.price.annual : plan.price.monthly;
                return (
                  <FadeIn key={i} delay={i * 80} style={{ height: '100%' }}>
                    <div style={{
                      borderRadius: '20px',
                      border: `2px solid ${plan.border}`,
                      padding: '32px',
                      background: isDark ? '#1e3a5f' : 'white',
                      position: 'relative',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: isDark ? '0 8px 32px rgba(30,58,95,0.25)' : '0 1px 4px rgba(0,0,0,0.05)',
                    }}>
                      {plan.badge && (
                        <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: '#e8604c', color: 'white', fontSize: '12px', fontWeight: 700, padding: '4px 16px', borderRadius: '999px' }}>
                          {plan.badge}
                        </div>
                      )}
                      <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.1)' : plan.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon style={{ width: '22px', height: '22px', color: isDark ? 'white' : plan.color }} />
                        </div>
                        <p className="font-semibold" style={{ fontSize: '20px', color: isDark ? 'white' : '#0f172a' }}>{plan.name}</p>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        {price === null ? (
                          <p className="font-extrabold" style={{ fontSize: '36px', lineHeight: 1, color: isDark ? 'white' : plan.color }}>Custom</p>
                        ) : price === 0 ? (
                          <p className="font-extrabold" style={{ fontSize: '36px', lineHeight: 1, color: isDark ? 'white' : plan.color }}>Free</p>
                        ) : (
                          <div className="flex items-end gap-1">
                            <p className="font-extrabold" style={{ fontSize: '40px', lineHeight: 1, color: isDark ? 'white' : plan.color }}>${price}</p>
                            <p style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.6)' : '#94a3b8', marginBottom: '4px' }}>/{annual ? 'yr' : 'mo'}</p>
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b', marginBottom: '28px', lineHeight: '1.6' }}>{plan.desc}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, marginBottom: '28px' }}>
                        {plan.features.map((f, j) => (
                          <div key={j} className="flex items-start gap-2.5">
                            {f.includes('plus:') ? (
                              <p style={{ fontSize: '12px', fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>{f}</p>
                            ) : (
                              <>
                                <Check style={{ width: '16px', height: '16px', color: isDark ? '#86efac' : '#059669', flexShrink: 0, marginTop: '1px' }} />
                                <p style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.85)' : '#334155' }}>{f}</p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <Link to={plan.name === 'Portfolio' ? '/contact' : '/home-profile'} className="flex items-center justify-center gap-2 font-semibold rounded-xl hover:opacity-90 transition-all" style={{
                        padding: '14px',
                        fontSize: '15px',
                        background: isDark ? '#e8604c' : plan.name === 'Portfolio' ? 'white' : '#1e3a5f',
                        color: isDark ? 'white' : plan.name === 'Portfolio' ? plan.color : 'white',
                        border: plan.name === 'Portfolio' ? `2px solid ${plan.color}` : 'none',
                      }}>
                        {plan.cta} {plan.name !== 'Portfolio' && <ArrowRight style={{ width: '16px', height: '16px' }} />}
                      </Link>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── AGENT & BROKERAGE PRICING ── */}
        <section style={{ padding: '80px 32px', background: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <FadeIn>
              <p className="text-center font-semibold text-slate-500 uppercase tracking-widest" style={{ fontSize: '12px', marginBottom: '40px', letterSpacing: '0.15em' }}>For Agents & Brokerages</p>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PROFESSIONAL_PLANS.map((plan, i) => {
                const Icon = plan.icon;
                return (
                  <FadeIn key={i} delay={i * 100}>
                    <div style={{
                      borderRadius: '20px',
                      border: `2px solid ${plan.border}`,
                      padding: '36px',
                      background: plan.dark ? '#1e3a5f' : 'white',
                      boxShadow: plan.dark ? '0 8px 32px rgba(30,58,95,0.2)' : '0 1px 4px rgba(0,0,0,0.05)',
                    }}>
                      <div className="flex items-start justify-between" style={{ marginBottom: '20px' }}>
                        <div>
                          <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: plan.dark ? 'rgba(255,255,255,0.1)' : plan.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon style={{ width: '20px', height: '20px', color: plan.dark ? 'white' : plan.color }} />
                            </div>
                            <p className="font-semibold" style={{ fontSize: '20px', color: plan.dark ? 'white' : '#0f172a' }}>{plan.name}</p>
                          </div>
                          <p style={{ fontSize: '14px', color: plan.dark ? 'rgba(255,255,255,0.6)' : '#64748b', lineHeight: '1.6', maxWidth: '340px' }}>{plan.desc}</p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className="font-extrabold" style={{ fontSize: '32px', lineHeight: 1, color: plan.dark ? 'white' : plan.color }}>{plan.price}</p>
                          {plan.price !== 'Custom' && <p style={{ fontSize: '13px', color: plan.dark ? 'rgba(255,255,255,0.4)' : '#94a3b8', marginTop: '2px' }}>per agent</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '24px' }}>
                        {plan.features.map((f, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <Check style={{ width: '15px', height: '15px', color: plan.dark ? '#86efac' : '#059669', flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontSize: '13px', color: plan.dark ? 'rgba(255,255,255,0.8)' : '#334155' }}>{f}</p>
                          </div>
                        ))}
                      </div>
                      <Link to="/contact" className="flex items-center justify-center gap-2 font-semibold rounded-xl hover:opacity-90 transition-all" style={{ padding: '13px', fontSize: '15px', background: plan.dark ? '#e8604c' : '#1e3a5f', color: 'white' }}>
                        {plan.cta} <ArrowRight style={{ width: '16px', height: '16px' }} />
                      </Link>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FEATURE COMPARISON TABLE ── */}
        <section style={{ padding: '80px 32px', background: '#f8fafc' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <FadeIn>
              <div className="text-center" style={{ marginBottom: '40px' }}>
                <SectionLabel text="Feature Comparison" />
                <h2 className="font-semibold text-slate-900" style={{ fontSize: '36px', lineHeight: '1.15' }}>Everything side by side.</h2>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="bg-white" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                {/* Header */}
                <div className="grid grid-cols-4" style={{ background: '#1e3a5f', padding: '16px 24px' }}>
                  <p className="font-semibold text-white" style={{ fontSize: '14px' }}>Feature</p>
                  {['Free', 'Pro', 'Portfolio'].map(col => (
                    <p key={col} className="text-center font-semibold text-white" style={{ fontSize: '14px' }}>{col}</p>
                  ))}
                </div>
                {COMPARISON.map((row, i) => (
                  <div key={i} className="grid grid-cols-4" style={{ padding: '14px 24px', background: i % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <p className="font-medium text-slate-700" style={{ fontSize: '14px' }}>{row.feature}</p>
                    {['free', 'pro', 'portfolio'].map(col => (
                      <div key={col} className="flex items-center justify-center">
                        {row[col] === true ? (
                          <Check style={{ width: '18px', height: '18px', color: '#059669' }} />
                        ) : row[col] === false ? (
                          <X style={{ width: '16px', height: '16px', color: '#cbd5e1' }} />
                        ) : (
                          <p className="text-center font-medium" style={{ fontSize: '13px', color: '#334155' }}>{row[col]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '80px 32px', background: '#1e3a5f', position: 'relative', overflow: 'hidden' }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute rounded-full opacity-5" style={{ width: '500px', height: '500px', background: '#e8604c', top: '-100px', right: '-100px' }} />
          </div>
          <div className="relative z-10" style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
            <FadeIn>
              <h2 className="font-semibold text-white" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '16px' }}>Start free today.</h2>
              <p className="text-blue-200" style={{ fontSize: '17px', lineHeight: '1.7', marginBottom: '36px' }}>No credit card required. Upgrade when you're ready.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/home-profile" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '15px 32px', fontSize: '15px' }}>
                  Start Free <ArrowRight style={{ width: '17px', height: '17px' }} />
                </Link>
                <Link to="/contact" className="flex items-center gap-2 font-semibold rounded-2xl border hover:bg-white/10 transition-all" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '15px 32px', fontSize: '15px' }}>
                  Contact Sales
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

      </div>
    </>
  );
};

export default PricingPage;
