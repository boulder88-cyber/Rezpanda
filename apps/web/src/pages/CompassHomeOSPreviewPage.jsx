import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Home, Layers, Wrench, FileText, TrendingUp,
  Shield, Users, BarChart2, CheckCircle2, Star, Zap,
  Activity, Building2, Globe, Lock, ChevronRight
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
// COMPASS COLOR SYSTEM (spec: #000000, #FFFFFF, #F2F2F2)
// ═══════════════════════════════════════════════════════════════════════

const C = {
  black: '#000000',
  white: '#ffffff',
  gray: '#f2f2f2',
  grayMid: '#e0e0e0',
  grayDark: '#767676',
  grayDeep: '#333333',
};

const SectionLabel = ({ text, dark = false }) => (
  <p style={{ fontSize: '11px', fontWeight: 700, color: dark ? C.grayDark : C.grayDark, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '14px' }}>
    {text}
  </p>
);

const Divider = ({ color = C.grayMid }) => (
  <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 32px' }}>
    <div style={{ height: '1px', background: color }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════

const MODULE_PREVIEWS = [
  {
    icon: Home,
    label: 'Home Profile',
    preview: 'Your property\'s command center — valuation, equity, insurance, maintenance, and documents.',
    badge: 'Compass Branded',
  },
  {
    icon: Layers,
    label: 'Portfolio Overview',
    preview: 'Total portfolio value, equity, maintenance load, and risk indicators across all client homes.',
    badge: 'Enterprise Ready',
  },
  {
    icon: Wrench,
    label: 'Maintenance Scheduler',
    preview: 'Predictive tasks, seasonal reminders, vendor coordination, and smart recommendations.',
    badge: 'Compass Branded',
  },
  {
    icon: FileText,
    label: 'Document Vault',
    preview: 'Encrypted storage for deeds, warranties, policies, closing documents, and receipts.',
    badge: 'Compass Branded',
  },
];

const ENTERPRISE_FEATURES = [
  { icon: Users, label: 'Agent Integration', desc: 'Every Compass agent connected to their client\'s HomeOS instance.' },
  { icon: BarChart2, label: 'Brokerage Dashboards', desc: 'Portfolio-wide engagement and performance metrics.' },
  { icon: TrendingUp, label: 'Client Engagement Metrics', desc: 'Real-time activity, lifecycle stage, and retention tracking.' },
  { icon: Globe, label: 'White-Label Customization', desc: 'Full Compass branding — typography, color, iconography, layout.' },
  { icon: Shield, label: 'Enterprise Security', desc: 'Bank-grade encryption, SOC 2 ready, compliance infrastructure.' },
  { icon: Lock, label: 'Data Ownership', desc: 'Compass retains full ownership of client data and engagement history.' },
];

// ═══════════════════════════════════════════════════════════════════════
// COMPASS MODULE CARD (black/white/gray design)
// ═══════════════════════════════════════════════════════════════════════

const CompassModuleCard = ({ module }) => {
  const Icon = module.icon;
  return (
    <div style={{
      background: C.white, borderRadius: '12px',
      border: `1px solid ${C.grayMid}`,
      padding: '28px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Compass nav bar mockup */}
      <div className="flex items-center justify-between" style={{ background: C.black, borderRadius: '8px 8px 0 0', padding: '8px 14px', marginBottom: '0' }}>
        <div className="flex items-center gap-2">
          <div style={{ width: '18px', height: '18px', background: C.white, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '10px', height: '10px', background: C.black, borderRadius: '2px' }} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: C.white, letterSpacing: '0.08em' }}>COMPASS</span>
        </div>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>HomeOS</span>
      </div>

      {/* Module content area */}
      <div style={{ background: C.gray, borderRadius: '0 0 8px 8px', padding: '20px', marginBottom: '20px', flex: 1 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: C.white, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Icon style={{ width: '18px', height: '18px', color: C.black }} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: C.black }}>{module.label}</p>
            <span style={{ fontSize: '10px', fontWeight: 600, color: C.grayDark, background: C.grayMid, padding: '1px 7px', borderRadius: '999px' }}>{module.badge}</span>
          </div>
        </div>
        {/* Content skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[80, 60, 90, 45].map((w, i) => (
            <div key={i} style={{ height: '8px', background: C.grayMid, borderRadius: '4px', width: `${w}%` }} />
          ))}
        </div>
        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2" style={{ marginTop: '14px' }}>
          {['—', '—', '—'].map((_, j) => (
            <div key={j} style={{ background: C.white, borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
              <div style={{ height: '14px', width: '60%', background: C.grayMid, borderRadius: '3px', margin: '0 auto 4px' }} />
              <div style={{ height: '8px', width: '80%', background: C.gray, borderRadius: '3px', margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '13px', lineHeight: '1.7', color: C.grayDeep }}>{module.preview}</p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const CompassHomeOSPreviewPage = () => (
  <>
    <Helmet><title>CompassHomeOS: Powered by HomeOS — CasaCEO</title></Helmet>
    <div className="min-h-screen overflow-x-hidden" style={{ background: C.white }}>

      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden" style={{ background: C.black, padding: '120px 32px 96px' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-5" style={{ width: '600px', height: '600px', background: C.white, top: '-150px', right: '-100px' }} />
          <div className="absolute rounded-full opacity-3" style={{ width: '300px', height: '300px', background: C.white, bottom: '-80px', left: '-60px' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Compass wordmark */}
          <div className="flex items-center justify-center gap-3" style={{ marginBottom: '40px' }}>
            <div style={{ width: '36px', height: '36px', background: C.white, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '20px', height: '20px', background: C.black, borderRadius: '4px' }} />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 700, color: C.white, letterSpacing: '0.1em' }}>COMPASS</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>×</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>HomeOS</span>
          </div>

          <h1 className="font-semibold" style={{ fontSize: '56px', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.02em', color: C.white }}>
            CompassHomeOS:<br />Powered by HomeOS
          </h1>
          <p style={{ fontSize: '20px', lineHeight: '1.75', maxWidth: '600px', margin: '0 auto 48px', color: 'rgba(255,255,255,0.65)' }}>
            A Compass-branded homeowner experience built on the HomeOS platform — seamless, premium, and permanent.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="flex items-center gap-2 font-semibold rounded-2xl hover:opacity-90 transition-all" style={{ background: C.white, color: C.black, padding: '16px 32px', fontSize: '16px', border: 'none', cursor: 'pointer' }}>
              See CompassHomeOS in Action <ArrowRight style={{ width: '18px', height: '18px' }} />
            </button>
            <button className="flex items-center gap-2 font-semibold rounded-2xl border hover:bg-white/10 transition-all" style={{ color: C.white, borderColor: 'rgba(255,255,255,0.3)', padding: '16px 32px', fontSize: '16px', background: 'transparent', cursor: 'pointer' }}>
              Request a Compass Demo
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. BRANDING INTEGRATION ── */}
      <section style={{ padding: '96px 32px', background: C.white }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <SectionLabel text="Branding Integration" />
              <h2 className="font-semibold" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '24px', color: C.black }}>
                Designed for Compass.
              </h2>
              <p style={{ fontSize: '17px', lineHeight: '1.8', marginBottom: '32px', color: C.grayDeep }}>
                HomeOS seamlessly adapts to Compass branding — typography, color palette, iconography, and layout — creating a premium, unified experience for clients.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'Compass black (#000000) as primary brand color',
                  'Pure white (#FFFFFF) backgrounds and surfaces',
                  'Light gray (#F2F2F2) for secondary panels and UI',
                  'Compass wordmark and iconography throughout',
                  'GT America typography (or equivalent)',
                  'Luxury-grade spacing and visual hierarchy',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3" style={{ padding: '12px 16px', borderRadius: '10px', background: C.gray, border: `1px solid ${C.grayMid}` }}>
                    <CheckCircle2 style={{ width: '15px', height: '15px', color: C.black, flexShrink: 0 }} />
                    <p style={{ fontSize: '14px', color: C.grayDeep, fontWeight: 500 }}>{item}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={120}>
              {/* Brand palette visual */}
              <div style={{ background: C.gray, borderRadius: '16px', padding: '32px', border: `1px solid ${C.grayMid}` }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: C.grayDark, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>Compass Color System</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { name: 'Compass Black', hex: '#000000', bg: C.black, text: C.white },
                    { name: 'Pure White', hex: '#FFFFFF', bg: C.white, text: C.black, border: C.grayMid },
                    { name: 'Compass Gray', hex: '#F2F2F2', bg: C.gray, text: C.black, border: C.grayMid },
                    { name: 'Mid Gray', hex: '#767676', bg: C.grayDark, text: C.white },
                  ].map((swatch, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: swatch.bg, border: swatch.border ? `1px solid ${swatch.border}` : 'none', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: C.black }}>{swatch.name}</p>
                        <p style={{ fontSize: '12px', color: C.grayDark, fontFamily: 'monospace' }}>{swatch.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 3. MODULE PREVIEWS ── */}
      <section style={{ padding: '96px 32px', background: C.gray }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '48px' }}>
              <SectionLabel text="Compass-Branded Module Previews" />
              <h2 className="font-semibold" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '16px', color: C.black }}>
                Every HomeOS module.<br />Fully Compass-branded.
              </h2>
              <p style={{ fontSize: '17px', maxWidth: '520px', margin: '0 auto', color: C.grayDeep }}>
                From Home Profile to Document Vault, every module renders in Compass's visual identity — ready for enterprise deployment.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {MODULE_PREVIEWS.map((mod, i) => (
              <FadeIn key={i} delay={i * 80}>
                <CompassModuleCard module={mod} />
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={320}>
            <div className="text-center" style={{ marginTop: '32px', padding: '20px', borderRadius: '12px', background: C.white, border: `1px solid ${C.grayMid}` }}>
              <p style={{ fontSize: '14px', color: C.grayDark }}>Full Compass-branded platform available in enterprise demo. Additional modules include Portfolio Overview, Insurance Analyzer, Utilities Dashboard, and more.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── 4. ENTERPRISE FEATURES ── */}
      <section style={{ padding: '96px 32px', background: C.white }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '48px' }}>
              <SectionLabel text="Enterprise Features" />
              <h2 className="font-semibold" style={{ fontSize: '40px', lineHeight: '1.15', color: C.black }}>
                Built for Compass at scale.
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ENTERPRISE_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeIn key={i} delay={i * 60}>
                  <div className="flex items-start gap-4" style={{ background: C.gray, borderRadius: '14px', border: `1px solid ${C.grayMid}`, padding: '22px' }}>
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: C.white, border: `1px solid ${C.grayMid}` }}>
                      <Icon style={{ width: '20px', height: '20px', color: C.black }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: C.black, marginBottom: '4px' }}>{f.label}</p>
                      <p style={{ fontSize: '13px', lineHeight: '1.6', color: C.grayDeep }}>{f.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <section style={{ padding: '96px 32px', background: C.black, position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full opacity-3" style={{ width: '500px', height: '500px', background: C.white, top: '-100px', right: '-100px' }} />
        </div>
        <div className="relative z-10" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            {/* Compass × HomeOS lockup */}
            <div className="flex items-center justify-center gap-3" style={{ marginBottom: '32px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: C.white, letterSpacing: '0.1em' }}>COMPASS</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '18px' }}>×</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>HomeOS</span>
            </div>
            <h2 className="font-semibold" style={{ fontSize: '44px', lineHeight: '1.15', marginBottom: '20px', color: C.white }}>
              See CompassHomeOS<br />in Action
            </h2>
            <p style={{ fontSize: '18px', lineHeight: '1.7', marginBottom: '40px', color: 'rgba(255,255,255,0.6)' }}>
              The most complete homeowner platform — now available in a full Compass white-label deployment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="flex items-center gap-2 font-semibold rounded-2xl hover:opacity-90 transition-all" style={{ background: C.white, color: C.black, padding: '16px 32px', fontSize: '16px', border: 'none', cursor: 'pointer' }}>
                See CompassHomeOS in Action <ArrowRight style={{ width: '18px', height: '18px' }} />
              </button>
              <button className="flex items-center gap-2 font-semibold rounded-2xl border hover:bg-white/10 transition-all" style={{ color: C.white, borderColor: 'rgba(255,255,255,0.25)', padding: '16px 32px', fontSize: '16px', background: 'transparent', cursor: 'pointer' }}>
                Request a Compass Demo
              </button>
            </div>
            <div className="flex items-center justify-center gap-6 flex-wrap" style={{ marginTop: '40px' }}>
              {[
                { icon: Lock, text: 'Enterprise-grade security' },
                { icon: Globe, text: 'White-label ready' },
                { icon: Building2, text: 'Compass-native branding' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
                    <Icon style={{ width: '13px', height: '13px' }} /> {item.text}
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  </>
);

export default CompassHomeOSPreviewPage;
