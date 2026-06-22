import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import {
  ArrowRight, Home, KeyRound, CreditCard, Wrench, FileText, Bell, ShieldCheck
} from 'lucide-react';

/*
  CasaCEO — Pricing (/pricing)
  --------------------------------------------------------------------------
  Rewritten from the old HomeOS tiered page (Free/Pro/Portfolio + agent /
  brokerage plans + cathedral features). New model is simple and per-property:

    Home (non-rental):  $4.99 / mo   ·  $49.99 / yr
    Rental property:    $9.99 / mo   ·  $99.99 / yr

  Both annual prices save ~17% vs paying monthly. No free tier. Features
  describe the REAL product (Bills / Maintenance / Documents), not valuation/
  insurance-analyzer/equity. Agent & brokerage section removed (off the
  homeowner positioning). Tokens mirror MarketingHomePage exactly.
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

// ── Brand wordmark ─────────────────────────────────────────────────
const Wordmark = () => (
  <span style={{ textTransform: 'none', whiteSpace: 'nowrap' }}>Casa<span style={{ color: GOLD }}>CEO</span></span>
);

// ── Fade-in on scroll ──────────────────────────────────────────────
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
const FadeIn = ({ children, delay = 0, style = {} }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// DATA — two property types, flat within each
// ═══════════════════════════════════════════════════════════════════

const PLANS = [
  {
    key: 'home',
    name: 'Home',
    icon: Home,
    price: { monthly: 4.99, annual: 49.99 },
    tagline: 'For the home you live in.',
    blurb: 'Everything you need to run a household calmly — priced per home, so you only pay for what you actually have.',
    featured: true,
  },
  {
    key: 'rental',
    name: 'Rental',
    icon: KeyRound,
    price: { monthly: 9.99, annual: 99.99 },
    tagline: 'For a property you rent out.',
    blurb: 'The same calm system, tuned for a property you manage for someone else — keep each rental\u2019s bills and records cleanly its own.',
    featured: false,
  },
];

// What every plan includes — the real three-pillar product
const INCLUDED = [
  { icon: CreditCard, label: 'Bill Pay', desc: 'Forward a bill and it files itself — sorted by provider and due date.' },
  { icon: Wrench, label: 'Maintenance', desc: 'Gentle recurring reminders for the upkeep that keeps a home healthy.' },
  { icon: FileText, label: 'Documents', desc: 'Every important paper kept findable. (Coming soon.)' },
  { icon: Bell, label: 'Gentle reminders', desc: 'Before a due date, never after.' },
  { icon: ShieldCheck, label: 'Private by default', desc: 'No bank access, no stored card. Your records are yours alone.' },
  { icon: Home, label: 'Add homes anytime', desc: 'Each property is its own tidy set of records — pay only for what you add.' },
];

// ═══════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════

const HeroSection = ({ annual, setAnnual }) => (
  <section style={{ background: INK, padding: '92px 24px 78px', position: 'relative', overflow: 'hidden' }}>
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(62,107,168,0.22)', filter: 'blur(20px)', top: '-220px', right: '-140px' }} />
      <div style={{ position: 'absolute', width: '380px', height: '380px', borderRadius: '50%', background: 'rgba(107,143,113,0.14)', filter: 'blur(20px)', bottom: '-160px', left: '-110px' }} />
    </div>
    <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: '#BBD0EC', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' }}>Pricing</p>
      <h1 style={{ fontFamily: serif, fontSize: 'clamp(2.3rem, 5vw, 3.3rem)', fontWeight: 600, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.015em', marginBottom: '18px' }}>
        Simple pricing, per home.
      </h1>
      <p style={{ fontFamily: sans, fontSize: '18px', lineHeight: 1.65, color: 'rgba(255,255,255,0.74)', maxWidth: '520px', margin: '0 auto 36px' }}>
        One clear price for each property you keep in <Wordmark />. No tiers to decode, no features held hostage.
      </p>
      {/* Monthly / annual toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <span style={{ fontFamily: sans, fontSize: '14px', color: annual ? 'rgba(255,255,255,0.5)' : '#fff', fontWeight: 600 }}>Monthly</span>
        <button onClick={() => setAnnual(a => !a)} aria-label="Toggle annual pricing" style={{ width: '48px', height: '26px', borderRadius: '999px', background: annual ? GOLD : 'rgba(255,255,255,0.22)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: annual ? '25px' : '3px', transition: 'left 0.2s' }} />
        </button>
        <span style={{ fontFamily: sans, fontSize: '14px', color: annual ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          Annual <span style={{ fontSize: '12px', color: '#9CC5A2', marginLeft: '4px' }}>Save ~17%</span>
        </span>
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// PLAN CARDS
// ═══════════════════════════════════════════════════════════════════

const PlansSection = ({ annual }) => (
  <section style={{ background: PAPER, padding: '80px 24px' }}>
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const price = annual ? plan.price.annual : plan.price.monthly;
          const per = annual ? 'yr' : 'mo';
          return (
            <FadeIn key={plan.key} delay={i * 90} style={{ height: '100%' }}>
              <div style={{
                background: '#fff',
                border: plan.featured ? `2px solid ${INK}` : `1px solid ${LINE}`,
                borderRadius: '18px',
                padding: '32px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: plan.featured ? '0 14px 34px -18px rgba(28,53,83,0.45)' : 'none',
              }}>
                {plan.featured && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: GOLD, color: INK, fontFamily: sans, fontSize: '11px', fontWeight: 800, padding: '4px 14px', borderRadius: '999px', letterSpacing: '0.03em' }}>
                    Most homes
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: '23px', height: '23px', color: INK }} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: serif, fontSize: '22px', fontWeight: 600, color: INK, letterSpacing: '-0.01em' }}>{plan.name}</h2>
                    <p style={{ fontFamily: sans, fontSize: '13px', color: STONE }}>{plan.tagline}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: serif, fontSize: '42px', fontWeight: 600, color: INK, lineHeight: 1 }}>${price}</span>
                  <span style={{ fontFamily: sans, fontSize: '14px', color: STONE, marginBottom: '5px' }}>/{per} per property</span>
                </div>
                <p style={{ fontFamily: sans, fontSize: '13px', color: annual ? SAGE : 'transparent', marginBottom: '18px', minHeight: '18px', fontWeight: 600 }}>
                  {annual ? `Saves ~17% vs $${plan.price.monthly}/mo` : '\u00A0'}
                </p>
                <p style={{ fontFamily: sans, fontSize: '14.5px', lineHeight: 1.6, color: STONE, marginBottom: '26px', flex: 1 }}>{plan.blurb}</p>
                <Link to="/signup" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontFamily: sans, padding: '13px', borderRadius: '11px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', background: plan.featured ? INK : '#fff', color: plan.featured ? '#fff' : INK, border: plan.featured ? 'none' : `1.5px solid ${INK}`, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Get started <ArrowRight style={{ width: '16px', height: '16px' }} />
                </Link>
              </div>
            </FadeIn>
          );
        })}
      </div>
      <FadeIn delay={180}>
        <p style={{ fontFamily: sans, fontSize: '13.5px', color: STONE, textAlign: 'center', marginTop: '24px', lineHeight: 1.6 }}>
          Have more than one place? Each property is its own tidy set of records — add as many as you like, and you only pay the per-property price for each.
        </p>
      </FadeIn>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// WHAT'S INCLUDED — same for every plan
// ═══════════════════════════════════════════════════════════════════

const IncludedSection = () => (
  <section style={{ background: '#fff', padding: '84px 24px', borderTop: `1px solid ${LINE}` }}>
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>What every property includes</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 600, color: INK, letterSpacing: '-0.015em' }}>
            One price. The whole thing.
          </h2>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {INCLUDED.map((item, i) => {
          const Icon = item.icon;
          return (
            <FadeIn key={i} delay={i * 60}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '13px', background: PAPER, border: `1px solid ${LINE}`, borderRadius: '14px', padding: '20px', height: '100%' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '19px', height: '19px', color: INK }} />
                </div>
                <div>
                  <p style={{ fontFamily: sans, fontSize: '14.5px', fontWeight: 700, color: INK, marginBottom: '3px' }}>{item.label}</p>
                  <p style={{ fontFamily: sans, fontSize: '13.5px', lineHeight: 1.55, color: STONE }}>{item.desc}</p>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// CTA
// ═══════════════════════════════════════════════════════════════════

const CTASection = () => (
  <section style={{ background: INK, padding: '90px 24px' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <FadeIn>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 600, color: '#fff', letterSpacing: '-0.015em', marginBottom: '16px', lineHeight: 1.15 }}>
          Run your home for less than a coffee a month.
        </h2>
        <p style={{ fontFamily: sans, fontSize: '17px', color: 'rgba(255,255,255,0.72)', marginBottom: '34px', lineHeight: 1.6 }}>
          Add your first property in a few minutes. No card games, no upsell maze — just one calm place.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '15px 32px', borderRadius: '11px', background: '#fff', color: INK, fontSize: '15px', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            Get started <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '15px 32px', borderRadius: '11px', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            Talk to us
          </Link>
        </div>
      </FadeIn>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════

const PricingPage = () => {
  const [annual, setAnnual] = useState(false);
  return (
    <SiteLayout seo={{ title: 'Pricing — CasaCEO' }} fullWidth>
      <HeroSection annual={annual} setAnnual={setAnnual} />
      <PlansSection annual={annual} />
      <IncludedSection />
      <CTASection />
    </SiteLayout>
  );
};

export default PricingPage;
