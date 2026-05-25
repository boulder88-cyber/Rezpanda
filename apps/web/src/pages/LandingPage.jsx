import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import {
  Building2, Wrench, LineChart, ArrowRight, CheckCircle2,
  Receipt, FileText, Landmark, Shield, Home,
  DollarSign, Bell, Users, BadgeCheck, Quote,
  Lock, Eye, Database, ShieldCheck, Zap, BarChart2,
  Key, Clock, Layers, X, Menu, Star, ChevronDown
} from 'lucide-react';

// ─── Sticky Header ────────────────────────────────────────────────────
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'
    } px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white">Casa<span style={{ color: '#e8604c' }}>CEO</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/80">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#contractors" className="hover:text-white transition-colors">For Contractors</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10 font-semibold rounded-full px-6">Log In</Button>
          </Link>
          <Link to="/signup">
            <Button className="font-bold px-6 rounded-full shadow-lg" style={{ background: '#e8604c' }}>
              Start Free
            </Button>
          </Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-white/10 px-4 py-6 space-y-4">
          <a href="#features" onClick={() => setMenuOpen(false)} className="block text-white/80 font-semibold py-2">Features</a>
          <a href="#contractors" onClick={() => setMenuOpen(false)} className="block text-white/80 font-semibold py-2">For Contractors</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="block text-white/80 font-semibold py-2">Pricing</a>
          <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <Link to="/login"><Button variant="outline" className="w-full text-white border-white/20 rounded-full">Log In</Button></Link>
            <Link to="/signup"><Button className="w-full text-white rounded-full font-bold" style={{ background: '#e8604c' }}>Start Free</Button></Link>
          </div>
        </div>
      )}
    </header>
  );
};

// ─── Dashboard Mockup ─────────────────────────────────────────────────
const DashboardMockup = () => (
  <div className="relative w-full max-w-2xl mx-auto">
    <div className="absolute inset-0 rounded-3xl scale-110 blur-3xl opacity-40" style={{ background: '#1e3a5f' }}></div>
    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 blur-3xl opacity-10" style={{ background: '#e8604c' }}></div>
    <div className="relative bg-slate-800 rounded-2xl border border-white/10 shadow-2xl overflow-hidden lg:scale-105 lg:origin-left">
      <div className="bg-slate-900 px-4 py-3 flex items-center gap-2 border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500 opacity-80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500 opacity-80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 opacity-80"></div>
        </div>
        <div className="flex-1 mx-4 bg-slate-700 rounded-md h-6 flex items-center px-3">
          <span className="text-slate-400 text-xs">casaceo.com/dashboard</span>
        </div>
      </div>
      <div className="p-4 bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1e3a5f] flex items-center justify-center">
              <Home className="w-3 h-3 text-white" />
            </div>
            <span className="text-white text-xs font-bold">Casa<span className="text-[#e8604c]">CEO</span></span>
          </div>
          <div className="bg-slate-700 rounded-lg px-3 py-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-slate-300 text-xs">Primary Home</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
        </div>
        <div className="bg-[#1e3a5f] rounded-xl p-3 mb-3">
          <p className="text-white text-xs font-bold">Good morning! 👋</p>
          <p className="text-blue-200 text-xs">3 items need attention today</p>
        </div>
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between bg-red-500/15 border border-red-500/20 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span className="text-red-300 text-xs font-medium">Roof Inspection Due</span>
            </div>
            <span className="text-red-300 text-xs">Lake House</span>
          </div>
          <div className="flex items-center justify-between bg-orange-500/15 border border-orange-500/20 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400"></div>
              <span className="text-orange-300 text-xs font-medium">HVAC Service Overdue</span>
            </div>
            <span className="text-orange-300 text-xs">Primary Home</span>
          </div>
          <div className="flex items-center justify-between bg-blue-500/15 border border-blue-500/20 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-blue-300 text-xs font-medium">Property Tax Due in 14 days</span>
            </div>
            <span className="text-blue-300 text-xs">$2,840</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: '🔧', label: 'Maintenance', color: 'bg-orange-500/20' },
            { icon: '💳', label: 'Bill Pay', color: 'bg-blue-500/20' },
            { icon: '📁', label: 'Documents', color: 'bg-purple-500/20' },
            { icon: '💰', label: 'Expenses', color: 'bg-green-500/20' },
            { icon: '⚡', label: 'Utilities', color: 'bg-yellow-500/20' },
            { icon: '📈', label: 'Home Value', color: 'bg-teal-500/20' },
            { icon: '🔑', label: 'Rentals', color: 'bg-pink-500/20' },
            { icon: '🛡️', label: 'Warranty', color: 'bg-indigo-500/20' },
          ].map((m, i) => (
            <div key={i} className={`${m.color} rounded-lg p-2 flex flex-col items-center gap-1`}>
              <span className="text-sm">{m.icon}</span>
              <span className="text-slate-300 text-xs text-center leading-tight">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Floating bill due bubble */}
    <div className="absolute -right-4 top-20 bg-white rounded-xl p-3 w-44 border border-red-100 hidden lg:block" style={{ boxShadow: '0 0 0 3px rgba(232,96,76,0.15), 0 8px 24px rgba(0,0,0,0.12)' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
          <Bell className="w-3 h-3 text-red-500" />
        </div>
        <span className="text-slate-700 text-xs font-bold">⚡ Bill Due</span>
      </div>
      <p className="text-slate-600 text-xs">Electric bill due in 2 days</p>
      <p className="text-xs font-bold mt-1" style={{ color: '#e8604c' }}>$142.00 — Pay Now →</p>
    </div>

    {/* Floating portfolio value */}
    <div className="absolute -left-4 bottom-20 bg-white rounded-xl shadow-xl p-3 w-40 border border-slate-100 hidden lg:block">
      <p className="text-slate-500 text-xs mb-1">Portfolio Value</p>
      <p className="text-slate-900 text-base font-extrabold">$1.24M</p>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-green-500 text-xs font-bold">↑ 8.3%</span>
        <span className="text-slate-400 text-xs">this year</span>
      </div>
    </div>
  </div>
);

// ─── Feature Groups ───────────────────────────────────────────────────
const FEATURE_GROUPS = [
  {
    category: 'Organize', color: '#1e3a5f', bg: '#eef2f8', icon: <Layers className="w-5 h-5" />,
    features: [
      { icon: <Home className="w-6 h-6" />, title: 'Property Dashboard', description: 'Every home at a glance — mortgage, utilities, maintenance, and expenses all in one view.' },
      { icon: <FileText className="w-6 h-6" />, title: 'Document Vault', description: 'Insurance policies, warranties, deeds, permits — organized by property, always accessible.' },
      { icon: <ShieldCheck className="w-6 h-6" />, title: 'Warranty Tracker', description: 'Never let an appliance or system warranty expire without knowing. Track coverage across every home.' },
    ]
  },
  {
    category: 'Automate', color: '#e8604c', bg: '#fdf0ee', icon: <Zap className="w-5 h-5" />,
    features: [
      { icon: <Bell className="w-6 h-6" />, title: 'Smart Reminders', description: 'Never miss a payment or inspection. CasaCEO alerts you before things slip through the cracks.' },
      { icon: <Receipt className="w-6 h-6" />, title: 'Bill Pay Tracking', description: 'Track every bill, see what\'s due, and log payments with one click across all properties.' },
      { icon: <Wrench className="w-6 h-6" />, title: 'Maintenance Scheduling', description: 'Log service calls, schedule recurring maintenance, and build a full history for every home.' },
    ]
  },
  {
    category: 'Track', color: '#059669', bg: '#ecfdf5', icon: <BarChart2 className="w-5 h-5" />,
    features: [
      { icon: <DollarSign className="w-6 h-6" />, title: 'Expense Tracking', description: 'Track every expense across all properties. Export for taxes in one click.' },
      { icon: <LineChart className="w-6 h-6" />, title: 'Home Valuation', description: 'Track property values, compare to the market, and decide when to sell or stay.' },
      { icon: <Receipt className="w-6 h-6" />, title: 'Tax Reports', description: 'Rental income, deductions, depreciation — ready for your accountant at year end.' },
    ]
  },
  {
    category: 'Connect', color: '#7c3aed', bg: '#f5f3ff', icon: <Users className="w-5 h-5" />,
    features: [
      { icon: <Users className="w-6 h-6" />, title: 'Contractor Directory', description: 'Verified, reviewed contractors at your fingertips — attached to the property they serviced.' },
      { icon: <Building2 className="w-6 h-6" />, title: 'Landscape & Plants', description: 'Schedule and track landscaping, lawn care, and plant maintenance across all your properties.' },
      { icon: <Key className="w-6 h-6" />, title: 'Rental Management', description: 'Tenant management, rent tracking, lease storage, and maintenance requests for rental properties.' },
    ]
  },
];

// ─── Main Landing Page ────────────────────────────────────────────────
const LandingPage = () => {
  return (
    <>
      <Helmet>
        <title>CasaCEO — Your home deserves an operating system.</title>
        <meta name="description" content="CasaCEO is the command center for every home you own — bills, maintenance, documents, and valuations all in one place." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,95,0.18)_0%,transparent_70%)]"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 w-full">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-5 py-2 rounded-full border border-white/10 mb-8">
                  <Home className="w-4 h-4" style={{ color: '#e8604c' }} />
                  Built by a multi-property owner who conquered the chaos
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                  <span className="font-light">Your home deserves</span><br />
                  <span className="font-light">an operating</span><br />
                  <span style={{ color: '#e8604c' }} className="font-extrabold">system.</span>
                </h1>

                <p className="text-xl text-slate-300 mb-10 max-w-xl leading-relaxed">
                  CasaCEO is the command center for every home you own — bills, maintenance, documents, and valuations all in one place. Finally, your home runs like an asset, not an inbox.
                </p>

                <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-8">
                  <Link to="/signup">
                    <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-7 rounded-full text-white shadow-lg font-bold" style={{ background: '#e8604c' }}>
                      Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 py-7 rounded-full bg-white/5 text-white border-white/20 hover:bg-white/10 font-semibold">
                      See the Dashboard
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm font-semibold text-slate-300 mb-8">
                  {["No credit card required", "1 property free forever", "Setup in under 5 minutes"].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                      <CheckCircle2 className="w-4 h-4" style={{ color: '#e8604c' }} /> {t}
                    </div>
                  ))}
                </div>

                {/* Testimonial under hero */}
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 max-w-lg">
                  <div className="flex-shrink-0">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400 inline" />)}
                  </div>
                  <p className="text-slate-300 text-sm italic">"Finally, a dashboard that makes owning multiple homes feel effortless." <span className="text-slate-400 not-italic">— Early Beta User</span></p>
                </div>
              </div>

              <div className="lg:w-1/2 w-full">
                <DashboardMockup />
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white/40 text-xs font-medium tracking-widest uppercase">See how it works</span>
            <ChevronDown className="w-5 h-5 text-white/30" />
          </div>
        </section>

        {/* ── FOUNDER STORY ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <div className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-8 border" style={{ background: '#eef2f8', color: '#1e3a5f', borderColor: '#c7d5e8' }}>
                  <Quote className="w-4 h-4" /> Why We Built This
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                  "I bought a second home — and everything fell apart."
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-4">
                  Two sets of utility bills. Two mortgage payments. Two maintenance schedules. Zero way to keep it straight.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed mb-4">
                  I wasn't a landlord or a property manager — just someone who owns more than one home and needed to stay on top of it. No tool existed for people like me.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">So we built it.</p>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ background: '#1e3a5f' }}>D</div>
                  <div>
                    <p className="font-bold text-slate-900">Dan E.</p>
                    <p className="text-slate-500 text-sm">Founder, CasaCEO</p>
                    <p className="text-slate-400 text-xs mt-0.5">Multi-property owner · Atlanta, GA</p>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 grid grid-cols-2 gap-6 w-full">
                {[
                  { value: "2+", label: "Properties managed per user on average", color: "bg-[#1e3a5f]/5 border-[#1e3a5f]/10" },
                  { value: "$3,200", label: "Average annual savings tracked per home", color: "bg-green-50 border-green-100" },
                  { value: "47 min", label: "Saved per week on property admin tasks", color: "bg-purple-50 border-purple-100" },
                  { value: "1 place", label: "For every bill, doc, service call & expense", color: "bg-amber-50 border-amber-100" },
                ].map((stat, i) => (
                  <div key={i} className={`p-6 rounded-2xl border ${stat.color} flex flex-col`}>
                    <span className="text-3xl font-extrabold text-slate-900 mb-2">{stat.value}</span>
                    <span className="text-sm text-slate-600 leading-snug">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── BEFORE / AFTER ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Sound familiar?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Every multi-property owner hits the same wall. CasaCEO tears it down.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2"><span className="text-2xl">😩</span> Before CasaCEO</h3>
                <ul className="space-y-4">
                  {[
                    "Utility bills scattered across 3 different email accounts",
                    "No idea when the HVAC was last serviced at property #2",
                    "Missed a payment because it slipped through the cracks",
                    "Couldn't remember which contractor fixed the roof last year",
                    "Tax season meant hunting through a year of receipts",
                    "Plants dying because you forgot who handles the landscaping",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700">
                      <span className="text-red-400 mt-0.5 flex-shrink-0 font-bold">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-green-700 mb-6 flex items-center gap-2"><span className="text-2xl">😌</span> After CasaCEO</h3>
                <ul className="space-y-4">
                  {[
                    "Every utility for every property in one dashboard",
                    "Maintenance history logged, searchable, and scheduled",
                    "Payment reminders before anything slips through",
                    "Contractor directory attached to each property",
                    "Expense reports ready for your accountant in minutes",
                    "Plant and landscape schedules running on autopilot",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Everything your homes need. Nothing they don't.</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Purpose-built for people who own more than one home and just need to stay on top of it.</p>
            </div>
            {FEATURE_GROUPS.map((group, gi) => (
              <div key={gi} className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: group.bg, color: group.color }}>{group.icon}</div>
                  <h3 className="text-xl font-extrabold text-slate-900">{group.category}</h3>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {group.features.map((f, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: group.bg, color: group.color }}>{f.icon}</div>
                      <h4 className="text-base font-bold text-slate-900 mb-2">{f.title}</h4>
                      <p className="text-slate-500 leading-relaxed text-sm">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECURITY ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-green-100">
                <ShieldCheck className="w-4 h-4" /> Your data is safe with us
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Bank-level security for your most important data</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">You're trusting us with financial records, legal documents, and home data. We take that seriously.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { icon: <Lock className="w-6 h-6 text-green-600" />, title: 'End-to-End Encryption', desc: 'All your data is encrypted at rest and in transit using AES-256 — the same standard used by banks.', color: 'bg-green-50 border-green-100' },
                { icon: <Database className="w-6 h-6 text-blue-600" />, title: 'Secure Document Storage', desc: 'Documents are stored in encrypted cloud storage. Only you can access your files.', color: 'bg-blue-50 border-blue-100' },
                { icon: <Eye className="w-6 h-6 text-purple-600" />, title: 'Privacy First', desc: 'We never sell your data. Your financial information and property records stay yours.', color: 'bg-purple-50 border-purple-100' },
                { icon: <ShieldCheck className="w-6 h-6" style={{ color: '#e8604c' }} />, title: 'No Financial Account Access', desc: 'CasaCEO tracks your bills and expenses — we never connect to or access your bank accounts.', color: 'bg-orange-50 border-orange-100' },
                { icon: <Key className="w-6 h-6 text-amber-600" />, title: 'Secure Authentication', desc: 'Industry-standard authentication protects your account. Password reset via verified email only.', color: 'bg-amber-50 border-amber-100' },
                { icon: <Clock className="w-6 h-6 text-teal-600" />, title: '99.9% Uptime', desc: 'Your data is always available when you need it, backed by redundant cloud infrastructure.', color: 'bg-teal-50 border-teal-100' },
              ].map((item, i) => (
                <div key={i} className={`rounded-2xl border p-6 ${item.color}`}>
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">{item.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-around gap-6 text-center">
              {[
                { icon: <Lock className="w-8 h-8 text-slate-400" />, label: 'AES-256\nEncryption' },
                { icon: <ShieldCheck className="w-8 h-8 text-slate-400" />, label: 'SOC2\nCompliance Roadmap' },
                { icon: <Eye className="w-8 h-8 text-slate-400" />, label: 'Zero Data\nSelling Policy' },
                { icon: <Database className="w-8 h-8 text-slate-400" />, label: 'GDPR\nReady' },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  {badge.icon}
                  <p className="text-slate-500 text-xs font-medium whitespace-pre-line leading-relaxed">{badge.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTRACTORS ── */}
        <section id="contractors" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <div className="inline-flex items-center gap-2 bg-white/10 text-sm font-semibold px-4 py-2 rounded-full mb-8 border border-white/10" style={{ color: '#e8604c' }}>
                  <BadgeCheck className="w-4 h-4" /> Verified Contractor Network
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
                  The right contractor, <span style={{ color: '#e8604c' }}>already at your fingertips</span>
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed mb-6">
                  CasaCEO connects you with pre-vetted, licensed contractors in your area. Every contractor is verified, reviewed by real property owners, and linked directly to your service history.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed mb-10">
                  No more cold calls. No more Googling. When something breaks, you know exactly who to call — and every job gets logged automatically.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["Plumbing", "Electrical", "HVAC", "Landscaping", "Roofing", "Pest Control", "Painting", "General Repair"].map((cat, i) => (
                    <span key={i} className="px-4 py-2 bg-white/10 text-slate-300 text-sm font-medium rounded-full border border-white/10">{cat}</span>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: '#1e3a5f' }}>JM</div>
                      <div>
                        <p className="font-bold text-white">Johnson & Miller HVAC</p>
                        <p className="text-slate-400 text-sm">Licensed & Insured · Atlanta, GA</p>
                      </div>
                    </div>
                    <BadgeCheck className="w-6 h-6 flex-shrink-0" style={{ color: '#e8604c' }} />
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    <span className="text-slate-400 text-sm ml-2">4.9 (127 reviews)</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 italic">"Fixed our AC at the lake house same day. Fast, clean, fair price. Job logged to CasaCEO automatically."</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs">Last used: 3 months ago · Property #2</span>
                    <Button size="sm" className="text-white rounded-full text-xs px-4" style={{ background: '#1e3a5f' }}>Book Again</Button>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-blue-300 text-sm font-medium">
                    🏆 <strong>Are you a contractor?</strong> Get listed and reach thousands of motivated property owners.
                  </p>
                  <Link to="/signup">
                    <button className="mt-3 text-sm font-semibold underline underline-offset-2 transition-colors" style={{ color: '#e8604c' }}>
                      Apply for Contractor Listing →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">What property owners are saying</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { quote: "I own three homes and was drowning in spreadsheets. CasaCEO gave me a single place for everything. I actually look forward to checking my dashboard now.", name: "Marcus T.", role: "Owns 3 properties · Atlanta, GA" },
                { quote: "The contractor directory alone is worth the price. Found a great HVAC tech through CasaCEO, booked him, and the job got logged automatically. Zero effort.", name: "Sandra L.", role: "Owns 2 properties · Austin, TX" },
                { quote: "Tax season used to take me a week. This year I exported everything from CasaCEO and handed it straight to my accountant. Two hours total.", name: "David R.", role: "Owns 4 properties · Charlotte, NC" },
              ].map((t, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-slate-700 leading-relaxed mb-6 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ background: '#eef2f8', color: '#1e3a5f' }}>{t.name[0]}</div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-slate-500 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Simple, honest pricing</h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">Pay per property. Only pay for what you actually use.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Starter", price: "Free", period: "forever", desc: "Perfect for your first home", features: ["1 property", "Expense tracking", "Document storage", "Maintenance log", "Basic reports"], cta: "Get Started Free", highlight: false },
                { name: "Multi-Home", price: "$12", period: "per property / month", desc: "For the multi-property owner", features: ["Unlimited properties", "Full financial reports", "Contractor directory", "Bill pay tracking", "Tax export", "Priority support", "Utility management"], cta: "Start Free Trial", highlight: true },
                { name: "Contractor", price: "$49", period: "per month", desc: "Get listed & grow your business", features: ["Verified listing badge", "Property owner leads", "Review management", "Job history tracking", "Featured placement", "Direct booking"], cta: "Apply to List", highlight: false },
              ].map((plan, i) => (
                <div key={i} className={`rounded-2xl border p-8 flex flex-col relative ${plan.highlight ? 'shadow-2xl scale-105' : 'bg-white border-slate-200 shadow-lg'}`} style={plan.highlight ? { background: '#1e3a5f', borderColor: '#1e3a5f' } : {}}>
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg" style={{ background: '#e8604c' }}>MOST POPULAR</span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                    <p className={`text-sm mb-4 ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>{plan.desc}</p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                      <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-slate-500'}`}>/{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-blue-100' : 'text-slate-600'}`}>
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-[#e8604c]' : 'text-[#1e3a5f]'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button className={`w-full rounded-full font-bold ${plan.highlight ? 'bg-white text-[#1e3a5f] hover:bg-blue-50' : 'text-white hover:opacity-90'}`} style={!plan.highlight ? { background: '#1e3a5f' } : {}}>
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Stop juggling. <span style={{ color: '#e8604c' }}>Start running your homes.</span>
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Join property owners who've replaced scattered spreadsheets and forgotten service calls with one organized command center.
            </p>
            <Link to="/signup">
              <Button size="lg" className="text-xl px-14 py-8 rounded-full text-white shadow-lg font-extrabold hover:-translate-y-2 transition-all" style={{ background: '#e8604c' }}>
                Create Your Free Account <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
            <p className="mt-6 text-slate-500 text-sm">Free for your first property. No credit card needed.</p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-[#0a0f1c] text-slate-300 py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-extrabold text-white">Casa<span style={{ color: '#e8604c' }}>CEO</span></span>
              </div>
              <p className="text-slate-400 max-w-sm mb-2 leading-relaxed">Be the CEO of your homes.</p>
              <p className="text-slate-500 text-sm max-w-sm mb-4 leading-relaxed">Your personal command center for every home you own — bills, utilities, maintenance, contractors, and documents — all in one place.</p>
              <p className="text-slate-600 text-sm">Built by multi-property owners, for multi-property owners.</p>
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-5">Product</h4>
              <ul className="space-y-3 text-sm">
                {[['/', 'Home'], ['/dashboard', 'Dashboard'], ['/login', 'Sign In'], ['/signup', 'Create Account']].map(([href, label]) => (
                  <li key={href}><Link to={href} className="text-slate-400 hover:text-[#e8604c] transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-5">Contact</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>support@casaceo.com</li>
                <li><a href="#contractors" className="font-medium transition-colors" style={{ color: '#e8604c' }}>Contractor Listings →</a></li>
                <li><Link to="/signup" className="font-medium transition-colors" style={{ color: '#e8604c' }}>Get Started Free →</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} CasaCEO. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="hover:text-[#e8604c] cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-[#e8604c] cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </footer>

        {/* Mobile sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-900 border-t border-white/10 p-4 flex gap-3">
          <Link to="/login" className="flex-1">
            <Button variant="outline" className="w-full text-white border-white/20 rounded-full">Log In</Button>
          </Link>
          <Link to="/signup" className="flex-1">
            <Button className="w-full text-white rounded-full font-bold" style={{ background: '#e8604c' }}>Start Free</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
