import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import { ArrowRight, Feather, ShieldCheck, Heart, Home, KeyRound } from 'lucide-react';

/*
  CasaCEO — About (/about)
  --------------------------------------------------------------------------
  Reframed from the old HomeOS about page. Removed: the fabricated company
  timeline ("36% of US real estate market", CompassHomeOS brokerage
  partnerships) and the founder bio block with specific employment/market
  claims, plus the old coral/blue palette and the dead /homeos CTA.

  Kept: a real mission and a set of values, rewritten to match the locked
  positioning — calm, home-positioned, "a place that's mine." Tokens mirror
  the rest of the marketing site. Add a real founder/story section later if
  wanted.
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

const Wordmark = () => (
  <span style={{ textTransform: 'none', whiteSpace: 'nowrap' }}>Casa<span style={{ color: GOLD }}>CEO</span></span>
);

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
const FadeIn = ({ children, delay = 0 }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
};

const VALUES = [
  { icon: Feather, label: 'Simple on purpose', desc: 'Running a home is already complicated enough. Every feature has to earn its place — or it doesn’t ship.' },
  { icon: ShieldCheck, label: 'Yours, and private', desc: 'No bank access, no ads, no selling your data. What we hold, we hold lightly — and you can take it or delete it anytime.' },
  { icon: Heart, label: 'Calm over clever', desc: 'The goal isn’t a dashboard to admire. It’s the quiet feeling that the thing is handled.' },
  { icon: Home, label: 'A place that’s yours', desc: 'CasaCEO is for the person running their own home — not a portal someone else manages on your behalf.' },
];

const AboutPage = () => (
  <SiteLayout seo={{ title: 'About — CasaCEO' }} fullWidth>
    {/* Hero */}
    <section style={{ background: INK, padding: '88px 24px 76px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(62,107,168,0.22)', filter: 'blur(20px)', top: '-220px', right: '-140px' }} />
        <div style={{ position: 'absolute', width: '380px', height: '380px', borderRadius: '50%', background: 'rgba(107,143,113,0.14)', filter: 'blur(20px)', bottom: '-160px', left: '-110px' }} />
      </div>
      <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: '#BBD0EC', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' }}>About</p>
        <p style={{ fontFamily: sans, fontSize: '18px', color: 'rgba(255,255,255,0.74)', lineHeight: 1.65, maxWidth: '540px', margin: '0 auto' }}>
          <Wordmark /> exists to make running a home calm — to take the bills, the upkeep, and the paperwork off your mental tab and put them somewhere quiet and findable.
        </p>
      </div>
    </section>

    {/* Why it exists */}
    <section style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <FadeIn>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>Why we built it</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 600, color: INK, lineHeight: 1.2, letterSpacing: '-0.015em', marginBottom: '22px' }}>
            A home is a lot to keep track of. There was no calm place to do it.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'The bills live in five inboxes. The warranty is in a drawer. The maintenance lives in your head.',
              'Most tools that promise to fix this pile on features until they become another thing to manage — a household OS you need a manual for.',
              'CasaCEO is the opposite bet: a small, calm product that does a few things well, stays out of your way, and never asks for your bank login.',
              'A place that’s yours, where the home finally feels handled.',
            ].map((line, i) => (
              <p key={i} style={{ fontFamily: sans, fontSize: '16px', color: STONE, lineHeight: 1.75 }}>{line}</p>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>

    {/* Mission */}
    <section style={{ padding: '76px 24px', background: INK, textAlign: 'center' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <FadeIn>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: '#BBD0EC', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' }}>Our mission</p>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 600, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.015em', marginBottom: '18px' }}>
            To turn running a home from a source of stress into a place of calm.
          </h2>
          <p style={{ fontFamily: sans, fontSize: '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>
            Not by doing more, but by doing less — clearly, kindly, and only the parts that actually help.
          </p>
        </FadeIn>
      </div>
    </section>

    {/* Values */}
    <section style={{ padding: '80px 24px', background: PAPER }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '46px' }}>
            <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>What we stand for</p>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)', fontWeight: 600, color: INK, letterSpacing: '-0.015em' }}>A few things we won’t compromise on.</h2>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', alignItems: 'stretch' }}>
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <FadeIn key={i} delay={i * 70}>
                <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${LINE}`, padding: '26px', height: '100%' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '13px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Icon style={{ width: '23px', height: '23px', color: INK }} />
                  </div>
                  <p style={{ fontFamily: serif, fontSize: '18px', fontWeight: 600, color: INK, marginBottom: '8px', letterSpacing: '-0.01em' }}>{v.label}</p>
                  <p style={{ fontFamily: sans, fontSize: '14px', color: STONE, lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section style={{ background: '#fff', padding: '82px 24px', borderTop: `1px solid ${LINE}`, textAlign: 'center' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 600, color: INK, letterSpacing: '-0.015em', marginBottom: '16px', lineHeight: 1.15 }}>
            See if it feels like yours.
          </h2>
          <p style={{ fontFamily: sans, fontSize: '16px', color: STONE, marginBottom: '32px', lineHeight: 1.6 }}>
            Add your first property and try it — most of it clicks into place in a few minutes.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '14px 30px', borderRadius: '11px', background: INK, color: '#fff', fontSize: '15px', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              Get started <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Link>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '14px 30px', borderRadius: '11px', background: '#fff', color: INK, fontSize: '15px', fontWeight: 600, textDecoration: 'none', border: `1.5px solid ${INK}` }}>
              Talk to us
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  </SiteLayout>
);

export default AboutPage;
