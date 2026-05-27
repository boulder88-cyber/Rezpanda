import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import {
  ArrowRight, Home, FileText, Wrench, Activity,
  TrendingUp, Shield, Star, CheckCircle2, Play
} from 'lucide-react';

// ── Fade-in hook ───────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════

const FEATURES = [
  { icon: Home,       label: 'Home Profile',     desc: 'Your property command center — valuation, equity, and every detail in one place.',     color: '#1e3a5f', bg: '#eef2f8' },
  { icon: FileText,   label: 'Document Vault',   desc: 'Encrypted storage for deeds, warranties, receipts, closing docs, and policies.',       color: '#7c3aed', bg: '#f5f3ff' },
  { icon: Wrench,     label: 'Maintenance',      desc: 'Predictive reminders, seasonal tasks, and vendor coordination — all automated.',        color: '#f97316', bg: '#fff7ed' },
  { icon: Activity,   label: 'Timeline',         desc: 'A permanent history of every event, improvement, and expense in your home.',            color: '#059669', bg: '#ecfdf5' },
  { icon: TrendingUp, label: 'Valuation',        desc: 'Daily automated valuation, equity tracking, and sell-vs-hold analysis.',               color: '#1A73E8', bg: '#EFF6FF' },
  { icon: Shield,     label: 'Insurance & Utilities', desc: 'Track all policies, detect coverage gaps, and monitor utility spend in one place.', color: '#e8604c', bg: '#fdf0ee' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Add your home', desc: 'Enter your address and property details. HomeOS pulls the public record data automatically.' },
  { step: '02', title: 'Upload documents', desc: 'Drop in your closing docs, warranties, and insurance policies. AI classifies everything.' },
  { step: '03', title: 'HomeOS organizes everything automatically', desc: 'Maintenance reminders surface, timelines populate, valuations update — all on their own.' },
];

const TESTIMONIALS = [
  { name: 'Jennifer M.', role: 'Homeowner · Atlanta, GA', quote: 'I finally feel like I understand what I own. HomeOS gave me a system I never knew I needed.', rating: 5 },
  { name: 'Marcus T.', role: 'Homeowner · San Francisco, CA', quote: 'The document vault alone is worth it. I can find anything in seconds — no more lost warranties.', rating: 5 },
  { name: 'Sarah K.', role: 'Homeowner · Austin, TX', quote: 'The maintenance reminders caught a roof issue before it became a $20,000 problem. Incredible.', rating: 5 },
  { name: 'David L.', role: 'Real Estate Attorney · Nashville, TN', quote: 'Every homeowner should have this. It's the missing layer between owning a home and understanding it.', rating: 5 },
];

const INTEGRATIONS = [
  { name: 'Ring', initial: 'R', color: '#1e40af', bg: '#dbeafe' },
  { name: 'Nest', initial: 'N', color: '#065f46', bg: '#d1fae5' },
  { name: 'Zillow', initial: 'Z', color: '#1e3a5f', bg: '#eef2f8' },
  { name: 'Redfin', initial: 'Rf', color: '#dc2626', bg: '#fee2e2' },
  { name: 'State Farm', initial: 'SF', color: '#c2410c', bg: '#ffedd5' },
  { name: 'Rocket', initial: 'Rm', color: '#d97706', bg: '#fef3c7' },
];

// ═══════════════════════════════════════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════════════════════════════════════

const HeroSection = () => (
  <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1A73E8 100%)', padding: '100px 24px 96px', overflow: 'hidden', position: 'relative' }}>
    {/* Background orbs */}
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(26,115,232,0.12)', top: '-150px', right: '-80px' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(232,96,76,0.08)', bottom: '-80px', left: '-60px' }} />
    </div>
    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, background: 'rgba(26,115,232,0.2)', color: '#93c5fd', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(26,115,232,0.3)' }}>
          The Home Ownership Operating System
        </span>
      </div>
      <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.03em' }}>
        Your Home, Organized.<br />Finally.
      </h1>
      <p style={{ fontSize: '20px', lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', maxWidth: '560px', margin: '0 auto 40px' }}>
        The Operating System for Homeownership. One platform for your documents, maintenance, valuation, insurance, and everything in between.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '15px 32px', borderRadius: '10px', background: '#1A73E8', color: 'white', fontSize: '16px', fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Get Started Free <ArrowRight style={{ width: '17px', height: '17px' }} />
        </Link>
        <Link to="/product" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '15px 32px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '16px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
          <Play style={{ width: '15px', height: '15px', fill: 'white' }} /> Watch Demo
        </Link>
      </div>
      <div className="flex items-center justify-center gap-6 flex-wrap" style={{ marginTop: '40px', display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {['Free to start', 'No credit card needed', 'Set up in 5 minutes'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
            <CheckCircle2 style={{ width: '14px', height: '14px', color: '#86efac' }} /> {item}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FeatureGrid = () => (
  <section style={{ padding: '96px 24px', background: '#f8fafc' }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#1A73E8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>The Platform</p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Six modules. One operating system.
          </h2>
          <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '520px', margin: '0 auto' }}>
            Every aspect of homeownership — organized, intelligent, and connected.
          </p>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <FadeIn key={i} delay={i * 60}>
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                  <Icon style={{ width: '22px', height: '22px', color: f.color }} />
                </div>
                <p style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>{f.label}</p>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </FadeIn>
          );
        })}
      </div>
      <FadeIn delay={400}>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/product" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 600, color: '#1A73E8', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            See all modules <ArrowRight style={{ width: '15px', height: '15px' }} />
          </Link>
        </div>
      </FadeIn>
    </div>
  </section>
);

const HowItWorksSection = () => (
  <section style={{ padding: '96px 24px', background: 'white' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#1A73E8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>How It Works</p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Set up in minutes.
          </h2>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
        {HOW_IT_WORKS.map((step, i) => (
          <FadeIn key={i} delay={i * 100}>
            <div style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EFF6FF', border: '2px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '18px', fontWeight: 800, color: '#1A73E8' }}>
                {step.step}
              </div>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>{step.title}</p>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

const TestimonialsSection = () => (
  <section style={{ padding: '96px 24px', background: '#f8fafc' }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <FadeIn>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#1A73E8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>Testimonials</p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Homeowners love it.
          </h2>
        </div>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {TESTIMONIALS.map((t, i) => (
          <FadeIn key={i} delay={i * 70}>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '16px' }}>
                {Array(t.rating).fill(0).map((_, j) => <Star key={j} style={{ width: '15px', height: '15px', color: '#f59e0b', fill: '#f59e0b' }} />)}
              </div>
              <p style={{ fontSize: '15px', color: '#334155', lineHeight: 1.7, marginBottom: '20px', fontStyle: 'italic' }}>
                "{t.quote}"
              </p>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>{t.role}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

const IntegrationsSection = () => (
  <section style={{ padding: '80px 24px', background: 'white' }}>
    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
      <FadeIn>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px' }}>Integrates With</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {INTEGRATIONS.map((intg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'} onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: intg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: intg.color }}>{intg.initial}</div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{intg.name}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '20px' }}>More integrations coming soon.</p>
      </FadeIn>
    </div>
  </section>
);

const CTASection = () => (
  <section style={{ padding: '96px 24px', background: 'linear-gradient(135deg, #1e3a5f 0%, #1A73E8 100%)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: '-100px', right: '-80px' }} />
    </div>
    <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <FadeIn>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '16px' }}>
          Start managing your home like a pro.
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '36px', lineHeight: 1.7 }}>
          Join homeowners who've turned confusion into clarity. Free to start.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '15px 32px', borderRadius: '10px', background: 'white', color: '#1e3a5f', fontSize: '16px', fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Get Started Free <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '15px 32px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '16px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            Contact Sales
          </Link>
        </div>
      </FadeIn>
    </div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════

const MarketingHomePage = () => (
  <SiteLayout seo={{ title: 'HomeOS — The Operating System for Homeownership' }} fullWidth>
    <HeroSection />
    <FeatureGrid />
    <HowItWorksSection />
    <TestimonialsSection />
    <IntegrationsSection />
    <CTASection />
  </SiteLayout>
);

export default MarketingHomePage;
