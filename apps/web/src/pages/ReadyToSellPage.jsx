import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, Wrench, FileText, ShieldCheck, Camera, Users,
  TrendingUp, Clock, Download, Share2, Star, ArrowRight,
  X, CheckCircle2, ChevronRight, Receipt, Zap, Award
} from 'lucide-react';

// ─── Dossier Modal ────────────────────────────────────────────────────
const DossierModal = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(15,23,42,0.6)' }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
      <div className="relative p-7 pb-5" style={{ background: '#1e3a5f' }}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <X className="w-4 h-4 text-white/70" />
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#e8604c' }}>
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Your Home Dossier</p>
            <h2 className="text-white font-extrabold text-lg leading-tight">Ready when you are</h2>
          </div>
        </div>
        <p className="text-blue-200 text-sm leading-relaxed">
          Your home's full history is compiled and ready to share.
        </p>
      </div>
      <div className="p-5 space-y-3">
        {[
          { icon: <Download className="w-5 h-5" />, label: 'Download Dossier', sub: 'PDF report, ready to print or send', color: '#1e3a5f', bg: '#eef2f8' },
          { icon: <Share2 className="w-5 h-5" />, label: 'Share with My Agent', sub: 'Send a secure link to your agent', color: '#e8604c', bg: '#fdf1ef' },
          { icon: <Star className="w-5 h-5" />, label: 'Get Pre-Listing Recommendations', sub: 'See what to fix, stage, or highlight', color: '#7c3aed', bg: '#f5f3ff' },
          { icon: <FileText className="w-5 h-5" />, label: 'View Dossier', sub: 'Browse your full home history', color: '#059669', bg: '#ecfdf5' },
        ].map((action, i) => (
          <button key={i} className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-left group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: action.bg }}>
              <span style={{ color: action.color }}>{action.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">{action.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{action.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
          </button>
        ))}
      </div>
      <div className="px-5 pb-5">
        <p className="text-xs text-slate-400 text-center">Selling soon? Your home's story is already written.</p>
      </div>
    </div>
  </div>
);

// ─── CTA Button ───────────────────────────────────────────────────────
const CTAButton = ({ onClick, label = 'Generate Home Dossier', large = false }) => (
  <div className="flex flex-col items-center gap-2">
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 font-bold text-white transition-all hover:opacity-90 active:scale-95 rounded-2xl ${large ? 'px-8 py-4 text-base' : 'px-6 py-3.5 text-sm'}`}
      style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <Home className={large ? 'w-5 h-5' : 'w-4 h-4'} />
      {label}
      <ArrowRight className={large ? 'w-5 h-5' : 'w-4 h-4'} />
    </button>
    <p className="text-xs text-slate-400">Selling soon? Your home's story is already written.</p>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────
const ReadyToSellPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const DOSSIER_ITEMS = [
    { icon: Wrench, label: 'Full maintenance & repair history', color: '#f97316', bg: '#fff7ed' },
    { icon: Receipt, label: 'Renovation notes and receipts', color: '#2563eb', bg: '#eff6ff' },
    { icon: Clock, label: 'Appliance & system ages', color: '#1e3a5f', bg: '#eef2f8' },
    { icon: ShieldCheck, label: 'Insurance claims', color: '#dc2626', bg: '#fef2f2' },
    { icon: Users, label: 'Contractor records', color: '#0369a1', bg: '#f0f9ff' },
    { icon: Camera, label: 'Photos & documents', color: '#7c3aed', bg: '#f5f3ff' },
    { icon: Star, label: 'Pre-listing recommendations', color: '#e8604c', bg: '#fdf1ef' },
    { icon: TrendingUp, label: 'Estimated valuation & comps', color: '#059669', bg: '#ecfdf5' },
  ];

  const STEPS = [
    { step: '1', title: 'Live your life.', body: 'CasaCEO captures everything in the background — repairs, upgrades, documents, and more.' },
    { step: '2', title: 'Tap Generate Home Dossier.', body: 'When you\'re ready to sell, one tap compiles your complete home history.' },
    { step: '3', title: 'Download or share.', body: 'Send it to your agent, download it as a PDF, or use it to prepare your listing.' },
    { step: '4', title: 'Sell with confidence.', body: 'Your home\'s full story is complete, verified, and ready for buyers.' },
  ];

  return (
    <>
      <Helmet><title>Ready to Sell — CasaCEO</title></Helmet>

      <div className="min-h-screen bg-slate-50">

        {/* ── Nav ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-sm">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg hidden sm:block" style={{ color: '#1e3a5f' }}>
              Casa<span style={{ color: '#c9a96e' }}>CEO</span>
            </span>
          </Link>
          <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-700">← Back to Dashboard</Link>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

          {/* ── HERO ── */}
          <section className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
              When you're ready to sell,<br />
              <span style={{ color: '#1e3a5f' }}>your home is already ready.</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
              CasaCEO quietly builds your home's digital history — so when it's time to sell, everything you need is already organized.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <CTAButton onClick={() => setModalOpen(true)} large />
              <button className="text-sm font-semibold underline underline-offset-4" style={{ color: '#1e3a5f' }}>
                Learn how it works
              </button>
            </div>
          </section>

          {/* ── SECTION 1 — The Problem ── */}
          <section className="bg-white rounded-3xl border border-slate-100 p-10 shadow-sm space-y-5">
            <h2 className="text-2xl font-extrabold text-slate-900">Selling a home shouldn't mean starting from scratch.</h2>
            <div className="space-y-4 text-slate-500 text-base leading-relaxed">
              <p>Most homeowners scramble when it's time to sell. Documents are scattered. Receipts are missing. Maintenance history is forgotten. Contractor details are buried in old emails.</p>
              <p>Buyers want transparency. Agents want clarity. Insurers want documentation.</p>
              <p>But the home — the largest asset most families own — has no memory.</p>
              <p className="font-bold text-slate-800">CasaCEO fixes that.</p>
            </div>
          </section>

          {/* ── SECTION 2 — The Solution ── */}
          <section className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-extrabold text-slate-900">Your home's story, captured automatically.</h2>
              <p className="text-slate-500 text-base max-w-lg mx-auto">
                CasaCEO keeps track of everything that happens inside your home. When you're ready to sell, it turns all of this into a Home Dossier — a clean, complete, verified history.
              </p>
              <p className="font-bold text-base" style={{ color: '#1e3a5f' }}>It's the seller's version of CarFax.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Repairs', 'Upgrades', 'Maintenance', 'Contractors', 'Insurance claims', 'Appliances & systems', 'Renovations', 'Photos & documents'].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-slate-700 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── SECTION 3 — The Dossier ── */}
          <section className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-extrabold text-slate-900">One tap. Complete transparency.</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DOSSIER_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <p className="text-slate-700 font-medium text-sm">{item.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center pt-2">
              <p className="text-lg font-extrabold text-slate-900 mb-6">You don't prepare your home for sale.<br />CasaCEO already did.</p>
              <CTAButton onClick={() => setModalOpen(true)} />
            </div>
          </section>

          {/* ── SECTION 4 — Relationship Loop ── */}
          <section className="rounded-3xl p-10 space-y-4" style={{ background: '#fdf1ef', border: '1px solid #f5cdc6' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#e8604c' }}>
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Reconnect with your agent instantly.</h2>
            </div>
            <p className="text-slate-600 text-base leading-relaxed">
              If you worked with an agent or brokerage, your Home Dossier can be shared with them in one tap. No searching. No scanning. No guesswork.
            </p>
            <p className="text-slate-600 text-base leading-relaxed">
              The relationship doesn't end at closing — it continues through the entire ownership lifecycle. This is the missing link in real estate.
            </p>
          </section>

          {/* ── SECTION 5 — Why It Matters ── */}
          <section className="space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900 text-center">Homes with documented histories sell faster and for more.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <Users className="w-5 h-5" />, title: 'Buyers trust it', body: 'Clear histories reduce doubt and speed up decisions.', color: '#2563eb', bg: '#eff6ff' },
                { icon: <Award className="w-5 h-5" />, title: 'Agents love it', body: 'Complete documentation makes listings stand out.', color: '#7c3aed', bg: '#f5f3ff' },
                { icon: <Zap className="w-5 h-5" />, title: 'Transactions move faster', body: 'Less back-and-forth, fewer surprises, smoother closes.', color: '#059669', bg: '#ecfdf5' },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                    <span style={{ color: card.color }}>{card.icon}</span>
                  </div>
                  <p className="font-bold text-slate-900">{card.title}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── SECTION 6 — How It Works ── */}
          <section className="space-y-8">
            <h2 className="text-2xl font-extrabold text-slate-900 text-center">Simple. Automatic. Ready when you are.</h2>
            <div className="space-y-4">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-start gap-5 bg-white rounded-2xl border border-slate-100 p-6">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-white text-sm flex-shrink-0" style={{ background: '#1e3a5f' }}>
                    {s.step}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1">{s.title}</p>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── SECTION 7 — Final CTA ── */}
          <section className="rounded-3xl p-12 text-center space-y-6" style={{ background: '#1e3a5f' }}>
            <h2 className="text-3xl font-extrabold text-white">Ready to sell?</h2>
            <p className="text-blue-200 text-base max-w-md mx-auto leading-relaxed">
              Your home's full history is already organized. Your Home Dossier is one tap away.
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-95"
                style={{ background: '#1A1A1A' }}
              >
                <Home className="w-5 h-5" />
                Generate Home Dossier
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-blue-300 text-xs">Selling soon? Your home's story is already written.</p>
              <Link to="/dashboard" className="text-blue-300 text-sm font-semibold underline underline-offset-4 hover:text-white transition-colors mt-1">
                Explore CasaCEO
              </Link>
            </div>
          </section>

        </main>
      </div>

      {modalOpen && <DossierModal onClose={() => setModalOpen(false)} />}
    </>
  );
};

export default ReadyToSellPage;
