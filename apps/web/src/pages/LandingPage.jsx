import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { CasaCEOLogo } from '@/components/Logo.jsx';
import {
  Building2, Wrench, LineChart, ArrowRight, CheckCircle2,
  Receipt, FileText, Landmark, Shield, UserPlus,
  CreditCard, TreePine, Star, ChevronDown,
  Home, DollarSign, Bell, Users, BadgeCheck, Quote
} from 'lucide-react';

const FounderStory = () => (
  <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-8">
            <Quote className="w-4 h-4" /> Why We Built This
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
            "I bought a second home and everything fell apart."
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            Suddenly I had two sets of utility bills, two mortgage payments, two cable providers, two maintenance schedules — and zero way to keep it all straight. I was running around trying to piece together what was due, what was overdue, and what I'd already paid.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            I searched for a tool that could bring it all together. Nothing existed that was built for people like me — not a landlord, not a property manager, just someone who owns more than one home and wants to stay on top of it. So we built it.
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-lg">R</div>
            <div>
              <p className="font-bold text-slate-900">The CasaCEO Team</p>
              <p className="text-slate-500 text-sm">Multi-property owners, just like you</p>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 grid grid-cols-2 gap-6 w-full">
          {[
            { value: "2+", label: "Properties managed per user on average", color: "bg-blue-50 border-blue-100" },
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
);

const ProblemSolution = () => (
  <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Sound familiar?</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Every multi-property owner hits the same wall. CasaCEO tears it down.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2">
            <span className="text-2xl">😩</span> Before CasaCEO
          </h3>
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
          <h3 className="text-xl font-bold text-green-700 mb-6 flex items-center gap-2">
            <span className="text-2xl">😌</span> After CasaCEO
          </h3>
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
);

const ContractorMarketplace = () => (
  <section id="contractors" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,58,95,0.15)_0%,transparent_60%)]"></div>
    <div className="max-w-6xl mx-auto relative z-10">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 bg-[#1e3a5f]/20 text-[#e8604c] text-sm font-semibold px-4 py-2 rounded-full mb-8 border border-[#1e3a5f]/30">
            <BadgeCheck className="w-4 h-4" /> Verified Contractor Network
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
            The right contractor, <span className="text-[#e8604c]">already at your fingertips</span>
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-6">
            CasaCEO connects you with pre-vetted, licensed contractors in your area — plumbers, electricians, HVAC techs, landscapers, and more. Every contractor is verified, reviewed by real property owners, and linked directly to your service history.
          </p>
          <p className="text-lg text-slate-300 leading-relaxed mb-10">
            No more cold calls. No more Googling. When something breaks, you know exactly who to call — and every job gets logged automatically to your property record.
          </p>
          <div className="flex flex-wrap gap-3">
            {["Plumbing", "Electrical", "HVAC", "Landscaping", "Roofing", "Pest Control", "Painting", "General Repair"].map((cat, i) => (
              <span key={i} className="px-4 py-2 bg-white/10 text-slate-300 text-sm font-medium rounded-full border border-white/10">
                {cat}
              </span>
            ))}
          </div>
        </div>
        <div className="lg:w-1/2 w-full">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/20 flex items-center justify-center text-[#e8604c] font-bold text-lg">JM</div>
                <div>
                  <p className="font-bold text-white">Johnson & Miller HVAC</p>
                  <p className="text-slate-400 text-sm">Licensed & Insured · Atlanta, GA</p>
                </div>
              </div>
              <BadgeCheck className="w-6 h-6 text-[#e8604c] flex-shrink-0" />
            </div>
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              <span className="text-slate-400 text-sm ml-2">4.9 (127 reviews)</span>
            </div>
            <p className="text-slate-400 text-sm mb-4 italic">"Fixed our AC at the lake house same day. Fast, clean, fair price. Job logged to CasaCEO automatically."</p>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">Last used: 3 months ago · Property #2</span>
              <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white rounded-full text-xs px-4">Book Again</Button>
            </div>
          </div>
          <div className="bg-[#1e3a5f]/10 border border-[#1e3a5f]/20 rounded-xl p-4 text-center">
            <p className="text-blue-300 text-sm font-medium">
              🏆 <strong>Are you a contractor?</strong> Get listed in our verified network and reach thousands of motivated property owners in your area.
            </p>
            <Link to="/signup">
              <button className="mt-3 text-[#e8604c] text-sm font-semibold hover:text-blue-300 transition-colors underline underline-offset-2">
                Apply for Contractor Listing →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Pricing = () => (
  <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Simple, honest pricing</h2>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">Pay per property. Only pay for what you actually use.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            name: "Starter", price: "Free", period: "forever",
            desc: "Perfect for your first home",
            features: ["1 property", "Expense tracking", "Document storage", "Maintenance log", "Basic reports"],
            cta: "Get Started Free", highlight: false,
          },
          {
            name: "Multi-Home", price: "$12", period: "per property / month",
            desc: "For the multi-property owner",
            features: ["Unlimited properties", "Full financial reports", "Contractor directory", "Bill pay tracking", "Tax export", "Priority support", "Utility management"],
            cta: "Start Free Trial", highlight: true,
          },
          {
            name: "Contractor", price: "$49", period: "per month",
            desc: "Get listed & grow your business",
            features: ["Verified listing badge", "Property owner leads", "Review management", "Job history tracking", "Featured placement", "Direct booking"],
            cta: "Apply to List", highlight: false,
          },
        ].map((plan, i) => (
          <div key={i} className={`rounded-2xl border p-8 flex flex-col ${plan.highlight ? 'bg-[#1e3a5f] border-blue-500 shadow-2xl shadow-[#1e3a5f]/30 scale-105' : 'bg-white border-slate-200 shadow-lg'}`}>
            <div className="mb-6">
              {plan.highlight && <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">MOST POPULAR</span>}
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
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-white' : 'text-[#1e3a5f]'}`} />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/signup">
              <Button className={`w-full rounded-full font-bold ${plan.highlight ? 'bg-white text-[#1e3a5f] hover:bg-blue-50' : 'bg-[#1e3a5f] text-white hover:bg-[#162d4a]'}`}>
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Testimonials = () => (
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
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1e3a5f] font-bold">{t.name[0]}</div>
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
);

const LandingPage = () => {
  const features = [
    { icon: <Home className="w-7 h-7 text-[#1e3a5f]" />, title: 'Property Dashboard', description: 'Every home at a glance — mortgage, utilities, maintenance, and expenses all in one view.' },
    { icon: <DollarSign className="w-7 h-7 text-[#1e3a5f]" />, title: 'Expense & Bill Tracking', description: 'Track every bill, utility, and expense across all properties. Export for taxes in one click.' },
    { icon: <Wrench className="w-7 h-7 text-[#1e3a5f]" />, title: 'Maintenance Scheduling', description: 'Log service calls, schedule recurring maintenance, and build a full history for every home.' },
    { icon: <Users className="w-7 h-7 text-[#1e3a5f]" />, title: 'Contractor Directory', description: 'Verified, reviewed contractors at your fingertips — attached to the property they serviced.' },
    { icon: <FileText className="w-7 h-7 text-[#1e3a5f]" />, title: 'Document Storage', description: 'Insurance policies, warranties, deeds, permits — organized by property, always accessible.' },
    { icon: <Bell className="w-7 h-7 text-[#1e3a5f]" />, title: 'Smart Reminders', description: "Never miss a payment or inspection. CasaCEO alerts you before things slip through the cracks." },
    { icon: <LineChart className="w-7 h-7 text-[#1e3a5f]" />, title: 'Financial Reports', description: 'Monthly and annual summaries per property. Know exactly where every dollar goes.' },
    { icon: <TreePine className="w-7 h-7 text-[#1e3a5f]" />, title: 'Landscape & Plants', description: 'Schedule and track landscaping, lawn care, and plant maintenance across all your properties.' },
    { icon: <Shield className="w-7 h-7 text-[#1e3a5f]" />, title: 'Insurance Tracker', description: 'Monitor policy expiration dates and coverage across every home you own.' },
  ];

  return (
    <>
      <Helmet>
        <title>CasaCEO — Be the CEO of your homes.</title>
        <meta name="description" content="The home management command center for multi-property owners. Track expenses, bills, maintenance, contractors, and documents — all in one place." />
      </Helmet>

      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">

        {/* Navigation */}
        <header className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-full">
            <CasaCEOLogo className="scale-75 origin-left" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/80">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#contractors" className="hover:text-white transition-colors">For Contractors</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white font-semibold rounded-full px-6">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-[0_0_20px_rgba(30,58,95,0.4)] font-bold px-6 sm:px-8 rounded-full">
                Start Free
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,95,0.18)_0%,transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full pt-32 pb-16 flex flex-col items-center">
            <div className="mb-10 relative">
              <div className="absolute inset-0 bg-[#1e3a5f] opacity-20 blur-[100px] rounded-full scale-150 animate-pulse"></div>
              <CasaCEOLogo className="scale-125 md:scale-150 lg:scale-[1.75] transform-gpu" imageClassName="drop-shadow-[0_0_30px_rgba(30,58,95,0.8)]" />
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm font-medium px-5 py-2 rounded-full border border-white/10 backdrop-blur-sm mb-8">
              <Home className="w-4 h-4 text-[#e8604c]" />
              Built by a multi-property owner who lived the chaos
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Your Homes.<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500"> Organized.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Stop running around juggling bills, utilities, service calls, and documents across multiple homes. CasaCEO is your personal command center — synced, structured, and always at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-7 rounded-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-[0_0_40px_rgba(30,58,95,0.5)] transition-all hover:-translate-y-1 font-bold">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 py-7 rounded-full bg-white/5 text-white border-white/20 hover:bg-white/10 backdrop-blur-md transition-all font-semibold">
                  Explore Dashboard
                </Button>
              </Link>
            </div>
            <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-300">
              {["No credit card required", "1 property free forever", "Setup in under 5 minutes"].map((t, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-[#e8604c]" /> {t}
                </div>
              ))}
            </div>
            <div className="mt-16 animate-bounce">
              <ChevronDown className="w-6 h-6 text-white/30" />
            </div>
          </div>
        </section>

        <FounderStory />
        <ProblemSolution />

        {/* Features */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Everything your homes need. Nothing they don't.</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Purpose-built for people who own more than one home and just need to stay on top of it.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white border border-slate-100 shadow-lg hover:shadow-xl hover:shadow-blue-600/10 hover:-translate-y-1 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 group-hover:scale-110 transition-all">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ContractorMarketplace />
        <Testimonials />
        <Pricing />

        {/* Final CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
          <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-[#1e3a5f] opacity-10 blur-[120px]"></div>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Stop juggling. <span className="text-[#e8604c]">Start running your homes.</span>
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Join property owners who've replaced scattered spreadsheets, lost receipts, and forgotten service calls with one organized command center.
            </p>
            <Link to="/signup">
              <Button size="lg" className="text-xl px-14 py-8 rounded-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-[0_0_50px_rgba(30,58,95,0.5)] transition-all hover:-translate-y-2 font-extrabold">
                Create Your Free Account <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
            <p className="mt-6 text-slate-500 text-sm">Free for your first property. No credit card needed.</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0a0f1c] text-slate-300 py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-6 inline-block">
                <CasaCEOLogo className="scale-75 origin-left" />
              </div>
              <p className="text-slate-400 max-w-sm mb-4 leading-relaxed">
                Your personal command center for every home you own. Bills, utilities, maintenance, contractors, and documents — all in one place.
              </p>
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
                <li>1-800-CASACEO</li>
                <li><a href="#contractors" className="text-[#e8604c] hover:text-blue-300 font-medium">Contractor Listings →</a></li>
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
      </div>
    </>
  );
};

export default LandingPage;
