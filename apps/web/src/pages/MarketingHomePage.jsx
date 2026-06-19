import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import {
  ArrowRight, CheckCircle2, CreditCard, Wrench, FileText,
  ShieldCheck, Bell, Heart, Star
} from 'lucide-react';

/*
  CasaCEO — Marketing Home (warmed home-OS, 3 pillars)
  --------------------------------------------------------------------------
  Subject: a home management platform — the calm place to run everything
  your home needs. Built on THREE pillars, not a flat list of features:

    Home Bill Pay+ · Maintenance · Documents

  Everything else (insurance, warranty, vendors, mortgage, taxes…) lives
  inside one of the three as an example sub-item, not its own headline.
  The "+" on Bill Pay quietly carries the bonus that it catches non-home
  bills too — without making the whole page about bills.

  Kept the bones of the prior navy home-OS page, but warmed the palette,
  cut the asset/ROI/dashboard coldness, and wrote plainer, human copy.

  Tokens:
    Ink   #1C3553  warmed navy — brand anchor + headlines
    Sky   #3E6BA8  softer mid-blue accent (was the harsh #1A73E8)
    Paper #F6F3EC  warm off-white background (replaces cold slate-50)
    Sand  #EFE9DD  warm card tint / dividers
    Sage  #6B8F71  "done / reassurance" accent, used lightly
    Stone #6E6A62  warm gray secondary text
*/

const INK = '#1C3553';
const SKY = '#3E6BA8';
const PAPER = '#F6F3EC';
const SAND = '#EFE9DD';
const SAGE = '#6B8F71';
const STONE = '#6E6A62';
const LINE = '#E3DCCE';

const serif = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// ── Fade-in on scroll ──────────────────────────────────────────────
const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};
const FadeIn = ({ children, delay = 0 }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// DATA — three pillars. Everything else folds in as an example sub-item.
// ═══════════════════════════════════════════════════════════════════

const PILLARS = [
  {
    icon: CreditCard,
    label: 'Home Bill Pay+',
    desc: 'Your whole recurring money-out picture in one place — utilities, mortgage, property taxes, insurance premiums, and subscriptions. The plus means it\u2019ll catch your non-home bills too, if you want.',
    status: 'Available now',
  },
  {
    icon: Wrench,
    label: 'Maintenance',
    desc: 'Keep your home healthy without keeping it all in your head — recurring upkeep, seasonal tasks, the vendors you trust, and what\u2019s still under warranty when something breaks.',
    status: 'Available now',
  },
  {
    icon: FileText,
    label: 'Documents',
    desc: 'Every important paper in one findable place — deeds, closing papers, insurance policies, warranties, and receipts. The moment you need it, it\u2019s there.',
    status: 'Coming soon',
  },
];

const STATUS_STYLE = {
  'Available now':   { color: SAGE, bg: '#EEF2EC' },
  'Coming soon':     { color: SKY,  bg: '#E9F0F8' },
  'On the roadmap':  { color: STONE, bg: SAND },
};

const STEPS = [
  { n: '1', title: 'Add your home', desc: 'Enter your address and a few details. That\u2019s the whole setup.' },
  { n: '2', title: 'Bring things in', desc: 'Forward a bill, drop in a document, log a maintenance task. Add only what you need, when you need it.' },
  { n: '3', title: 'Stay on top of it', desc: 'Reminders surface, records stay organized, and your home runs in one calm place — no spreadsheets, no second job.' },
];

// ═══════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════

const HeroSection = () => (
  <section style={{ background: INK, padding: '92px 24px 88px', position: 'relative', overflow: 'hidden' }}>
    {/* soft warm glow instead of the old hard blue orbs */}
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', width: '620px', height: '620px', borderRadius: '50%', background: 'rgba(62,107,168,0.22)', filter: 'blur(20px)', top: '-220px', right: '-140px' }} />
      <div style={{ position: 'absolute', width: '420px', height: '420px', borderRadius: '50%', background: 'rgba(107,143,113,0.14)', filter: 'blur(20px)', bottom: '-180px', left: '-120px' }} />
    </div>
    <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: sans, fontSize: '13px', fontWeight: 600, color: '#BBD0EC', background: 'rgba(62,107,168,0.22)', border: '1px solid rgba(62,107,168,0.4)', borderRadius: '999px', padding: '6px 16px', marginBottom: '24px' }}>
        The calm way to run your home
      </span>
      <h1 style={{ fontFamily: serif, fontSize: 'clamp(2.5rem, 5.6vw, 4rem)', fontWeight: 600, color: '#fff', lineHeight: 1.08, letterSpacing: '-0.015em', marginBottom: '22px' }}>
        Everything your home needs,<br />in one calm place.
      </h1>
      <p style={{ fontFamily: sans, fontSize: '19px', lineHeight: 1.65, color: 'rgba(255,255,255,0.74)', maxWidth: '560px', margin: '0 auto 38px' }}>
        Your bills, your upkeep, and your documents — organized in one calm place, and finally easy to stay on top of.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
        <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '15px 30px', borderRadius: '11px', background: '#fff', color: INK, fontSize: '15px', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          Start free <ArrowRight style={{ width: '16px', height: '16px' }} />
        </Link>
        <Link to="/product" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '15px 30px', borderRadius: '11px', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.28)', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
          See what it does
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '22px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {['Free to start', 'No card needed', 'Ready in 5 minutes'].map(item => (
          <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: sans, fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
            <CheckCircle2 style={{ width: '14px', height: '14px', color: '#9CC5A2' }} /> {item}
          </span>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// PILLARS — three, equal weight; everything else folds inside them
// ═══════════════════════════════════════════════════════════════════

const PillarsSection = () => (
  <section style={{ background: PAPER, padding: '90px 24px' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>What CasaCEO does</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.85rem, 4vw, 2.6rem)', fontWeight: 600, color: INK, letterSpacing: '-0.015em', marginBottom: '16px' }}>
            Three ways to keep your home in order.
          </h2>
          <p style={{ fontFamily: sans, fontSize: '17px', color: STONE, maxWidth: '540px', margin: '0 auto', lineHeight: 1.6 }}>
            Use one, use all three. CasaCEO stays simple and grows with you — nothing you don\u2019t need gets in the way.
          </p>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {PILLARS.map((m, i) => {
          const Icon = m.icon;
          const s = STATUS_STYLE[m.status];
          return (
            <FadeIn key={i} delay={i * 90}>
              <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: '16px', padding: '30px', height: '100%', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 14px 34px -18px rgba(28,53,83,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '13px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: '24px', height: '24px', color: INK }} />
                  </div>
                  <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 700, color: s.color, background: s.bg, borderRadius: '999px', padding: '4px 11px', letterSpacing: '0.02em' }}>
                    {m.status}
                  </span>
                </div>
                <h3 style={{ fontFamily: serif, fontSize: '22px', fontWeight: 600, color: INK, marginBottom: '10px', letterSpacing: '-0.01em' }}>{m.label}</h3>
                <p style={{ fontFamily: sans, fontSize: '14.5px', lineHeight: 1.65, color: STONE }}>{m.desc}</p>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// HOW IT WORKS — real 3-step sequence
// ═══════════════════════════════════════════════════════════════════

const HowItWorksSection = () => (
  <section style={{ background: PAPER, padding: '90px 24px', borderTop: `1px solid ${LINE}` }}>
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '54px' }}>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>How it works</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.85rem, 4vw, 2.6rem)', fontWeight: 600, color: INK, letterSpacing: '-0.015em' }}>
            Set up in minutes. Calm from day one.
          </h2>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {STEPS.map((s, i) => (
          <FadeIn key={i} delay={i * 110}>
            <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: '16px', padding: '30px 26px', height: '100%' }}>
              <div style={{ fontFamily: serif, fontSize: '30px', fontWeight: 600, color: SKY, lineHeight: 1, marginBottom: '16px' }}>{s.n}</div>
              <h3 style={{ fontFamily: sans, fontSize: '17px', fontWeight: 700, color: INK, marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ fontFamily: sans, fontSize: '14px', lineHeight: 1.65, color: STONE }}>{s.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// WHO IT'S FOR — three, equal weight
// ═══════════════════════════════════════════════════════════════════

const PERSONAS = [
  { tag: 'Caretakers', desc: "Managing a parent\u2019s home from afar? Keep their bills, repairs, and records in one place you can check anytime.", accent: SAGE },
  { tag: 'Homeowners', desc: 'Everything about your home, organized — so you spend less time hunting for paperwork and more time living in it.', accent: SKY },
  { tag: 'Multiple homes', desc: 'A vacation place or a rental? Switch between homes in a tap; each one keeps its own tidy set of records.', accent: INK },
];

const PersonasSection = () => (
  <section style={{ background: '#fff', padding: '88px 24px', borderTop: `1px solid ${LINE}` }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>Who it\u2019s for</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.85rem, 4vw, 2.6rem)', fontWeight: 600, color: INK, letterSpacing: '-0.015em' }}>
            One calm place. However you live.
          </h2>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {PERSONAS.map((p, i) => (
          <FadeIn key={i} delay={i * 90}>
            <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: '16px', padding: '28px', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: p.accent }} />
              <h3 style={{ fontFamily: serif, fontSize: '20px', fontWeight: 600, color: INK, marginBottom: '12px', letterSpacing: '-0.01em' }}>{p.tag}</h3>
              <p style={{ fontFamily: sans, fontSize: '14.5px', lineHeight: 1.65, color: STONE }}>{p.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// REASSURANCE STRIP
// ═══════════════════════════════════════════════════════════════════

const ReassureSection = () => (
  <section style={{ background: '#fff', padding: '60px 24px', borderTop: `1px solid ${LINE}` }}>
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '28px', justifyContent: 'center' }}>
      {[
        { icon: Bell, label: 'Gentle reminders', sub: 'Before a due date, never after.' },
        { icon: ShieldCheck, label: 'Private by default', sub: 'Your home\u2019s records are yours alone.' },
        { icon: Heart, label: 'Simple on purpose', sub: 'No clutter, no jargon, no second job.' },
      ].map((r, i) => {
        const Icon = r.icon;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: '19px', height: '19px', color: SAGE }} />
            </div>
            <div>
              <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 700, color: INK }}>{r.label}</p>
              <p style={{ fontFamily: sans, fontSize: '13px', color: STONE }}>{r.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// TESTIMONIAL — one, given room (replace with a real quote before launch)
// ═══════════════════════════════════════════════════════════════════

const TestimonialSection = () => (
  <section style={{ background: PAPER, padding: '86px 24px', borderTop: `1px solid ${LINE}` }}>
    <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
      <FadeIn>
        <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginBottom: '22px' }}>
          {Array(5).fill(0).map((_, j) => <Star key={j} style={{ width: '16px', height: '16px', color: '#D9A45B', fill: '#D9A45B' }} />)}
        </div>
        <p style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 500, color: INK, lineHeight: 1.45, letterSpacing: '-0.01em', marginBottom: '24px' }}>
          &ldquo;I finally feel like I understand what I own. CasaCEO gave me a system for my house I never knew I needed.&rdquo;
        </p>
        <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 700, color: INK }}>Jennifer M.</p>
        <p style={{ fontFamily: sans, fontSize: '13px', color: STONE }}>Homeowner · Atlanta, GA</p>
      </FadeIn>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// CLOSING CTA
// ═══════════════════════════════════════════════════════════════════

const CTASection = () => (
  <section style={{ background: INK, padding: '94px 24px' }}>
    <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <FadeIn>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', fontWeight: 600, color: '#fff', letterSpacing: '-0.015em', marginBottom: '16px', lineHeight: 1.15 }}>
          Managing a home shouldn&rsquo;t feel like a second job.
        </h2>
        <p style={{ fontFamily: sans, fontSize: '17px', color: 'rgba(255,255,255,0.72)', marginBottom: '34px', lineHeight: 1.6 }}>
          Bring your bills, documents, maintenance, and records into one friendly place — without the clutter of traditional home apps.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '15px 32px', borderRadius: '11px', background: '#fff', color: INK, fontSize: '15px', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            Start free <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '15px 32px', borderRadius: '11px', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            Talk to us
          </Link>
        </div>
        <p style={{ fontFamily: sans, fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '26px' }}>
          Free to start · No card needed · Ready in 5 minutes
        </p>
      </FadeIn>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════

const MarketingHomePage = () => (
  <SiteLayout seo={{ title: 'CasaCEO — Everything your home needs, in one calm place' }} fullWidth>
    <HeroSection />
    <PillarsSection />
    <PersonasSection />
    <HowItWorksSection />
    <ReassureSection />
    <TestimonialSection />
    <CTASection />
  </SiteLayout>
);

export default MarketingHomePage;
