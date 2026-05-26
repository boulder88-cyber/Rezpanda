import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, Wrench, FileText, ShieldCheck, Camera, Users,
  TrendingUp, Clock, Download, Share2, Star, ArrowRight,
  X, CheckCircle2, Sparkles, ChevronRight, BookOpen, Receipt
} from 'lucide-react';

// ─── Dossier Modal ────────────────────────────────────────────────────
const DossierModal = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(15,23,42,0.5)' }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

      {/* Modal Header */}
      <div className="relative p-7 pb-5" style={{ background: '#1e3a5f' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
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
          Your home's full history is compiled and ready to share. Choose how you'd like to use it.
        </p>
      </div>

      {/* Modal Actions */}
      <div className="p-5 space-y-3">
        {[
          {
            icon: <Download className="w-5 h-5" />,
            label: 'Download Dossier',
            sub: 'PDF report, ready to print or send',
            color: '#1e3a5f',
            bg: '#eef2f8',
          },
          {
            icon: <Share2 className="w-5 h-5" />,
            label: 'Share with My Agent',
            sub: 'Send a secure link to your agent',
            color: '#e8604c',
            bg: '#fdf1ef',
          },
          {
            icon: <Star className="w-5 h-5" />,
            label: 'Get Pre-Listing Recommendations',
            sub: 'See what to fix, stage, or highlight',
            color: '#7c3aed',
            bg: '#f5f3ff',
          },
          {
            icon: <FileText className="w-5 h-5" />,
            label: 'View Dossier',
            sub: 'Browse your full home history',
            color: '#059669',
            bg: '#ecfdf5',
          },
        ].map((action, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-left group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
              style={{ background: action.bg }}
            >
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
        <p className="text-xs text-slate-400 text-center">
          Selling soon? Your home's story is already written.
        </p>
      </div>
    </div>
  </div>
);

// ─── Dossier Items ────────────────────────────────────────────────────
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

// ─── Main Page ────────────────────────────────────────────────────────
const ReadyToSellPage = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Ready to Sell — CasaCEO</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50">

        {/* ── Top Nav Bar ── */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between shadow-sm">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg hidden sm:block" style={{ color: '#1e3a5f' }}>
              Casa<span style={{ color: '#c9a96e' }}>CEO</span>
            </span>
          </Link>
          <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            ← Back to Dashboard
          </Link>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

          {/* ── Hero Section ── */}
          <div className="rounded-3xl overflow-hidden relative" style={{ background: '#1e3a5f' }}>
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-5" style={{ background: '#c9a96e', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5" style={{ background: '#e8604c', transform: 'translate(-20%, 30%)' }} />

            <div className="relative z-10 p-10 sm:p-14">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-white/80 text-xs font-semibold uppercase tracking-wide">Seller Feature</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4 max-w-xl">
                When you're ready to sell, your home is already ready.
              </h1>
              <p className="text-blue-200 text-base leading-relaxed max-w-lg mb-8">
                CasaCEO quietly builds your home's digital history — so when it's time to sell,
                everything you need is already organized.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <Home className="w-4 h-4" />
                  Ready to Sell
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-blue-300 text-xs">Selling soon? Your home's story is already written.</p>
              </div>
            </div>
          </div>

          {/* ── What Is a Home Dossier ── */}
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your Home Dossier</h2>
              <p className="text-slate-500 text-base max-w-xl mx-auto">
                Think of it as the CarFax for your home — a verified, agent-ready record that increases
                trust, reduces friction, and helps you sell for more.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DOSSIER_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: item.bg }}
                    >
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
          </div>

          {/* ── Value Statement ── */}
          <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: '#eef2f8' }}>
              <TrendingUp className="w-7 h-7" style={{ color: '#1e3a5f' }} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
              You don't start from scratch.<br />You start from prepared.
            </h2>
            <p className="text-slate-500 text-base max-w-md mx-auto mb-8">
              Every repair, upgrade, document, warranty, and contractor interaction is captured
              automatically. One tap generates a complete, seller-ready package.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#1A1A1A' }}
            >
              <Home className="w-4 h-4" />
              Generate Home Dossier
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── Relationship Loop Block ── */}
          <div
            className="rounded-3xl p-10 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #fdf1ef 0%, #fff5f0 100%)', border: '1px solid #f5cdc6' }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20" style={{ background: '#e8604c', transform: 'translate(30%, -30%)' }} />
            <div className="relative z-10 max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5" style={{ background: '#fde8e4' }}>
                <Share2 className="w-3.5 h-3.5" style={{ color: '#e8604c' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#e8604c' }}>Agent Connection</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
                Your next transaction starts here.
              </h2>
              <p className="text-slate-600 text-base leading-relaxed mb-4">
                CasaCEO keeps your home's story alive — and when you're ready to sell, it reconnects
                you with the people who helped you buy it.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                If you worked with an agent or brokerage, your Home Dossier can be shared with them
                instantly for a smoother, faster, more informed sale. The relationship doesn't end at
                closing — it continues through the entire ownership lifecycle.
              </p>
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl border border-slate-100 p-6 gap-4 shadow-sm">
            <div>
              <p className="font-bold text-slate-900 text-base">Your home's full history is captured automatically.</p>
              <p className="text-slate-400 text-sm mt-0.5">When you're ready to sell, you're one tap away.</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
              style={{ background: '#1e3a5f' }}
            >
              Ready to Sell <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </main>
      </div>

      {/* ── Modal ── */}
      {modalOpen && <DossierModal onClose={() => setModalOpen(false)} />}
    </>
  );
};

export default ReadyToSellPage;
