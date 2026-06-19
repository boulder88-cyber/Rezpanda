import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import {
  ArrowRight, CheckCircle2, Mail, Inbox, Heart, Home, Building2,
  Bell, CalendarClock, ShieldCheck, Sparkles, Star
} from 'lucide-react';

/*
  CasaCEO — Marketing Home (full reframe)
  --------------------------------------------------------------------------
  Thesis: the calm of an organized inbox. Sells relief from
  "where is that bill / did it get paid / did Mom's water bill get handled."
  Not a finance dashboard. Not an asset-management pitch.

  Design tokens (inline so the file is self-contained):
    Paper  #F7F4EF  warm off-white background
    Ink    #1B2A41  deep navy — text + brand anchor
    Sage   #6B8F71  "handled / calm" accent (the through-line)
    Amber  #D9A45B  "needs attention" — used sparingly
    Stone  #8A857D  secondary text
    Line   #E7E1D6  hairlines / borders

  Type: humanist serif display (Iowan/Palatino/Georgia stack) + clean sans body.
  Signature: a self-sorting inbox in the hero — bills land and settle into
  calm, labeled, dated rows. That's the one memorable element; everything
  else stays quiet.
*/

const INK = '#1B2A41';
const PAPER = '#F7F4EF';
const SAGE = '#6B8F71';
const AMBER = '#D9A45B';
const STONE = '#8A857D';
const LINE = '#E7E1D6';

const serif = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// ── Fade-in on scroll ──────────────────────────────────────────────
const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};
const FadeIn = ({ children, delay = 0 }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SIGNATURE: the self-sorting inbox
// ═══════════════════════════════════════════════════════════════════

const INBOX_ROWS = [
  { name: 'Georgia Power', cat: 'Electric', note: 'Due in 6 days', state: 'upcoming' },
  { name: "Mom's Water — Savannah", cat: 'Utilities', note: 'Handled', state: 'done' },
  { name: 'State Farm', cat: 'Insurance', note: 'Due in 12 days', state: 'upcoming' },
  { name: 'Comcast', cat: 'Internet', note: 'Autopay · drafts Jun 24', state: 'auto' },
  { name: 'Dr. Reyes — Pediatrics', cat: 'Medical', note: 'Handled', state: 'done' },
];

const stateColor = (s) => s === 'done' ? SAGE : s === 'auto' ? '#7C7FB5' : AMBER;
const stateLabel = (s) => s === 'done' ? 'Handled' : s === 'auto' ? 'Autopay' : 'Upcoming';

const SortingInbox = () => {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setSettled(true); return; }
    const t = setTimeout(() => setSettled(true), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '18px', border: `1px solid ${LINE}`, boxShadow: '0 24px 60px -28px rgba(27,42,65,0.35)', padding: '22px', maxWidth: '440px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '14px', borderBottom: `1px solid ${LINE}`, marginBottom: '12px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#EEF2EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Inbox style={{ width: '17px', height: '17px', color: SAGE }} />
        </div>
        <div>
          <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 700, color: INK, lineHeight: 1.2 }}>Your bills</p>
          <p style={{ fontFamily: sans, fontSize: '11px', color: STONE }}>Sorted automatically</p>
        </div>
        <span style={{ marginLeft: 'auto', fontFamily: sans, fontSize: '11px', fontWeight: 600, color: SAGE, background: '#EEF2EC', borderRadius: '999px', padding: '4px 10px' }}>
          All caught up
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {INBOX_ROWS.map((r, i) => (
          <div key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: PAPER, border: `1px solid ${LINE}`, borderRadius: '11px',
              padding: '11px 13px',
              opacity: settled ? 1 : 0,
              transform: settled ? 'none' : `translateY(-10px) translateX(${i % 2 ? 8 : -8}px)`,
              transition: `opacity 0.5s ease ${i * 110}ms, transform 0.5s ease ${i * 110}ms`,
            }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stateColor(r.state), flexShrink: 0 }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 600, color: INK, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</p>
              <p style={{ fontFamily: sans, fontSize: '11px', color: STONE }}>{r.cat}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontFamily: sans, fontSize: '11px', fontWeight: 700, color: stateColor(r.state), lineHeight: 1.2 }}>{stateLabel(r.state)}</p>
              <p style={{ fontFamily: sans, fontSize: '11px', color: STONE }}>{r.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: `1px solid ${LINE}` }}>
        <Mail style={{ width: '14px', height: '14px', color: STONE, flexShrink: 0 }} />
        <p style={{ fontFamily: sans, fontSize: '11.5px', color: STONE }}>
          Forward any bill to <span style={{ color: INK, fontWeight: 600 }}>your CasaCEO address</span> — we sort it.
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════

const HeroSection = () => (
  <section style={{ background: PAPER, padding: '88px 24px 80px', position: 'relative', overflow: 'hidden' }}>
    <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px)`, backgroundSize: '100% 44px', opacity: 0.4, pointerEvents: 'none', maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)' }} />
    <div style={{ maxWidth: '1120px', margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,440px)', gap: '56px', alignItems: 'center' }} className="ceo-hero-grid">
      <div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: sans, fontSize: '12.5px', fontWeight: 600, color: SAGE, background: '#EEF2EC', border: `1px solid #DCE6D9`, borderRadius: '999px', padding: '6px 14px', marginBottom: '22px' }}>
          <Sparkles style={{ width: '14px', height: '14px' }} /> Home &amp; life admin, made calm
        </span>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(2.4rem, 5.2vw, 3.9rem)', fontWeight: 600, color: INK, lineHeight: 1.08, letterSpacing: '-0.015em', marginBottom: '20px' }}>
          Every bill, in one calm place.
        </h1>
        <p style={{ fontFamily: sans, fontSize: '18px', lineHeight: 1.65, color: STONE, maxWidth: '460px', marginBottom: '32px' }}>
          Forward a bill — or snap a photo — and CasaCEO sorts it by provider, category, and due date. Your home bills first, plus anything else worth keeping in one place. No setup, no spreadsheets, no second job.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '14px 28px', borderRadius: '11px', background: INK, color: '#fff', fontSize: '15px', fontWeight: 600, textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px -10px rgba(27,42,65,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
            Start free <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
          <Link to="/product" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '14px 28px', borderRadius: '11px', background: 'transparent', color: INK, fontSize: '15px', fontWeight: 600, textDecoration: 'none', border: `1px solid ${INK}33`, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFFFFF'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            See how it works
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {['Free to start', 'No card needed', 'Ready in 5 minutes'].map(item => (
            <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: sans, fontSize: '13px', color: STONE }}>
              <CheckCircle2 style={{ width: '14px', height: '14px', color: SAGE }} /> {item}
            </span>
          ))}
        </div>
      </div>
      <FadeIn delay={120}>
        <SortingInbox />
      </FadeIn>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// THREE VALUE TILES (Copilot's mission lines, home-first tuned)
// ═══════════════════════════════════════════════════════════════════

const VALUE = [
  { icon: Inbox, title: 'One place for every bill', desc: "Your home's bills first — plus anything else worth keeping together: utilities, insurance, medical, subscriptions." },
  { icon: CalendarClock, title: 'A clear, calm monthly view', desc: "See what's coming, what needs attention, and what's already handled — at a glance." },
  { icon: Heart, title: 'Built for families & caretakers', desc: "Perfect for managing a parent's home from afar, or keeping more than one home in order." },
];

const ValueSection = () => (
  <section style={{ background: '#FFFFFF', padding: '84px 24px', borderTop: `1px solid ${LINE}` }}>
    <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {VALUE.map((v, i) => {
          const Icon = v.icon;
          return (
            <FadeIn key={i} delay={i * 90}>
              <div style={{ padding: '6px 4px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#EEF2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                  <Icon style={{ width: '22px', height: '22px', color: SAGE }} />
                </div>
                <h3 style={{ fontFamily: serif, fontSize: '21px', fontWeight: 600, color: INK, marginBottom: '10px', letterSpacing: '-0.01em' }}>{v.title}</h3>
                <p style={{ fontFamily: sans, fontSize: '15px', lineHeight: 1.65, color: STONE }}>{v.desc}</p>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// HOW IT WORKS — a real 3-step sequence, so numbering earns its place
// ═══════════════════════════════════════════════════════════════════

const STEPS = [
  { n: '1', title: 'Send it in', desc: 'Forward a bill email, snap a photo, or upload a PDF. Or have providers mail to your CasaCEO forwarding address.' },
  { n: '2', title: 'CasaCEO sorts it', desc: 'We read the provider, amount, and due date, then file it by category — automatically, with nothing to set up.' },
  { n: '3', title: 'You stay ahead', desc: "A calm monthly view shows what's coming, what needs attention, and what's already handled. Nothing slips." },
];

const HowItWorksSection = () => (
  <section style={{ background: PAPER, padding: '88px 24px', borderTop: `1px solid ${LINE}` }}>
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '54px' }}>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SAGE, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>How it works</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 600, color: INK, letterSpacing: '-0.015em' }}>
            Three steps to a quieter inbox.
          </h2>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {STEPS.map((s, i) => (
          <FadeIn key={i} delay={i * 110}>
            <div style={{ background: '#FFFFFF', border: `1px solid ${LINE}`, borderRadius: '16px', padding: '28px 24px', height: '100%' }}>
              <div style={{ fontFamily: serif, fontSize: '30px', fontWeight: 600, color: SAGE, lineHeight: 1, marginBottom: '16px' }}>{s.n}</div>
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
// PERSONAS — three, equal weight
// ═══════════════════════════════════════════════════════════════════

const PERSONAS = [
  { icon: Heart, tag: 'The caretaker', title: "Managing Mom's home from afar", desc: "Forward her bills to one place, see what's due, and know the water bill in Savannah got handled — without a four-hour drive.", accent: SAGE },
  { icon: Home, tag: 'The homeowner', title: 'Clarity without the clutter', desc: 'Every bill, document, and due date in one calm place. No spreadsheets, no sticky notes, no wondering if you forgot something.', accent: INK },
  { icon: Building2, tag: 'The power user', title: 'A vacation home or a rental, kept in order', desc: 'Switch between homes in a tap. Bills stay grouped by property, so each place has its own tidy stack — nothing bleeds together.', accent: AMBER },
];

const PersonasSection = () => (
  <section style={{ background: '#FFFFFF', padding: '88px 24px', borderTop: `1px solid ${LINE}` }}>
    <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '54px' }}>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SAGE, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>Who it's for</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 600, color: INK, letterSpacing: '-0.015em', marginBottom: '14px' }}>
            One calm place. However you live.
          </h2>
          <p style={{ fontFamily: sans, fontSize: '17px', color: STONE, maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
            CasaCEO stays simple for one home and quietly grows with you when life gets more complicated.
          </p>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '22px' }}>
        {PERSONAS.map((p, i) => {
          const Icon = p.icon;
          return (
            <FadeIn key={i} delay={i * 90}>
              <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: '18px', padding: '30px', height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: p.accent }} />
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFFFFF', border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Icon style={{ width: '22px', height: '22px', color: p.accent }} />
                </div>
                <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: p.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>{p.tag}</p>
                <h3 style={{ fontFamily: serif, fontSize: '20px', fontWeight: 600, color: INK, marginBottom: '12px', lineHeight: 1.25, letterSpacing: '-0.01em' }}>{p.title}</h3>
                <p style={{ fontFamily: sans, fontSize: '14.5px', lineHeight: 1.65, color: STONE }}>{p.desc}</p>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// REASSURANCE STRIP
// ═══════════════════════════════════════════════════════════════════

const ReassureSection = () => (
  <section style={{ background: PAPER, padding: '64px 24px', borderTop: `1px solid ${LINE}` }}>
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '28px', justifyContent: 'center' }}>
      {[
        { icon: Bell, label: 'Gentle reminders', sub: 'Before a due date, never after.' },
        { icon: ShieldCheck, label: 'Private by default', sub: 'Your bills are yours alone.' },
        { icon: CalendarClock, label: 'Autopay-aware', sub: 'We flag what drafts on its own.' },
      ].map((r, i) => {
        const Icon = r.icon;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: '#FFFFFF', border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
// TESTIMONIAL — one, given room
// ═══════════════════════════════════════════════════════════════════

const TestimonialSection = () => (
  <section style={{ background: '#FFFFFF', padding: '88px 24px', borderTop: `1px solid ${LINE}` }}>
    <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
      <FadeIn>
        <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginBottom: '22px' }}>
          {Array(5).fill(0).map((_, j) => <Star key={j} style={{ width: '16px', height: '16px', color: AMBER, fill: AMBER }} />)}
        </div>
        <p style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 500, color: INK, lineHeight: 1.45, letterSpacing: '-0.01em', marginBottom: '24px' }}>
          &ldquo;I handle my mom&rsquo;s house three states away. For the first time, I open one screen and know everything&rsquo;s paid. That&rsquo;s worth more than I can say.&rdquo;
        </p>
        <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 700, color: INK }}>Jennifer M.</p>
        <p style={{ fontFamily: sans, fontSize: '13px', color: STONE }}>Caretaker · Atlanta, GA</p>
      </FadeIn>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// CLOSING CTA
// ═══════════════════════════════════════════════════════════════════

const CTASection = () => (
  <section style={{ background: INK, padding: '92px 24px' }}>
    <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <FadeIn>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', fontWeight: 600, color: '#fff', letterSpacing: '-0.015em', marginBottom: '16px', lineHeight: 1.15 }}>
          Managing a home shouldn&rsquo;t feel like a second job.
        </h2>
        <p style={{ fontFamily: sans, fontSize: '17px', color: 'rgba(255,255,255,0.72)', marginBottom: '34px', lineHeight: 1.6 }}>
          Bring your bills, providers, reminders, and records into one friendly place — without the clutter of traditional home apps.
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
  <SiteLayout seo={{ title: 'CasaCEO — Every bill, in one calm place' }} fullWidth>
    <style>{`
      @media (max-width: 860px) {
        .ceo-hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
      }
    `}</style>
    <HeroSection />
    <ValueSection />
    <HowItWorksSection />
    <PersonasSection />
    <ReassureSection />
    <TestimonialSection />
    <CTASection />
  </SiteLayout>
);

export default MarketingHomePage;
