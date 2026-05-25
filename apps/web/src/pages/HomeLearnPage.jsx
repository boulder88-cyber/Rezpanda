import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import {
  BookOpen, Search, X, ChevronRight, Star, Clock,
  Wrench, DollarSign, Shield, TrendingUp, FileText,
  Users, Zap, TreePine, Home, CheckCircle2, ShieldCheck,
  Play, ExternalLink, Lightbulb, Award, Filter
} from 'lucide-react';

// ─── Learning Categories ──────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all', label: 'All Topics', icon: <BookOpen className="w-4 h-4" />, color: '#1e3a5f', bg: '#eef2f8' },
  { key: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" />, color: '#f97316', bg: '#fff7ed' },
  { key: 'financial', label: 'Financial', icon: <DollarSign className="w-4 h-4" />, color: '#059669', bg: '#ecfdf5' },
  { key: 'insurance', label: 'Insurance', icon: <Shield className="w-4 h-4" />, color: '#e8604c', bg: '#fdf0ee' },
  { key: 'valuation', label: 'Valuation', icon: <TrendingUp className="w-4 h-4" />, color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'legal', label: 'Legal & Tax', icon: <FileText className="w-4 h-4" />, color: '#dc2626', bg: '#fef2f2' },
  { key: 'rental', label: 'Rental', icon: <Users className="w-4 h-4" />, color: '#0891b2', bg: '#ecfeff' },
  { key: 'energy', label: 'Energy', icon: <Zap className="w-4 h-4" />, color: '#d97706', bg: '#fffbeb' },
];

const DIFFICULTY = {
  beginner: { label: 'Beginner', color: '#059669', bg: '#ecfdf5' },
  intermediate: { label: 'Intermediate', color: '#d97706', bg: '#fffbeb' },
  advanced: { label: 'Advanced', color: '#dc2626', bg: '#fef2f2' },
};

// ─── Articles ─────────────────────────────────────────────────────────
const ARTICLES = [
  // Maintenance
  { id: 1, category: 'maintenance', title: 'The Complete HVAC Maintenance Guide', summary: 'Everything you need to know about keeping your heating and cooling systems running efficiently — from filter changes to annual tune-ups.', readTime: 8, difficulty: 'beginner', featured: true, emoji: '❄️',
    content: [
      { heading: 'Why HVAC Maintenance Matters', body: 'Your HVAC system is one of the most expensive components in your home — replacement costs range from $5,000 to $12,000. Regular maintenance extends its life by 5-10 years and keeps energy bills 15-25% lower.' },
      { heading: 'Monthly: Change Your Air Filter', body: 'A clogged filter forces your system to work harder, increasing energy consumption and causing premature wear. Use MERV 8-11 rated filters. Mark your calendar for the first of every month.' },
      { heading: 'Annually: Professional Tune-Up', body: 'A certified HVAC technician should inspect refrigerant levels, clean coils, check electrical connections, and lubricate moving parts. Budget $80-150 per unit per year.' },
      { heading: 'Seasonal Checklist', body: 'Spring: Test AC before heat arrives. Check condensate drain. Fall: Test heat before cold arrives. Replace batteries in thermostat. Check vents for obstructions.' },
      { heading: 'When to Replace vs Repair', body: 'If repair costs exceed 50% of replacement cost, or if the unit is 15+ years old, replacement is usually smarter. Energy-efficient models can reduce cooling costs by 20-40%.' },
    ]
  },
  { id: 2, category: 'maintenance', title: 'Annual Home Maintenance Calendar', summary: 'A month-by-month breakdown of every maintenance task your home needs — never miss a seasonal service again.', readTime: 6, difficulty: 'beginner', featured: false, emoji: '📅',
    content: [
      { heading: 'January–February: Winter Check', body: 'Inspect roof for ice dams. Check pipes for freezing risk. Test smoke and CO detectors. Replace water heater anode rod if 3+ years old.' },
      { heading: 'March–April: Spring Prep', body: 'Clean gutters. Inspect roof after winter. Service HVAC. Test sprinkler system. Caulk windows and doors. Check foundation for cracks.' },
      { heading: 'May–June: Summer Ready', body: 'Power wash exterior. Inspect deck for rot. Clean dryer vents. Check window screens. Service lawn equipment.' },
      { heading: 'July–August: Mid-Summer', body: 'Check AC performance. Inspect attic for heat and moisture. Trim trees away from house. Check exterior paint.' },
      { heading: 'September–October: Fall Prep', body: 'Clean gutters again. Service heating system. Drain exterior faucets. Check weatherstripping. Inspect chimney.' },
      { heading: 'November–December: Winter Ready', body: 'Insulate pipes in unheated spaces. Stock emergency supplies. Test generator. Check for drafts. Clean fireplace.' },
    ]
  },
  { id: 3, category: 'maintenance', title: 'Plumbing 101: What Every Homeowner Should Know', summary: 'How to prevent costly water damage, identify early signs of trouble, and know when to call a plumber.', readTime: 7, difficulty: 'beginner', featured: false, emoji: '🔧',
    content: [
      { heading: 'Know Your Shutoff Valves', body: 'Find your main water shutoff before you need it. It\'s usually near the water meter or where the main line enters the house. Every adult in your home should know its location.' },
      { heading: 'Early Warning Signs', body: 'Watch for: water stains on ceilings, slow drains (early clog warning), low water pressure (pipe or fixture issue), discolored water (rust or sediment), and unusual sounds in pipes.' },
      { heading: 'Water Heater Maintenance', body: 'Flush your water heater annually to remove sediment. Check the anode rod every 3 years. Most water heaters last 8-12 years — budget for replacement around year 10.' },
      { heading: 'Prevent Frozen Pipes', body: 'Keep cabinet doors open under sinks on exterior walls during cold snaps. Let faucets drip slightly. Know how to shut off water if a pipe bursts.' },
      { heading: 'When to DIY vs Call a Pro', body: 'DIY: replacing faucets, fixing running toilets, unclogging drains. Call a pro: anything involving the main line, gas connections, or work requiring permits.' },
    ]
  },
  // Financial
  { id: 4, category: 'financial', title: 'Understanding Home Equity: Your Wealth Engine', summary: 'How equity builds, how to access it, and how to use it strategically as part of your financial portfolio.', readTime: 9, difficulty: 'intermediate', featured: true, emoji: '📈',
    content: [
      { heading: 'What Is Home Equity?', body: 'Equity is the difference between your home\'s market value and what you owe. If your home is worth $425,000 and you owe $280,000, your equity is $145,000.' },
      { heading: 'How Equity Builds', body: 'Two ways: appreciation (market forces) and principal paydown (every mortgage payment reduces your balance). In the first years, most payments go to interest — this shifts over time.' },
      { heading: 'Accessing Your Equity', body: 'Home Equity Loan: lump sum at fixed rate. HELOC: revolving credit line, flexible draws. Cash-Out Refinance: replaces mortgage with larger one. Each has different rates, terms, and tax implications.' },
      { heading: 'Strategic Uses of Equity', body: 'High-ROI home improvements (kitchens, baths). Down payment on additional property. Debt consolidation (replacing high-interest debt with lower-rate home equity). Education funding.' },
      { heading: 'The Risk', body: 'Your home is collateral. Borrowing against equity increases risk if property values decline. Never borrow more than you can comfortably repay.' },
    ]
  },
  { id: 5, category: 'financial', title: 'Property Expense Tracking for Tax Season', summary: 'Which home expenses are deductible, how to document them properly, and how to prepare tax-ready records.', readTime: 7, difficulty: 'intermediate', featured: false, emoji: '🧾',
    content: [
      { heading: 'Primary Home Deductions', body: 'Mortgage interest (up to $750K loan), property taxes (up to $10K SALT cap), and mortgage points are the main deductions for a primary home. Home office deduction requires exclusive business use.' },
      { heading: 'Rental Property Deductions', body: 'Rental properties have far more deductions: mortgage interest, property taxes, insurance, repairs, maintenance, property management fees, utilities you pay, and depreciation (27.5 years).' },
      { heading: 'Capital Improvements vs Repairs', body: 'Repairs are immediately deductible on rentals. Improvements must be depreciated over time. A new roof is an improvement; patching the existing roof is a repair.' },
      { heading: 'The Records You Need', body: 'Keep all receipts, invoices, and contracts for at least 3 years (IRS) or 7 years (to be safe). Photograph major repairs. Note dates, vendors, and purpose on every receipt.' },
      { heading: 'Cost Basis Tracking', body: 'Your cost basis affects capital gains when you sell. It includes purchase price plus improvements. Track every improvement — it could save you thousands in taxes when you sell.' },
    ]
  },
  // Insurance
  { id: 6, category: 'insurance', title: 'Home Insurance: What You\'re Actually Covered For', summary: 'Decode your policy, understand common exclusions, and make sure you\'re not underinsured before disaster strikes.', readTime: 8, difficulty: 'beginner', featured: true, emoji: '🛡️',
    content: [
      { heading: 'Standard HO-3 Coverage', body: 'Most homeowners have an HO-3 policy covering: dwelling (structure), other structures (detached garage, fence), personal property, liability, and additional living expenses if you can\'t occupy your home.' },
      { heading: 'Common Exclusions', body: 'Floods: not covered — requires separate NFIP or private flood policy. Earthquakes: separate policy needed. Normal wear and tear: not covered. Mold from long-term neglect: often excluded.' },
      { heading: 'Replacement Cost vs Actual Cash Value', body: 'Replacement cost pays what it costs to rebuild at today\'s prices. Actual cash value deducts depreciation. Always choose replacement cost — the premium difference is worth it.' },
      { heading: 'Are You Underinsured?', body: 'Construction costs have risen 30-40% since 2020. If your dwelling coverage hasn\'t been updated, you may be significantly underinsured. Get an updated replacement cost estimate from your agent.' },
      { heading: 'Umbrella Policy', body: 'Standard liability is $100K-300K. An umbrella policy adds $1-5M in coverage for about $150-300/year. Essential for multi-property owners, pool owners, and anyone with significant assets.' },
    ]
  },
  { id: 7, category: 'insurance', title: 'Rental Property Insurance: What Landlords Need', summary: 'Standard homeowners policies don\'t cover rentals. Here\'s what coverage landlords actually need.', readTime: 6, difficulty: 'intermediate', featured: false, emoji: '🔑',
    content: [
      { heading: 'Landlord Policy (DP-3)', body: 'A standard HO-3 policy is void when you rent out your property. You need a Dwelling Policy (DP-3) or Landlord Policy. It covers the structure and your liability — not tenant belongings.' },
      { heading: 'Loss of Rental Income', body: 'If your rental is damaged and uninhabitable, loss of rental income coverage pays your lost rent during repairs. This is critical — don\'t skip it.' },
      { heading: 'Require Tenant\'s Insurance', body: 'Make renters insurance a lease requirement. It protects tenant belongings and provides their own liability coverage, reducing your exposure.' },
      { heading: 'Liability Coverage', body: 'As a landlord, you\'re liable for slip-and-falls, dog bites by tenants\' pets (sometimes), and habitability failures. $500K-$1M liability is recommended. An umbrella policy is wise.' },
      { heading: 'Vacant Property', body: 'Standard policies often exclude coverage for vacant properties after 30-60 days. If a property is between tenants, notify your insurer and get a vacant property endorsement.' },
    ]
  },
  // Valuation
  { id: 8, category: 'valuation', title: 'How Property Values Are Determined', summary: 'Understanding the appraisal process, what drives appreciation, and how to increase your home\'s value strategically.', readTime: 7, difficulty: 'beginner', featured: false, emoji: '🏠',
    content: [
      { heading: 'The Appraisal Process', body: 'A licensed appraiser compares your home to recent sales of similar properties (comps) within a mile radius. They adjust for differences in size, condition, age, and amenities.' },
      { heading: 'Key Value Drivers', body: 'Location (school district, walkability, neighborhood trajectory). Size (square footage, lot size). Condition (updated vs dated systems and finishes). Unique features (pool, views, garage).' },
      { heading: 'Best ROI Improvements', body: 'Kitchen remodel (60-80% ROI). Bathroom update (60-70%). Curb appeal/landscaping (100%+ if neglected). New roof (60-70%). Adding square footage (varies widely by market).' },
      { heading: 'Low ROI to Avoid', body: 'Swimming pools in most markets (negative ROI). Luxury upgrades in non-luxury neighborhoods (over-improvement). Highly personalized finishes. Converting a garage.' },
      { heading: 'Monitoring Value', body: 'Check Zillow, Redfin, and Realtor.com estimates monthly. But remember: these are algorithms. A real appraisal or agent CMA gives you the most accurate current value.' },
    ]
  },
  // Legal
  { id: 9, category: 'legal', title: 'Property Tax Appeals: A Step-by-Step Guide', summary: 'How to challenge an over-assessment, gather evidence, and potentially save thousands annually.', readTime: 8, difficulty: 'intermediate', featured: true, emoji: '⚖️',
    content: [
      { heading: 'When to Appeal', body: 'Appeal if your assessed value exceeds your market value. Studies show 30-60% of assessments are over-valued. The average successful appeal saves $1,200-$2,400/year.' },
      { heading: 'Step 1: Review Your Assessment', body: 'Check the county\'s records for your property. Look for errors: wrong square footage, wrong number of bedrooms, outdated data. These errors alone can win an appeal.' },
      { heading: 'Step 2: Gather Comparable Sales', body: 'Find 3-5 recent sales of similar homes in your neighborhood. Use Zillow, Redfin, or the county recorder\'s office. If comps are lower than your assessed value, you have evidence.' },
      { heading: 'Step 3: File the Appeal', body: 'Most counties require filing within 45-90 days of the assessment notice. File online or in person with your county Board of Assessors. There is usually no fee.' },
      { heading: 'Step 4: The Hearing', body: 'Present your comps and any errors to the Board of Equalization. Be professional and factual. Most hearings take 15-30 minutes. You don\'t need an attorney.' },
    ]
  },
  { id: 10, category: 'legal', title: 'Georgia Landlord-Tenant Law: What You Must Know', summary: 'Security deposits, eviction procedures, notice requirements, and fair housing compliance for Georgia landlords.', readTime: 10, difficulty: 'advanced', featured: false, emoji: '📋',
    content: [
      { heading: 'Security Deposit Rules', body: 'Georgia law (O.C.G.A. § 44-7-30) requires returning deposits within 30 days of move-out, or providing a written itemization of deductions. Hold deposits in a separate account or surety bond.' },
      { heading: 'Required Disclosures', body: 'Lead paint disclosure for pre-1978 properties (federal law). Provide EPA pamphlet. Georgia has no mandatory disclosure form, but best practice is to document all known defects.' },
      { heading: 'Notice Requirements', body: '60 days written notice required for non-renewal of annual lease. Month-to-month requires 30 days notice. Always send notices via certified mail and keep copies.' },
      { heading: 'Eviction Process', body: 'File a Dispossessory Warrant with Magistrate Court. Tenant has 7 days to respond. If no response, you get a default judgment. Hearing usually within 2-3 weeks of filing. Cannot self-help evict.' },
      { heading: 'Fair Housing', body: 'Cannot discriminate based on race, color, religion, sex, national origin, disability, or familial status. Georgia adds age as a protected class. Violations can result in significant penalties.' },
    ]
  },
  // Rental
  { id: 11, category: 'rental', title: 'Setting the Right Rent Price', summary: 'How to research your local market, price competitively, and adjust for seasonality and property type.', readTime: 6, difficulty: 'beginner', featured: false, emoji: '💰',
    content: [
      { heading: 'Research Comparable Rentals', body: 'Search Zillow, Apartments.com, and Facebook Marketplace for similar units in your area. Compare square footage, bedrooms, amenities, and location within a half-mile radius.' },
      { heading: 'The 1% Rule', body: 'A rough guideline: monthly rent should be 1% of purchase price. A $300,000 home should rent for $3,000/month. This doesn\'t account for local market conditions — always verify with comps.' },
      { heading: 'Seasonality Matters', body: 'Rental demand peaks May-September. Listing in winter may require pricing 5-10% below peak. Consider when your lease ends — try to time renewals for spring.' },
      { heading: 'Price for Low Vacancy', body: 'A vacancy of even 1 month erases 8% of annual income. Pricing 5% below market may attract better tenants faster and pay off more than holding out for top dollar.' },
      { heading: 'Annual Increases', body: 'Build annual increases into leases (typically 3-5%). Check local ordinances — some areas have rent control or increase caps. Give proper notice before any increase.' },
    ]
  },
  // Energy
  { id: 12, category: 'energy', title: 'Energy Efficiency: Reduce Bills and Increase Value', summary: 'The highest-ROI energy upgrades for homeowners — from simple fixes to major improvements worth making.', readTime: 7, difficulty: 'beginner', featured: false, emoji: '⚡',
    content: [
      { heading: 'Start With an Audit', body: 'Georgia Power and most utilities offer free energy audits. An auditor identifies air leaks, insulation gaps, and inefficient equipment. It\'s the most valuable first step.' },
      { heading: 'Quick Wins Under $500', body: 'LED bulbs throughout ($50, saves $150/year). Smart thermostat ($150, saves 10-15% on HVAC). Weatherstripping doors and windows ($100). Water heater insulation blanket ($30).' },
      { heading: 'Mid-Range: $500-$5,000', body: 'Attic insulation (30-50% of heat loss through roof). Air sealing (most homes lose 30% of conditioned air through leaks). Energy-efficient windows (10-20% reduction in bills).' },
      { heading: 'Major Upgrades with Incentives', body: 'Heat pump HVAC (30% federal tax credit through 2032). Solar panels (30% federal tax credit + Georgia Power net metering). EV charger installation (30% credit).' },
      { heading: 'Effect on Home Value', body: 'Energy-efficient homes sell for 2-8% more than comparable inefficient homes. A green certification (ENERGY STAR, LEED) can add 5-10% in some markets.' },
    ]
  },
];

// ─── Article Card ─────────────────────────────────────────────────────
const ArticleCard = ({ article, onClick }) => {
  const cat = CATEGORIES.find(c => c.key === article.category) || CATEGORIES[0];
  const diff = DIFFICULTY[article.difficulty];

  return (
    <button
      onClick={() => onClick(article)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left w-full p-6 flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{article.emoji}</span>
        {article.featured && (
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
            <Star className="w-3 h-3 fill-amber-400" /> Featured
          </span>
        )}
      </div>
      <h3 className="font-bold text-slate-900 text-base mb-2 leading-tight">{article.title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-4">{article.summary}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: cat.bg, color: cat.color }}>
          {cat.label}
        </span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: diff.bg, color: diff.color }}>
          {diff.label}
        </span>
        <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
          <Clock className="w-3 h-3" /> {article.readTime} min read
        </div>
      </div>
    </button>
  );
};

// ─── Article Reader ───────────────────────────────────────────────────
const ArticleReader = ({ article, onClose }) => {
  const cat = CATEGORIES.find(c => c.key === article.category) || CATEGORIES[0];
  const diff = DIFFICULTY[article.difficulty];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{article.emoji}</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: diff.bg, color: diff.color }}>{diff.label}</span>
            <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3 h-3" /> {article.readTime} min</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-8 py-6">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">{article.title}</h1>
          <p className="text-slate-500 text-base mb-8 leading-relaxed">{article.summary}</p>
          <div className="space-y-6">
            {article.content.map((section, i) => (
              <div key={i}>
                <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0" style={{ background: cat.color }}>{i + 1}</span>
                  {section.heading}
                </h2>
                <p className="text-slate-600 leading-relaxed pl-8">{section.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 text-sm">CasaOS Tip</p>
              <p className="text-slate-500 text-sm mt-1">Use CasaOS to track and document everything in this guide — from maintenance schedules to expense records and policy documents.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const HomeLearnPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filtered = useMemo(() => {
    return ARTICLES.filter(a => {
      const matchSearch = !searchQuery ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = activeCategory === 'all' || a.category === activeCategory;
      const matchDiff = activeDifficulty === 'all' || a.difficulty === activeDifficulty;
      return matchSearch && matchCat && matchDiff;
    });
  }, [searchQuery, activeCategory, activeDifficulty]);

  const featured = ARTICLES.filter(a => a.featured);

  return (
    <>
      <Helmet><title>Home Learning Hub — CasaOS</title></Helmet>

      <div className="max-w-6xl mx-auto pb-20">

        {/* Header */}
        <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#e8604c', transform: 'translate(30%,-30%)' }}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white">Home Learning Hub</h1>
            </div>
            <p className="text-blue-200 text-base max-w-xl leading-relaxed mb-6">
              Expert guides for every aspect of home ownership — maintenance, finance, insurance, legal, and more.
            </p>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder='Search guides... try "HVAC", "equity", "insurance"'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3.5 text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-6 mt-6 text-sm">
              {[
                { value: ARTICLES.length, label: 'Expert guides' },
                { value: '8', label: 'Topics covered' },
                { value: 'Free', label: 'Always' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-lg">{stat.value}</span>
                  <span className="text-blue-200 text-xs">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Articles */}
        {!searchQuery && activeCategory === 'all' && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Featured Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map(article => (
                <ArticleCard key={article.id} article={article} onClick={setSelectedArticle} />
              ))}
            </div>
          </div>
        )}

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all"
              style={activeCategory === cat.key
                ? { background: cat.color, color: '#fff', borderColor: cat.color }
                : { background: cat.bg, color: cat.color, borderColor: 'transparent' }
              }
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xs text-slate-400 font-medium">Level:</span>
          {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
            <button
              key={d}
              onClick={() => setActiveDifficulty(d)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize"
              style={activeDifficulty === d
                ? { background: '#1e3a5f', color: '#fff', borderColor: '#1e3a5f' }
                : { background: '#fff', color: '#64748b', borderColor: '#e2e8f0' }
              }
            >
              {d === 'all' ? 'All Levels' : d}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No guides found</h3>
            <p className="text-slate-500 mb-4">Try a different search term or category</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); setActiveDifficulty('all'); }} className="text-sm font-semibold underline" style={{ color: '#1e3a5f' }}>Clear filters</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {activeCategory === 'all' && !searchQuery ? 'All Guides' : `${filtered.length} guide${filtered.length !== 1 ? 's' : ''} found`}
              </h2>
              <span className="text-xs text-slate-400">{filtered.length} articles</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(article => (
                <ArticleCard key={article.id} article={article} onClick={setSelectedArticle} />
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-12 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
          <p className="text-slate-500 text-sm">
            CasaOS Learning Hub is built for multi-property owners. All guides are educational — consult professionals for legal, tax, and financial decisions.
          </p>
        </div>
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <ArticleReader article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </>
  );
};

export default HomeLearnPage;
