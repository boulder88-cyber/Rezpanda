import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, BarChart2, Wrench, TrendingUp, FileText, Shield,
  Zap, BookOpen, Activity, ChevronRight, ArrowRight,
  CheckCircle2, Star, Users, Building2, Briefcase, Heart,
  Globe, Lock, Clock, Layers, Cpu, Database, Sparkles,
  Key, Play
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
      { threshold: 0.12 }
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
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

const SectionLabel = ({ text }) => (
  <p className="font-semibold uppercase tracking-widest" style={{ fontSize: '12px', color: '#e8604c', marginBottom: '12px', letterSpacing: '0.15em' }}>
    {text}
  </p>
);

const SectionHeader = ({ label, title, subtitle, center = false }) => (
  <div style={{ textAlign: center ? 'center' : 'left', marginBottom: '48px' }}>
    {label && <SectionLabel text={label} />}
    <h2 className="font-semibold text-slate-900" style={{ fontSize: '36px', lineHeight: '1.2', marginBottom: '16px', maxWidth: center ? '700px', margin: center ? '0 auto 16px' : undefined }}>
      {title}
    </h2>
    {subtitle && (
      <p className="text-slate-500" style={{ fontSize: '18px', lineHeight: '1.7', maxWidth: center ? '620px' : '600px', margin: center ? '0 auto' : undefined }}>
        {subtitle}
      </p>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// FEATURES DATA
// ═══════════════════════════════════════════════════════════════════════

const FEATURES = [
  { icon: Home, label: 'Home Profile', desc: 'Your property\'s command center — valuation, equity, documents, utilities, insurance, maintenance, and timeline in one dashboard.', color: '#1e3a5f', bg: '#eef2f8', href: '/home-profile' },
  { icon: Layers, label: 'Portfolio Overview', desc: 'For multi-property owners: total value, equity, cash flow, risk, and maintenance load across all homes.', color: '#7c3aed', bg: '#f5f3ff', href: '/portfolio' },
  { icon: Wrench, label: 'Maintenance Scheduler', desc: 'Predictive tasks, seasonal reminders, vendor coordination, and overdue alerts.', color: '#f97316', bg: '#fff7ed', href: '/maintenance-scheduler' },
  { icon: TrendingUp, label: 'Valuation & Equity', desc: 'Real-time value, mortgage balance, equity growth, market comparisons, and projections.', color: '#059669', bg: '#ecfdf5', href: '/valuation-equity' },
  { icon: FileText, label: 'Document Vault', desc: 'Encrypted storage for deeds, warranties, policies, closing docs, and receipts.', color: '#2563eb', bg: '#eff6ff', href: '/documents' },
  { icon: Shield, label: 'Insurance Analyzer', desc: 'Coverage gaps, renewal alerts, and policy comparisons.', color: '#e8604c', bg: '#fdf0ee', href: '/insurance-analyzer' },
  { icon: Zap, label: 'Utilities Dashboard', desc: 'Track spend, usage, efficiency, and bills across all providers.', color: '#d97706', bg: '#fffbeb', href: '/utilities' },
  { icon: BookOpen, label: 'Learning Hub', desc: 'Expert guides, calculators, and homeowner education.', color: '#0891b2', bg: '#ecfeff', href: '/home-learn' },
  { icon: Activity, label: 'Home Timeline', desc: 'A complete history of your home — repairs, upgrades, inspections, and events.', color: '#64748b', bg: '#f8fafc', href: '/timeline' },
];

const STEPS = [
  { number: '01', title: 'Connect your home', desc: 'Add your property with address, purchase details, and property type. Takes under two minutes.' },
  { number: '02', title: 'Upload or sync your data', desc: 'Add documents, link utility accounts, import insurance policies, and log maintenance history.' },
  { number: '03', title: 'HomeOS organizes everything', desc: 'Every asset is classified, indexed, and connected — automatically.' },
  { number: '04', title: 'HomeOS keeps everything updated', desc: 'Valuations refresh. Renewals alert. Maintenance schedules ahead. Nothing falls through the cracks.' },
  { number: '05', title: 'Your complete home operating system', desc: 'One dashboard. Every decision. Full confidence.' },
];

const STAKEHOLDERS = [
  { icon: Home, label: 'Homeowners', desc: 'One dashboard for every property, every document, every decision. Never lose track of what matters most.', color: '#1e3a5f', bg: '#eef2f8' },
  { icon: Users, label: 'Agents', desc: 'Strengthen client relationships with a platform that keeps you connected long after closing day.', color: '#059669', bg: '#ecfdf5' },
  { icon: Building2, label: 'Brokerages', desc: 'White-label HomeOS under your brand. Create a permanent post-transaction relationship with every client.', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: Briefcase, label: 'Family Offices', desc: 'Enterprise-grade portfolio management for high-net-worth real estate holdings across multiple properties.', color: '#d97706', bg: '#fffbeb' },
];

const ADVANTAGES = [
  { icon: Sparkles, label: 'Clarity', desc: 'Everything organized and accessible — one source of truth for every property decision.' },
  { icon: Cpu, label: 'Control', desc: 'Proactive alerts and recommendations before problems become expensive surprises.' },
  { icon: CheckCircle2, label: 'Confidence', desc: 'Complete records for every decision — from renovation to refinancing to resale.' },
  { icon: Database, label: 'Continuity', desc: "Your home's history preserved forever — for the next owner, lender, or advisor." },
];

const PARTNER_ADVANTAGES = [
  { label: 'Client Retention', desc: 'A reason to stay in contact every month — not just at closing.' },
  { label: 'Brand Permanence', desc: 'Your brand lives inside your client\'s home operating system.' },
  { label: 'Data Moat', desc: 'The most valuable homeowner dataset in real estate.' },
  { label: 'Enterprise Differentiation', desc: 'The only brokerage with a true post-transaction platform.' },
];

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const HomeOSOverviewPage = () => (
  <>
    <Helmet><title>HomeOS: The Operating System for Homeownership — CasaCEO</title></Helmet>
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════════
          1. HERO SECTION
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: '#1e3a5f', padding: '120px 32px 100px' }}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-5" style={{ width: '600px', height: '600px', background: '#e8604c', top: '-200px', right: '-100px' }} />
          <div className="absolute rounded-full opacity-5" style={{ width: '400px', height: '400px', background: '#c9a96e', bottom: '-100px', left: '-50px' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div style={{ marginBottom: '24px' }}>
            <span className="font-semibold rounded-full" style={{ fontSize: '13px', background: 'rgba(232,96,76,0.15)', color: '#e8604c', padding: '6px 16px', border: '1px solid rgba(232,96,76,0.3)' }}>
              The Category-Defining Platform
            </span>
          </div>

          <h1 className="font-semibold text-white" style={{ fontSize: '56px', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.02em' }}>
            HomeOS: The Operating System<br />for Homeownership
          </h1>

          <p className="text-blue-200" style={{ fontSize: '20px', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 48px' }}>
            Homeownership has never had a system. Until now. HomeOS unifies every part of owning a home — maintenance, documents, insurance, utilities, valuation, and more — into one intelligent platform that keeps your home running smoothly and your life moving forward.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/home-profile" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '16px 32px', fontSize: '16px' }}>
              Get Started <ArrowRight style={{ width: '18px', height: '18px' }} />
            </Link>
            <a href="#how-it-works" className="flex items-center gap-2 font-semibold rounded-2xl border transition-all hover:bg-white/10" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '16px 32px', fontSize: '16px' }}>
              <Play style={{ width: '16px', height: '16px' }} /> See How It Works
            </a>
          </div>

          {/* Social proof strip */}
          <div className="flex items-center justify-center gap-8 flex-wrap" style={{ marginTop: '64px', paddingTop: '48px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { value: '20+', label: 'Modules' },
              { value: '36%', label: 'US Market Coverage' },
              { value: '1', label: 'Command Center' },
              { value: '∞', label: 'Home Memory' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-extrabold text-white" style={{ fontSize: '32px', lineHeight: 1 }}>{s.value}</p>
                <p className="text-blue-300" style={{ fontSize: '13px', marginTop: '4px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          2. WHAT HOMEOS IS
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: '#f8fafc' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <SectionLabel text="What HomeOS Is" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '24px' }}>
                Your home's brain.<br />Your home's memory.<br />Your home's command center.
              </h2>
              <p className="text-slate-500" style={{ fontSize: '17px', lineHeight: '1.8', marginBottom: '32px' }}>
                HomeOS is the first platform that brings together every document, every bill, every repair, every policy, every valuation, every utility, and every event — all in one place. Automatically organized, always up to date, and accessible from anywhere.
              </p>
              <p className="font-semibold" style={{ fontSize: '17px', color: '#1e3a5f' }}>
                This is the operating system for the largest asset in your life.
              </p>
            </FadeIn>

            <FadeIn delay={150}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: FileText, label: 'Documents', value: 'All in one vault', color: '#2563eb', bg: '#eff6ff' },
                  { icon: TrendingUp, label: 'Valuation', value: 'Live & accurate', color: '#059669', bg: '#ecfdf5' },
                  { icon: Wrench, label: 'Maintenance', value: 'Proactively scheduled', color: '#f97316', bg: '#fff7ed' },
                  { icon: Shield, label: 'Insurance', value: 'No gaps', color: '#e8604c', bg: '#fdf0ee' },
                  { icon: Zap, label: 'Utilities', value: 'Tracked & optimized', color: '#d97706', bg: '#fffbeb' },
                  { icon: Activity, label: 'Timeline', value: 'Complete history', color: '#64748b', bg: '#f8fafc' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="bg-white rounded-2xl" style={{ padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '10px', background: item.bg, marginBottom: '10px' }}>
                        <Icon style={{ width: '18px', height: '18px', color: item.color }} />
                      </div>
                      <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{item.label}</p>
                      <p className="text-slate-400" style={{ fontSize: '12px', marginTop: '2px' }}>{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          3. WHY HOMEOS MATTERS
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: 'white' }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Problem side */}
              <div>
                <SectionLabel text="The Problem" />
                <h2 className="font-semibold text-slate-900" style={{ fontSize: '36px', lineHeight: '1.2', marginBottom: '24px' }}>
                  Homeownership is fragmented.<br /><span style={{ color: '#e8604c' }}>HomeOS fixes that.</span>
                </h2>
                <p className="text-slate-500" style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '32px' }}>
                  Today, homeowners juggle paperwork scattered across email and drawers, maintenance reminders in calendars, insurance policies they don't understand, utilities with no visibility, valuations that change constantly, and no single source of truth.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['Paperwork scattered across email and drawers', 'Maintenance reminders in five different calendars', 'Insurance policies nobody reads until it\'s too late', 'Utilities with no spending visibility', 'No single source of truth for the biggest asset in life'].map((pain, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ padding: '10px 14px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                      <div className="flex-shrink-0 rounded-full" style={{ width: '6px', height: '6px', background: '#dc2626' }} />
                      <p className="text-slate-600" style={{ fontSize: '14px' }}>{pain}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solution side */}
              <div>
                <SectionLabel text="The Solution" />
                <h2 className="font-semibold text-slate-900" style={{ fontSize: '36px', lineHeight: '1.2', marginBottom: '24px' }}>
                  HomeOS replaces chaos<br /><span style={{ color: '#059669' }}>with clarity.</span>
                </h2>
                <p className="text-slate-500" style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '32px' }}>
                  HomeOS turns your home into a managed asset, not a guessing game. Every piece of information lives in one place — organized, searchable, and always ready when you need it.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['One vault for every document, receipt, and policy', 'Predictive maintenance before things break', 'Insurance analyzer that finds your gaps', 'Real-time valuation and equity tracking', 'A complete home operating system that thinks ahead'].map((sol, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ padding: '10px 14px', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                      <CheckCircle2 style={{ width: '14px', height: '14px', color: '#059669', flexShrink: 0 }} />
                      <p className="text-slate-600" style={{ fontSize: '14px' }}>{sol}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          4. WHAT HOMEOS DOES — FEATURE GRID
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: '#f8fafc' }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <SectionHeader
              label="What HomeOS Does"
              title="A unified system built around the real lifecycle of a home."
              subtitle="Nine modules. One platform. Every aspect of homeownership — organized, automated, and intelligent."
              center
            />
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <FadeIn key={i} delay={i * 60}>
                  <Link to={feature.href} className="bg-white flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', textDecoration: 'none' }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '14px' }}>
                      <div className="flex items-center justify-center" style={{ width: '44px', height: '44px', borderRadius: '12px', background: feature.bg }}>
                        <Icon style={{ width: '22px', height: '22px', color: feature.color }} />
                      </div>
                      <p className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>{feature.label}</p>
                    </div>
                    <p className="text-slate-500 flex-1" style={{ fontSize: '14px', lineHeight: '1.7' }}>{feature.desc}</p>
                    <div className="flex items-center gap-1 font-semibold group-hover:gap-2 transition-all" style={{ fontSize: '13px', color: '#1e3a5f', marginTop: '16px' }}>
                      Explore <ChevronRight style={{ width: '14px', height: '14px' }} />
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          5. THE HOMEOS ADVANTAGE
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: '#1e3a5f' }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '64px' }}>
              <SectionLabel text="The HomeOS Advantage" />
              <h2 className="font-semibold text-white" style={{ fontSize: '40px', lineHeight: '1.2', marginBottom: '16px' }}>
                One platform. One source of truth.<br />One operating system.
              </h2>
            </div>
          </FadeIn>

          {/* Four C's */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: '64px' }}>
            {ADVANTAGES.map((adv, i) => {
              const Icon = adv.icon;
              return (
                <FadeIn key={i} delay={i * 80}>
                  <div className="text-center" style={{ padding: '28px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center justify-center mx-auto" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', marginBottom: '16px' }}>
                      <Icon style={{ width: '22px', height: '22px', color: 'white' }} />
                    </div>
                    <p className="font-semibold text-white" style={{ fontSize: '18px', marginBottom: '8px' }}>{adv.label}</p>
                    <p className="text-blue-200" style={{ fontSize: '14px', lineHeight: '1.6' }}>{adv.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Partner Value */}
          <FadeIn>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '48px' }}>
              <p className="font-semibold text-blue-200 uppercase tracking-widest text-center" style={{ fontSize: '12px', marginBottom: '32px' }}>Brokerage Partner Value</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PARTNER_ADVANTAGES.map((p, i) => (
                  <div key={i} style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="font-semibold text-white" style={{ fontSize: '15px', marginBottom: '6px' }}>{p.label}</p>
                    <p className="text-blue-300" style={{ fontSize: '13px', lineHeight: '1.6' }}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          6. HOW HOMEOS WORKS
      ════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '96px 32px', background: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <SectionHeader
              label="How HomeOS Works"
              title="Connect. Organize. Automate. Improve."
              subtitle="Five steps to a complete home operating system — most homeowners are up and running in under ten minutes."
              center
            />
          </FadeIn>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {STEPS.map((step, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="flex gap-6" style={{ paddingBottom: i < STEPS.length - 1 ? '32px' : '0', position: 'relative' }}>
                  {/* Spine */}
                  <div className="flex flex-col items-center flex-shrink-0" style={{ width: '48px' }}>
                    <div className="flex items-center justify-center font-extrabold text-white" style={{ width: '48px', height: '48px', borderRadius: '50%', background: i === STEPS.length - 1 ? '#e8604c' : '#1e3a5f', fontSize: '14px', flexShrink: 0, zIndex: 1 }}>
                      {step.number}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ width: '2px', flex: 1, background: '#e2e8f0', marginTop: '8px', minHeight: '24px' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: '8px', paddingTop: '10px' }}>
                    <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '6px' }}>{step.title}</p>
                    <p className="text-slate-500" style={{ fontSize: '15px', lineHeight: '1.7' }}>{step.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          7. WHO HOMEOS IS FOR
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: '#f8fafc' }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <SectionHeader
              label="Who HomeOS Is For"
              title="Built for every stakeholder in the homeownership ecosystem."
              subtitle="Whether you own one home or a portfolio of twenty, HomeOS was built for you."
              center
            />
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STAKEHOLDERS.map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeIn key={i} delay={i * 80}>
                  <div className="bg-white" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
                    <div className="flex items-center justify-center" style={{ width: '52px', height: '52px', borderRadius: '14px', background: s.bg, marginBottom: '16px' }}>
                      <Icon style={{ width: '24px', height: '24px', color: s.color }} />
                    </div>
                    <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '10px' }}>{s.label}</p>
                    <p className="text-slate-500" style={{ fontSize: '14px', lineHeight: '1.7' }}>{s.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          8. THE FUTURE OF HOMEOWNERSHIP
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: 'white' }}>
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <SectionLabel text="The Future of Homeownership" />
            <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.2', marginBottom: '40px' }}>
              A new category: The Home Ownership<br />Operating System.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ marginBottom: '48px' }}>
            {[
              { icon: Home, text: 'Every home will have a digital identity.' },
              { icon: Key, text: 'Every homeowner will have a command center.' },
              { icon: Users, text: 'Every agent will have a lifelong client connection.' },
              { icon: Building2, text: 'Every brokerage will have a permanent brand presence.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={i} delay={i * 80}>
                  <div className="flex items-center gap-4 text-left" style={{ padding: '20px 24px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="flex items-center justify-center flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2f8' }}>
                      <Icon style={{ width: '20px', height: '20px', color: '#1e3a5f' }} />
                    </div>
                    <p className="font-semibold text-slate-800" style={{ fontSize: '16px' }}>{item.text}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={200}>
            <p className="font-semibold text-slate-500" style={{ fontSize: '18px', lineHeight: '1.8' }}>
              This is the future of homeownership — and it starts here.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          9. CALL TO ACTION
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '96px 32px', background: '#1e3a5f', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full opacity-5" style={{ width: '500px', height: '500px', background: '#e8604c', top: '-100px', right: '-100px' }} />
          <div className="absolute rounded-full opacity-5" style={{ width: '300px', height: '300px', background: '#c9a96e', bottom: '-50px', left: '-50px' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="font-semibold uppercase tracking-widest" style={{ fontSize: '12px', color: '#e8604c', marginBottom: '16px', letterSpacing: '0.15em' }}>
              Ready to Begin
            </p>
            <h2 className="font-semibold text-white" style={{ fontSize: '48px', lineHeight: '1.15', marginBottom: '20px' }}>
              Experience HomeOS
            </h2>
            <p className="text-blue-200" style={{ fontSize: '18px', lineHeight: '1.7', marginBottom: '48px' }}>
              Start with your first property. Your home's operating system is waiting.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/home-profile" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '18px 36px', fontSize: '16px' }}>
                Experience HomeOS <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
              <Link to="/home-profile" className="flex items-center gap-2 font-semibold rounded-2xl border transition-all hover:bg-white/10" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '18px 36px', fontSize: '16px' }}>
                Start with your first property
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 flex-wrap" style={{ marginTop: '48px' }}>
              {[
                { icon: Lock, text: 'Bank-grade encryption' },
                { icon: Globe, text: 'Accessible anywhere' },
                { icon: Heart, text: 'Built for homeowners' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-blue-300" style={{ fontSize: '13px' }}>
                    <Icon style={{ width: '14px', height: '14px' }} />
                    {item.text}
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

export default HomeOSOverviewPage;
