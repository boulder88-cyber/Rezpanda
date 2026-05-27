import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { ChevronDown, ChevronUp, Sparkles, TrendingUp, Wrench, Star, Zap } from 'lucide-react';

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.06 }
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
      transform: visible ? 'translateY(0)' : 'translateY(14px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// RELEASES DATA
// ═══════════════════════════════════════════════════════════════════════

const RELEASES = [
  {
    version: 'v1.3',
    date: 'May 2026',
    summary: 'Insurance Analyzer launch, Maintenance Scheduler improvements, and document upload fixes.',
    latest: true,
    new: [
      'Insurance Analyzer — coverage gap detection, renewal alerts, and policy comparison',
      'CompassHomeOS Preview page — white-label enterprise preview',
      'Agent Value and Brokerage Value marketing pages',
      'Tier-4 info pages: Pricing, Security, About, Contact',
    ],
    improved: [
      'Maintenance Scheduler — new Smart Recommendations tab with seasonal and predictive alerts',
      'Valuation & Equity Dashboard — 5-year forecast with three scenario projections',
      'Portfolio Overview — Risk Indicators section with auto-detected risks across properties',
      'Home Profile — unified Quick Actions bar linking all modules',
    ],
    fixed: [
      'Document upload progress indicator stalling on large files',
      'Utility billing cycle day calculation edge case on month-end dates',
      'Insurance renewal countdown showing negative days after expiry',
    ],
  },
  {
    version: 'v1.2',
    date: 'March 2026',
    summary: 'Portfolio Overview, Valuation & Equity Dashboard, and Maintenance Scheduler released.',
    new: [
      'Portfolio Overview — multi-property intelligence with financial summary and risk scoring',
      'Valuation & Equity Dashboard — 12-month trend chart, equity breakdown, and renovation ROI',
      'Maintenance Scheduler — calendar view, task list, cost forecast, and smart recommendations',
      'HomeOS Overview and Why HomeOS Exists marketing pages',
    ],
    improved: [
      'Home Profile — all 9 sections per spec with valuation snapshot and timeline preview',
      'Bill Pay — Next Bill Due widget and category breakdown',
      'Home Valuation — comparable sales tab and renovation scenario planner',
    ],
    fixed: [
      'Property tax page breadcrumb navigation returning 404',
      'Timeline event date sorting on leap year edge case',
      'Dashboard alert count not updating on mark-complete action',
    ],
  },
  {
    version: 'v1.1',
    date: 'January 2026',
    summary: 'Module polish pass — standardized headers, smart insights, design tokens applied site-wide.',
    new: [
      'Smart Insights bars across Utilities, Insurance, and Maintenance pages',
      'Efficiency Score in Utilities Dashboard',
      'Annual Forecast metric in Utilities and Bill Pay',
      'Export Summary buttons across all financial modules',
    ],
    improved: [
      'Standardized page headers with breadcrumb navigation on all module pages',
      'Design token consistency pass (12px radius, spacing, shadow-sm) across all pages',
      'Bill Pay — standardized to match Tier-2 design system',
      'Documents Vault — missing documents section with smart alerts',
    ],
    fixed: [
      'Warranty Tracker expiration alerts not surfacing in Dashboard',
      'Plants/Landscaping seasonal guide not rendering on mobile',
      'Rental Properties list view pagination resetting on filter change',
    ],
  },
  {
    version: 'v1.0',
    date: 'November 2025',
    summary: 'Initial HomeOS platform launch with core modules and PocketBase backend.',
    new: [
      'Dashboard — unified home command center',
      'Maintenance Management — task tracking and vendor coordination',
      'Bill Pay — bills, expenses, and payment links',
      'Home Valuation — AVM integration and comparable sales',
      'Documents — encrypted vault with category organization',
      'Insurance Analyzer — policy tracking and coverage analysis',
      'Utilities — provider management and budget tracking',
      'Warranty Tracker — warranty storage and expiration alerts',
      'Home Timeline — property event history',
      'Learning Hub — homeowner education and guides',
      'Property Tax — assessment tracking and appeal guidance',
      'Rental Properties — multi-unit management',
      'Plants/Landscaping — service schedule and seasonal guide',
      'Ready to Sell — pre-listing checklist',
    ],
    improved: [],
    fixed: [],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// RELEASE ENTRY
// ═══════════════════════════════════════════════════════════════════════

const TAG_STYLES = {
  new: { label: 'New', icon: Sparkles, color: '#059669', bg: '#ecfdf5' },
  improved: { label: 'Improved', icon: TrendingUp, color: '#2563eb', bg: '#eff6ff' },
  fixed: { label: 'Fixed', icon: Wrench, color: '#d97706', bg: '#fffbeb' },
};

const ChangeTag = ({ type }) => {
  const s = TAG_STYLES[type];
  const Icon = s.icon;
  return (
    <div className="flex items-center gap-1" style={{ background: s.bg, padding: '2px 8px', borderRadius: '999px', width: 'fit-content' }}>
      <Icon style={{ width: '11px', height: '11px', color: s.color }} />
      <span style={{ fontSize: '11px', fontWeight: 700, color: s.color }}>{s.label}</span>
    </div>
  );
};

const ReleaseEntry = ({ release, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: `1px solid ${release.latest ? '#c7d7eb' : '#e2e8f0'}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {release.latest && (
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #1e3a5f, #e8604c)' }} />
      )}
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between text-left" style={{ padding: '20px 28px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
              <p className="font-extrabold text-slate-900" style={{ fontSize: '20px' }}>{release.version}</p>
              {release.latest && (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a5f', background: '#eef2f8', padding: '2px 8px', borderRadius: '999px' }}>Latest</span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '3px' }}>{release.date}</p>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>{release.summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <div className="flex items-center gap-2">
            {release.new.length > 0 && <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '999px' }}>{release.new.length} new</span>}
            {release.improved.length > 0 && <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '999px' }}>{release.improved.length} improved</span>}
            {release.fixed.length > 0 && <span style={{ fontSize: '12px', fontWeight: 600, color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '999px' }}>{release.fixed.length} fixed</span>}
          </div>
          {open
            ? <ChevronUp style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
            : <ChevronDown style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
          }
        </div>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {['new', 'improved', 'fixed'].map(type => {
            const items = release[type];
            if (!items || items.length === 0) return null;
            return (
              <div key={type}>
                <div style={{ marginBottom: '10px' }}><ChangeTag type={type} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: TAG_STYLES[type].color, flexShrink: 0, marginTop: '8px' }} />
                      <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const ChangelogPage = () => (
  <>
    <Helmet><title>Changelog — HomeOS</title></Helmet>
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: '#1e3a5f', padding: '80px 32px 64px' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-5" style={{ width: '500px', height: '500px', background: '#e8604c', top: '-120px', right: '-80px' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center" style={{ marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
          </div>
          <h1 className="font-semibold text-white" style={{ fontSize: '44px', lineHeight: '1.15', marginBottom: '16px' }}>Changelog</h1>
          <p className="text-blue-200" style={{ fontSize: '17px', lineHeight: '1.75', maxWidth: '420px', margin: '0 auto 20px' }}>
            See what's new in HomeOS.
          </p>
          {/* Tag legend */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {['new', 'improved', 'fixed'].map(type => {
              const s = TAG_STYLES[type];
              const Icon = s.icon;
              return (
                <div key={type} className="flex items-center gap-1.5" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                  {s.label}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Releases */}
      <section style={{ padding: '64px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {RELEASES.map((release, i) => (
            <FadeIn key={release.version} delay={i * 60}>
              <ReleaseEntry release={release} defaultOpen={i === 0} />
            </FadeIn>
          ))}
        </div>
      </section>

    </div>
  </>
);

export default ChangelogPage;
