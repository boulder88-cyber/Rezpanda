import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ArrowRight, X, CheckCircle2, AlertCircle, Home,
  Car, BarChart2, Heart, FileText, Shield, Zap,
  Wrench, TrendingUp, Activity, DollarSign, Calendar,
  Layers, Database, Globe, Key, Building2, Users, Cpu
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION HOOK
// ═══════════════════════════════════════════════════════════════════════

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
};

const FadeIn = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const SectionLabel = ({ text, light = false }) => (
  <p className="font-semibold uppercase tracking-widest" style={{
    fontSize: '12px',
    color: light ? 'rgba(232,96,76,0.9)' : '#e8604c',
    marginBottom: '14px',
    letterSpacing: '0.15em',
  }}>
    {text}
  </p>
);

const Divider = () => (
  <div className="max-w-6xl mx-auto" style={{ padding: '0 32px' }}>
    <div style={{ height: '1px', background: '#e2e8f0' }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════

const PROBLEMS = [
  { icon: FileText, text: 'Documents scattered across email, drawers, and portals' },
  { icon: Calendar, text: 'Maintenance reminders in notes and calendars' },
  { icon: Shield, text: 'Insurance policies they barely understand' },
  { icon: Zap, text: 'Utilities with no visibility' },
  { icon: TrendingUp, text: 'Valuations that change constantly' },
  { icon: Activity, text: 'No unified history of repairs, upgrades, or events' },
  { icon: DollarSign, text: 'No way to see the full financial picture of their home' },
];

const CONSEQUENCES = [
  'Missed maintenance leads to expensive repairs',
  'Lost documents slow down refinancing and resale',
  'Insurance gaps leave homeowners exposed',
  'Utility inefficiency wastes money',
  'No valuation clarity means poor financial decisions',
  'No timeline means no record of what\'s been done',
  'No unified view means no control',
];

const ASSET_CLASSES = [
  { icon: Car, label: 'Cars', system: 'Onboard computers', hasSystem: true },
  { icon: BarChart2, label: 'Investments', system: 'Portfolio dashboards', hasSystem: true },
  { icon: Building2, label: 'Businesses', system: 'ERPs & CRMs', hasSystem: true },
  { icon: Heart, label: 'Health', system: 'Digital health records', hasSystem: true },
  { icon: Home, label: 'The Home', system: 'Nothing. Until now.', hasSystem: false },
];

const HOME_ECOSYSTEM = [
  { icon: FileText, label: 'Documents', color: '#2563eb', bg: '#eff6ff' },
  { icon: DollarSign, label: 'Bills', color: '#059669', bg: '#ecfdf5' },
  { icon: Shield, label: 'Insurance', color: '#e8604c', bg: '#fdf0ee' },
  { icon: Zap, label: 'Utilities', color: '#d97706', bg: '#fffbeb' },
  { icon: Wrench, label: 'Maintenance', color: '#f97316', bg: '#fff7ed' },
  { icon: TrendingUp, label: 'Valuation', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: BarChart2, label: 'Equity', color: '#1e3a5f', bg: '#eef2f8' },
  { icon: Activity, label: 'Timeline', color: '#64748b', bg: '#f8fafc' },
];

const SOLUTION_ITEMS = [
  'One place for documents',
  'One place for maintenance',
  'One place for insurance',
  'One place for utilities',
  'One place for valuation',
  'One place for the home\'s entire history',
];

const VISION_ITEMS = [
  { icon: Home, text: 'Every home has a digital profile' },
  { icon: Cpu, text: 'Every homeowner has a command center' },
  { icon: Users, text: 'Every agent stays connected long after closing' },
  { icon: Building2, text: 'Every brokerage has a permanent brand presence' },
  { icon: Database, text: 'Every property has a complete, transferable history' },
];

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const WhyHomeOSPage = () => (
  <>
    <Helmet><title>Why HomeOS Exists — CasaCEO</title></Helmet>
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════════
          1. HERO
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: '#1e3a5f', padding: '120px 32px 100px' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-5" style={{ width: '700px', height: '700px', background: '#e8604c', top: '-200px', right: '-150px' }} />
          <div className="absolute rounded-full opacity-4" style={{ width: '400px', height: '400px', background: '#c9a96e', bottom: '-100px', left: '-80px' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div style={{ marginBottom: '24px' }}>
            <span className="font-semibold rounded-full" style={{ fontSize: '13px', background: 'rgba(232,96,76,0.15)', color: '#e8604c', padding: '6px 16px', border: '1px solid rgba(232,96,76,0.3)' }}>
              The Category Creation Narrative
            </span>
          </div>

          <h1 className="font-semibold text-white" style={{ fontSize: '60px', lineHeight: '1.08', marginBottom: '28px', letterSpacing: '-0.02em' }}>
            Homeownership is broken.<br />
            <span style={{ color: '#e8604c' }}>HomeOS fixes it.</span>
          </h1>

          <p className="text-blue-200" style={{ fontSize: '20px', lineHeight: '1.75', maxWidth: '640px', margin: '0 auto 48px' }}>
            For decades, homeowners have been forced to manage the largest asset in their lives with no system, no structure, and no single source of truth. HomeOS exists to change that.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/homeos" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '16px 32px', fontSize: '16px' }}>
              See How HomeOS Works <ArrowRight style={{ width: '18px', height: '18px' }} />
            </Link>
            <Link to="/home-profile" className="flex items-center gap-2 font-semibold rounded-2xl border transition-all hover:bg-white/10" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '16px 32px', fontSize: '16px' }}>
              Start Your Home Profile
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          2. THE PROBLEM
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: 'white' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <FadeIn>
              <SectionLabel text="The Problem" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '24px' }}>
                Homeownership has<br />no operating system.
              </h2>
              <p className="text-slate-500" style={{ fontSize: '17px', lineHeight: '1.8', marginBottom: '32px' }}>
                Despite being the biggest financial asset most people will ever own, the home has no digital infrastructure. Homeowners are left to juggle fragments of information across dozens of places — with no system connecting any of it.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {['There is no system.', 'There is no structure.', 'There is no continuity.'].map((line, i) => (
                  <p key={i} className="font-semibold text-slate-800" style={{ fontSize: '20px', borderLeft: '3px solid #e8604c', paddingLeft: '16px' }}>
                    {line}
                  </p>
                ))}
                <p className="font-extrabold" style={{ fontSize: '28px', color: '#1e3a5f', marginTop: '8px' }}>Just chaos.</p>
              </div>
            </FadeIn>

            <FadeIn delay={120}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PROBLEMS.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <div key={i} className="flex items-center gap-4" style={{ padding: '14px 18px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fee2e2' }}>
                        <Icon style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                      </div>
                      <p className="text-slate-700" style={{ fontSize: '14px', lineHeight: '1.5' }}>{p.text}</p>
                    </div>
                  );
                })}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════
          3. THE CONSEQUENCES
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: '#f8fafc' }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <SectionLabel text="The Consequences" />
                <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '24px' }}>
                  Fragmentation creates<br />risk, cost, and confusion.
                </h2>
                <p className="text-slate-500" style={{ fontSize: '17px', lineHeight: '1.8', marginBottom: '40px' }}>
                  When the home has no system, problems compound silently — until they become expensive, stressful, or irreversible.
                </p>
                <p className="font-semibold" style={{ fontSize: '18px', color: '#1e3a5f' }}>Homeowners deserve better.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {CONSEQUENCES.map((c, i) => (
                  <FadeIn key={i} delay={i * 60}>
                    <div className="flex items-center gap-3" style={{ padding: '14px 16px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                      <AlertCircle style={{ width: '16px', height: '16px', color: '#f97316', flexShrink: 0 }} />
                      <p className="text-slate-700" style={{ fontSize: '14px' }}>{c}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════
          4. THE GAP IN THE MARKET
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: 'white' }}>
        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <SectionLabel text="The Gap in the Market" />
            <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '16px' }}>
              Every major asset class has a system —<br />except the home.
            </h2>
            <p className="text-slate-400" style={{ fontSize: '17px', marginBottom: '56px' }}>Every category that matters has been digitized. Every one — except the home.</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4" style={{ marginBottom: '48px' }}>
            {ASSET_CLASSES.map((asset, i) => {
              const Icon = asset.icon;
              return (
                <FadeIn key={i} delay={i * 80}>
                  <div className="flex flex-col items-center" style={{
                    padding: '28px 16px',
                    borderRadius: '16px',
                    background: asset.hasSystem ? '#f8fafc' : '#1e3a5f',
                    border: asset.hasSystem ? '1px solid #e2e8f0' : '2px solid #e8604c',
                    boxShadow: asset.hasSystem ? '0 1px 3px rgba(0,0,0,0.04)' : '0 8px 32px rgba(30,58,95,0.3)',
                  }}>
                    <Icon style={{ width: '28px', height: '28px', marginBottom: '12px', color: asset.hasSystem ? '#64748b' : 'white' }} />
                    <p className="font-semibold" style={{ fontSize: '14px', color: asset.hasSystem ? '#334155' : 'white', marginBottom: '8px' }}>{asset.label}</p>
                    <p style={{ fontSize: '12px', lineHeight: '1.5', color: asset.hasSystem ? '#94a3b8' : '#e8604c', fontWeight: asset.hasSystem ? 400 : 600, textAlign: 'center' }}>{asset.system}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={200}>
            <p className="font-semibold text-slate-600" style={{ fontSize: '20px', lineHeight: '1.8', maxWidth: '600px', margin: '0 auto' }}>
              No platform. No memory. No intelligence.<br />
              <span style={{ color: '#1e3a5f' }}>No operating system.</span><br />
              <span style={{ color: '#e8604c', fontWeight: 700 }}>This is the gap HomeOS fills.</span>
            </p>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════
          5. THE INSIGHT
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: '#f8fafc' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <SectionLabel text="The Insight" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '24px' }}>
                A home is not a building —<br />it's a system.
              </h2>
              <p className="text-slate-500" style={{ fontSize: '17px', lineHeight: '1.8', marginBottom: '24px' }}>
                A home is a living ecosystem of interconnected elements — documents, bills, insurance, utilities, maintenance, repairs, upgrades, valuation, equity, and events.
              </p>
              <p className="text-slate-500" style={{ fontSize: '17px', lineHeight: '1.8', marginBottom: '32px' }}>
                These elements are deeply interconnected. But today, they live in silos — disconnected, fragmented, and invisible to the homeowner.
              </p>
              <p className="font-bold" style={{ fontSize: '22px', color: '#1e3a5f' }}>HomeOS connects them.</p>
            </FadeIn>

            <FadeIn delay={120}>
              {/* Ecosystem grid */}
              <div className="grid grid-cols-4 gap-3">
                {HOME_ECOSYSTEM.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex flex-col items-center text-center" style={{ padding: '16px 8px', borderRadius: '12px', background: item.bg, border: `1px solid ${item.bg}` }}>
                      <Icon style={{ width: '20px', height: '20px', color: item.color, marginBottom: '8px' }} />
                      <p className="font-semibold" style={{ fontSize: '12px', color: item.color }}>{item.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Connection arrow */}
              <div className="flex items-center justify-center gap-3" style={{ margin: '24px 0', padding: '16px', borderRadius: '12px', background: '#eef2f8', border: '1px solid #c7d7eb' }}>
                <div className="flex-1 h-px" style={{ background: '#c7d7eb' }} />
                <div className="flex items-center gap-2">
                  <Layers style={{ width: '18px', height: '18px', color: '#1e3a5f' }} />
                  <span className="font-bold text-slate-900" style={{ fontSize: '14px' }}>HomeOS connects everything</span>
                </div>
                <div className="flex-1 h-px" style={{ background: '#c7d7eb' }} />
              </div>

              {/* Unified block */}
              <div className="flex items-center justify-center" style={{ padding: '20px', borderRadius: '12px', background: '#1e3a5f', border: '1px solid #1e3a5f' }}>
                <Home style={{ width: '22px', height: '22px', color: 'white', marginRight: '12px' }} />
                <p className="font-bold text-white" style={{ fontSize: '16px' }}>One Home Operating System</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════
          6. THE SOLUTION
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '56px' }}>
              <SectionLabel text="The Solution" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '16px' }}>
                HomeOS creates order,<br />intelligence, and continuity.
              </h2>
              <p className="text-slate-500" style={{ fontSize: '17px', lineHeight: '1.8', maxWidth: '540px', margin: '0 auto' }}>
                HomeOS unifies every part of homeownership into one platform — the brain, memory, and command center for every home.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: '48px' }}>
            {SOLUTION_ITEMS.map((item, i) => (
              <FadeIn key={i} delay={i * 70}>
                <div className="flex items-center gap-3" style={{ padding: '18px 20px', borderRadius: '14px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                  <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669', flexShrink: 0 }} />
                  <p className="font-semibold text-slate-800" style={{ fontSize: '14px' }}>{item}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={300}>
            <div className="text-center" style={{ padding: '32px', borderRadius: '16px', background: '#1e3a5f' }}>
              <p className="font-semibold text-white" style={{ fontSize: '20px', lineHeight: '1.8' }}>
                HomeOS becomes the home's brain, memory, and command center.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════
          7. THE VISION
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: '#f8fafc' }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '56px' }}>
              <SectionLabel text="The Vision" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '16px' }}>
                Every home will have<br />a digital identity.
              </h2>
              <p className="text-slate-500" style={{ fontSize: '17px', lineHeight: '1.8' }}>
                HomeOS is building the foundation for a world where every home, every homeowner, every agent, and every brokerage is connected by a single, intelligent platform.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '640px', margin: '0 auto' }}>
            {VISION_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={i} delay={i * 80}>
                  <div className="flex items-center gap-4" style={{ padding: '20px 24px', borderRadius: '14px', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2f8' }}>
                      <Icon style={{ width: '20px', height: '20px', color: '#1e3a5f' }} />
                    </div>
                    <p className="font-semibold text-slate-800" style={{ fontSize: '16px' }}>{item.text}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={400}>
            <p className="font-semibold text-center" style={{ fontSize: '20px', color: '#1e3a5f', marginTop: '40px' }}>
              This is the future of homeownership.
            </p>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ════════════════════════════════════════════════════════════════
          8. THE CATEGORY
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: 'white' }}>
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <SectionLabel text="The Category" />
            <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '40px' }}>
              Introducing the Home Ownership<br />Operating System.
            </h2>
          </FadeIn>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '560px', margin: '0 auto 48px' }}>
            {[
              { text: 'This is not an app.', strikethrough: true },
              { text: 'This is not a dashboard.', strikethrough: true },
              { text: 'This is not a tool.', strikethrough: true },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="flex items-center gap-3" style={{ padding: '16px 20px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <X style={{ width: '16px', height: '16px', color: '#94a3b8', flexShrink: 0 }} />
                  <p className="text-slate-400 line-through" style={{ fontSize: '17px' }}>{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={280}>
            <div style={{ padding: '40px 48px', borderRadius: '20px', background: '#1e3a5f', border: '2px solid #e8604c', maxWidth: '620px', margin: '0 auto' }}>
              <p className="font-semibold text-white" style={{ fontSize: '28px', lineHeight: '1.4', marginBottom: '16px' }}>
                This is a new category.
              </p>
              <p className="font-extrabold" style={{ fontSize: '32px', color: '#e8604c', lineHeight: '1.2', marginBottom: '16px' }}>
                The Home Ownership<br />Operating System.
              </p>
              <p className="text-blue-200" style={{ fontSize: '16px', lineHeight: '1.7' }}>
                A unified layer that sits on top of every home, powering the entire lifecycle — from purchase to sale, and every moment in between.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          9. CALL TO ACTION
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: '#1e3a5f', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full opacity-5" style={{ width: '600px', height: '600px', background: '#e8604c', top: '-150px', right: '-100px' }} />
          <div className="absolute rounded-full opacity-5" style={{ width: '350px', height: '350px', background: '#c9a96e', bottom: '-80px', left: '-60px' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <SectionLabel text="Ready to Begin" light />
            <h2 className="font-semibold text-white" style={{ fontSize: '48px', lineHeight: '1.15', marginBottom: '20px' }}>
              See How HomeOS Works
            </h2>
            <p className="text-blue-200" style={{ fontSize: '18px', lineHeight: '1.7', marginBottom: '48px', maxWidth: '480px', margin: '0 auto 48px' }}>
              Start with your first property. Your home's operating system is waiting.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/homeos" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '18px 36px', fontSize: '16px' }}>
                See How HomeOS Works <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
              <Link to="/home-profile" className="flex items-center gap-2 font-semibold rounded-2xl border transition-all hover:bg-white/10" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '18px 36px', fontSize: '16px' }}>
                Start Your Home Profile
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  </>
);

export default WhyHomeOSPage;
