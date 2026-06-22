import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import {
  CreditCard, Wrench, FileText, ArrowRight, CheckCircle2,
  Bell, ShieldCheck, Heart, Plus
} from 'lucide-react';

/*
  CasaCEO — Product page (/product)
  --------------------------------------------------------------------------
  The deeper dive behind the home page's "See what it does." Same three
  pillars, same warm tokens — but each pillar now leads with a real
  before/after: the scattered, costly way a home gets managed now, vs. the
  same moment with CasaCEO. Tone: warm but honest about the cost — name the
  late fee and the lost warranty, then land in relief, not anxiety.

  Everything that isn't a pillar (insurance, warranty, taxes, personal
  bills…) folds in under one of the three. The "+" keeps ONE quiet moment
  under Bills — never a headline. Tokens mirror MarketingHomePage exactly.
*/

const INK = '#1C3553';
const SKY = '#3E6BA8';
const GOLD = '#c9a96e';
const PAPER = '#F6F3EC';
const SAND = '#EFE9DD';
const SAGE = '#6B8F71';
const STONE = '#6E6A62';
const LINE = '#E3DCCE';
const CLAY = '#B07A5B'; // warm muted terracotta for the "now" side — never alarm-red

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

const STATUS_STYLE = {
  'Available now': { color: SAGE, bg: '#EEF2EC' },
  'Coming soon': { color: SKY, bg: '#E9F0F8' },
};

// ═══════════════════════════════════════════════════════════════════
// DATA — three pillars: lived before/after, then what's inside
// ═══════════════════════════════════════════════════════════════════

const PILLARS = [
  {
    id: 'bills',
    icon: CreditCard,
    label: 'Bill Pay',
    status: 'Available now',
    lede: 'The bills that run your home, gathered in one calm place — read, sorted, and lined up by due date before any of them can sneak past you.',
    now: {
      head: 'The way it goes now',
      body: 'Bills arrive in five inboxes and a pile by the door. You mean to deal with the water bill, then it\u2019s three weeks later and there\u2019s a $39 late fee for something you absolutely had the money to pay. You\u2019re not disorganized — there\u2019s just no one place that holds it all, so the mental tab is always open.',
    },
    withCasa: {
      head: 'With CasaCEO',
      body: 'You forward a bill once and it files itself — payee, amount, and due date read for you. Everything lines up in one view: what\u2019s due this week, what\u2019s coming, what\u2019s already handled. The late fee stops happening because nothing is hiding anymore. You still pay it yourself, your way — you just stop being surprised.',
    },
    inside: [
      'Forward a bill by email and it files itself — provider, amount, and due date read automatically',
      'Utilities, mortgage, property taxes, and insurance premiums all grouped together',
      'See what is due this week and what is coming over the next month',
      'A quick review step lets you check anything the system was unsure about before it counts',
    ],
    note: 'CasaCEO never touches your bank or holds a card. It keeps track and reminds you — you stay in control of every payment.',
  },
  {
    id: 'maintenance',
    icon: Wrench,
    label: 'Maintenance',
    status: 'Available now',
    lede: 'The quiet upkeep that keeps a home healthy, remembered for you — so the small things stay small instead of becoming the expensive thing.',
    now: {
      head: 'The way it goes now',
      body: 'Nobody schedules the furnace filter. You remember it in February when the air feels off, or never, until a service call turns a $15 filter into a $400 repair. The gutters, the water heater flush, the HVAC check — they live in your head, which means they live nowhere, until something forces the issue.',
    },
    withCasa: {
      head: 'With CasaCEO',
      body: 'You set a task once and it comes back on its own, at the right time of year. A gentle nudge before the season turns, not a crisis after. The home keeps a record of what was done and when — so \u201cwait, did we ever flush the water heater?\u201d has an answer instead of a shrug.',
    },
    inside: [
      'Set a task once and let it come back on its own — filters, gutters, seasonal checks',
      'See what is overdue and what is due soon at a glance, per property',
      'Log a service visit so you have a record of when it was last done',
      'A calm "all caught up" when there is genuinely nothing to do',
    ],
    note: 'Built to nudge gently before something becomes a problem — not to bury you in a chore list.',
  },
  {
    id: 'documents',
    icon: FileText,
    label: 'Documents',
    status: 'Coming soon',
    lede: 'The papers a household actually relies on, kept findable — there the moment you need them, not the day after.',
    now: {
      head: 'The way it goes now',
      body: 'The dishwasher dies and the warranty is in a drawer, or an email, or gone. You spend an evening you didn\u2019t have digging for the closing papers, the policy number, the receipt that would\u2019ve covered it. The documents that protect you only matter at the worst moment — and that\u2019s exactly when they\u2019re impossible to find.',
    },
    withCasa: {
      head: 'With CasaCEO',
      body: 'Deeds, policies, warranties, receipts — kept in one place, organized by what they are. When the dishwasher dies you pull up the warranty in seconds, not an evening. The papers are quietly ready before you need them, which is the only time being ready actually counts.',
    },
    inside: [
      'Deeds, closing papers, and title documents kept together',
      'Insurance policies, warranties, and receipts, easy to pull up',
      'Organized by what it is, not by which folder you happened to drop it in',
      'There when you sell, file a claim, or just need to check a detail',
    ],
    note: 'Not a filing cabinet to fill — just a tidy home for the papers a household actually relies on.',
  },
];

// ═══════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════

const HeroSection = () => (
  <section style={{ background: INK, padding: '88px 24px 80px', position: 'relative', overflow: 'hidden' }}>
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(62,107,168,0.22)', filter: 'blur(20px)', top: '-220px', right: '-140px' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(107,143,113,0.14)', filter: 'blur(20px)', bottom: '-180px', left: '-120px' }} />
    </div>
    <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: '#BBD0EC', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' }}>What <Wordmark /> does</p>
      <h1 style={{ fontFamily: serif, fontSize: 'clamp(2.3rem, 5vw, 3.4rem)', fontWeight: 600, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.015em', marginBottom: '20px' }}>
        The home runs you. It should be the other way around.
      </h1>
      <p style={{ fontFamily: sans, fontSize: '18px', lineHeight: 1.65, color: 'rgba(255,255,255,0.74)', maxWidth: '580px', margin: '0 auto' }}>
        Three small things, handled — your bills, your upkeep, your documents. Here\u2019s what changes when each one stops living in your head.
      </p>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// PILLAR SECTIONS — before/after, then what's inside
// ═══════════════════════════════════════════════════════════════════

const PillarSection = ({ pillar, index }) => {
  const Icon = pillar.icon;
  const s = STATUS_STYLE[pillar.status];
  const onPaper = index % 2 === 0;
  const cardBg = onPaper ? '#fff' : PAPER;
  return (
    <section id={pillar.id} style={{ background: onPaper ? PAPER : '#fff', padding: '78px 24px', borderTop: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Heading */}
        <FadeIn>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: '26px', height: '26px', color: INK }} />
            </div>
            <div>
              <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 700, color: s.color, background: s.bg, borderRadius: '999px', padding: '4px 11px', letterSpacing: '0.02em' }}>
                {pillar.status}
              </span>
              <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 600, color: INK, letterSpacing: '-0.015em', marginTop: '8px' }}>{pillar.label}</h2>
            </div>
          </div>
          <p style={{ fontFamily: sans, fontSize: '17.5px', lineHeight: 1.65, color: STONE, marginBottom: '30px', maxWidth: '660px' }}>{pillar.lede}</p>
        </FadeIn>

        {/* Before / after */}
        <FadeIn delay={60}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '30px' }}>
            {/* Now */}
            <div style={{ background: cardBg, border: `1px solid ${LINE}`, borderRadius: '16px', padding: '24px', borderLeft: `4px solid ${CLAY}` }}>
              <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: CLAY, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '12px' }}>{pillar.now.head}</p>
              <p style={{ fontFamily: sans, fontSize: '15px', lineHeight: 1.7, color: INK }}>{pillar.now.body}</p>
            </div>
            {/* With CasaCEO */}
            <div style={{ background: cardBg, border: `1px solid ${LINE}`, borderRadius: '16px', padding: '24px', borderLeft: `4px solid ${SAGE}` }}>
              <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SAGE, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '12px' }}>{pillar.withCasa.head}</p>
              <p style={{ fontFamily: sans, fontSize: '15px', lineHeight: 1.7, color: INK }}>{pillar.withCasa.body}</p>
            </div>
          </div>
        </FadeIn>

        {/* What's inside */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {pillar.inside.map((pt, i) => (
            <FadeIn key={i} delay={i * 70}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', background: cardBg, border: `1px solid ${LINE}`, borderRadius: '13px', padding: '16px 18px', height: '100%' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: SAGE, flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontFamily: sans, fontSize: '14.5px', lineHeight: 1.55, color: INK }}>{pt}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn>
          <p style={{ fontFamily: sans, fontSize: '14px', lineHeight: 1.6, color: STONE, fontStyle: 'italic', maxWidth: '640px' }}>{pillar.note}</p>
        </FadeIn>

        {/* Quiet "+" moment — only under Bills */}
        {pillar.id === 'bills' && (
          <FadeIn delay={120}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '13px', background: cardBg, border: `1px dashed ${LINE}`, borderRadius: '14px', padding: '18px 20px', marginTop: '24px', maxWidth: '640px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus style={{ width: '17px', height: '17px', color: SKY }} />
              </div>
              <div>
                <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 700, color: INK, marginBottom: '3px' }}>And if you want, the rest too</p>
                <p style={{ fontFamily: sans, fontSize: '13.5px', lineHeight: 1.6, color: STONE }}>
                  The same place can quietly hold your subscriptions and personal bills — so your whole recurring picture lives together, not just the home ones. Entirely optional, there when you reach for it.
                </p>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════
// REASSURANCE STRIP
// ═══════════════════════════════════════════════════════════════════

const ReassureSection = () => (
  <section style={{ background: '#fff', padding: '70px 24px', borderTop: `1px solid ${LINE}` }}>
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <FadeIn>
        <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '36px' }}>What stays true across all three</p>
      </FadeIn>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', justifyContent: 'center' }}>
        {[
          { icon: Bell, label: 'Gentle reminders', sub: 'Before a due date, never after.' },
          { icon: ShieldCheck, label: 'Private by default', sub: "Your home's records are yours alone." },
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
          Close the open tab in your head.
        </h2>
        <p style={{ fontFamily: sans, fontSize: '17px', color: 'rgba(255,255,255,0.72)', marginBottom: '34px', lineHeight: 1.6 }}>
          Start with one — the bill that keeps slipping, or the upkeep you keep forgetting. Add the rest when you&rsquo;re ready.
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
      </FadeIn>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════

const ProductPage = () => (
  <SiteLayout seo={{ title: 'What CasaCEO does — bills, maintenance, and documents in one calm place' }} fullWidth>
    <HeroSection />
    {PILLARS.map((p, i) => <PillarSection key={p.id} pillar={p} index={i} />)}
    <ReassureSection />
    <CTASection />
  </SiteLayout>
);

export default ProductPage;
