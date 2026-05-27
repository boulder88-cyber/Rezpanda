import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, X, ChevronRight, Star, Clock,
  Wrench, DollarSign, Shield, TrendingUp, FileText,
  Users, Zap, TreePine, Home, CheckCircle2, ShieldCheck,
  Lightbulb, Award, Bookmark, Share2, ArrowRight,
  BarChart2, MessageCircle, User
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  { key: 'all', label: 'All Guides', icon: BookOpen, color: '#1e3a5f', bg: '#eef2f8' },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench, color: '#f97316', bg: '#fff7ed' },
  { key: 'insurance', label: 'Insurance', icon: Shield, color: '#e8604c', bg: '#fdf0ee' },
  { key: 'financial', label: 'Finance', icon: DollarSign, color: '#059669', bg: '#ecfdf5' },
  { key: 'energy', label: 'Energy', icon: Zap, color: '#d97706', bg: '#fffbeb' },
  { key: 'valuation', label: 'Property', icon: TrendingUp, color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'legal', label: 'Legal & Tax', icon: FileText, color: '#dc2626', bg: '#fef2f2' },
  { key: 'rental', label: 'Mortgage', icon: Home, color: '#0891b2', bg: '#ecfeff' },
];

const DIFFICULTY = {
  beginner: { label: 'Beginner', color: '#059669', bg: '#ecfdf5' },
  intermediate: { label: 'Intermediate', color: '#d97706', bg: '#fffbeb' },
  advanced: { label: 'Advanced', color: '#dc2626', bg: '#fef2f2' },
};

const ARTICLES = [
  { id: 1, category: 'maintenance', title: 'The Complete HVAC Maintenance Guide', summary: 'Keep your home comfortable year-round with expert HVAC care tips and seasonal checklists.', readTime: 8, difficulty: 'beginner', featured: true, emoji: '❄️', updated: 'May 2026',
    content: [
      { heading: 'Why HVAC Maintenance Matters', body: 'Your HVAC system is one of the most expensive components in your home — replacement costs range from $5,000 to $12,000. Regular maintenance extends its life by 5-10 years and keeps energy bills 15-25% lower.' },
      { heading: 'Monthly: Change Your Air Filter', body: 'A clogged filter forces your system to work harder, increasing energy consumption and causing premature wear. Use MERV 8-11 rated filters. Mark your calendar for the first of every month.' },
      { heading: 'Annually: Professional Tune-Up', body: 'A certified HVAC technician should inspect refrigerant levels, clean coils, check electrical connections, and lubricate moving parts. Budget $80-150 per unit per year.' },
      { heading: 'Seasonal Checklist', body: 'Spring: Test AC before heat arrives. Check condensate drain. Fall: Test heat before cold arrives. Replace batteries in thermostat. Check vents for obstructions.' },
      { heading: 'When to Replace vs Repair', body: 'If repair costs exceed 50% of replacement cost, or if the unit is 15+ years old, replacement is usually smarter. Energy-efficient models can reduce cooling costs by 20-40%.' },
    ]
  },
  { id: 2, category: 'maintenance', title: 'Annual Home Maintenance Calendar', summary: 'A month-by-month breakdown of every maintenance task your home needs — never miss a seasonal service again.', readTime: 6, difficulty: 'beginner', featured: false, emoji: '📅', updated: 'Apr 2026',
    content: [
      { heading: 'January–February: Winter Check', body: 'Inspect roof for ice dams. Check pipes for freezing risk. Test smoke and CO detectors. Replace water heater anode rod if 3+ years old.' },
      { heading: 'March–April: Spring Prep', body: 'Clean gutters. Inspect roof after winter. Service HVAC. Test sprinkler system. Caulk windows and doors. Check foundation for cracks.' },
      { heading: 'May–June: Summer Ready', body: 'Power wash exterior. Inspect deck for rot. Clean dryer vents. Check window screens. Service lawn equipment.' },
      { heading: 'September–October: Fall Prep', body: 'Clean gutters again. Service heating system. Drain exterior faucets. Check weatherstripping. Inspect chimney.' },
      { heading: 'November–December: Winter Ready', body: 'Insulate pipes in unheated spaces. Stock emergency supplies. Test generator. Check for drafts. Clean fireplace.' },
    ]
  },
  { id: 3, category: 'maintenance', title: 'Plumbing 101: What Every Homeowner Should Know', summary: 'How to prevent costly water damage, identify early signs of trouble, and know when to call a plumber.', readTime: 7, difficulty: 'beginner', featured: false, emoji: '🔧', updated: 'Mar 2026',
    content: [
      { heading: 'Know Your Shutoff Valves', body: "Find your main water shutoff before you need it. It's usually near the water meter or where the main line enters the house. Every adult in your home should know its location." },
      { heading: 'Early Warning Signs', body: 'Watch for: water stains on ceilings, slow drains (early clog warning), low water pressure (pipe or fixture issue), discolored water (rust or sediment), and unusual sounds in pipes.' },
      { heading: 'Water Heater Maintenance', body: 'Flush your water heater annually to remove sediment. Check the anode rod every 3 years. Most water heaters last 8-12 years — budget for replacement around year 10.' },
      { heading: 'Prevent Frozen Pipes', body: 'Keep cabinet doors open under sinks on exterior walls during cold snaps. Let faucets drip slightly. Know how to shut off water if a pipe bursts.' },
      { heading: 'When to DIY vs Call a Pro', body: 'DIY: replacing faucets, fixing running toilets, unclogging drains. Call a pro: anything involving the main line, gas connections, or work requiring permits.' },
    ]
  },
  { id: 4, category: 'financial', title: 'Understanding Home Equity: Your Wealth Engine', summary: 'How equity builds, how to access it, and how to use it strategically as part of your financial portfolio.', readTime: 9, difficulty: 'intermediate', featured: true, emoji: '📈', updated: 'May 2026',
    content: [
      { heading: 'What Is Home Equity?', body: "Equity is the difference between your home's market value and what you owe. If your home is worth $425,000 and you owe $280,000, your equity is $145,000." },
      { heading: 'How Equity Builds', body: 'Two ways: appreciation (market forces) and principal paydown (every mortgage payment reduces your balance). In the first years, most payments go to interest — this shifts over time.' },
      { heading: 'Accessing Your Equity', body: 'Home Equity Loan: lump sum at fixed rate. HELOC: revolving credit line, flexible draws. Cash-Out Refinance: replaces mortgage with larger one. Each has different rates, terms, and tax implications.' },
      { heading: 'Strategic Uses of Equity', body: 'High-ROI home improvements (kitchens, baths). Down payment on additional property. Debt consolidation (replacing high-interest debt with lower-rate home equity). Education funding.' },
      { heading: 'The Risk', body: 'Your home is collateral. Borrowing against equity increases risk if property values decline. Never borrow more than you can comfortably repay.' },
    ]
  },
  { id: 5, category: 'financial', title: 'Property Expense Tracking for Tax Season', summary: 'Which home expenses are deductible, how to document them properly, and how to prepare tax-ready records.', readTime: 7, difficulty: 'intermediate', featured: false, emoji: '🧾', updated: 'Feb 2026',
    content: [
      { heading: 'Primary Home Deductions', body: 'Mortgage interest (up to $750K loan), property taxes (up to $10K SALT cap), and mortgage points are the main deductions for a primary home.' },
      { heading: 'Rental Property Deductions', body: 'Rental properties have far more deductions: mortgage interest, property taxes, insurance, repairs, maintenance, property management fees, utilities you pay, and depreciation (27.5 years).' },
      { heading: 'Capital Improvements vs Repairs', body: 'Repairs are immediately deductible on rentals. Improvements must be depreciated over time. A new roof is an improvement; patching the existing roof is a repair.' },
      { heading: 'The Records You Need', body: 'Keep all receipts, invoices, and contracts for at least 3 years (IRS) or 7 years (to be safe). Photograph major repairs. Note dates, vendors, and purpose on every receipt.' },
      { heading: 'Cost Basis Tracking', body: 'Your cost basis affects capital gains when you sell. It includes purchase price plus improvements. Track every improvement — it could save you thousands in taxes when you sell.' },
    ]
  },
  { id: 6, category: 'insurance', title: 'Understanding Home Insurance', summary: 'Learn how to evaluate coverage, compare policies, and protect your home investment against every scenario.', readTime: 8, difficulty: 'beginner', featured: true, emoji: '🛡️', updated: 'May 2026',
    content: [
      { heading: 'Standard HO-3 Coverage', body: "Most homeowners have an HO-3 policy covering: dwelling (structure), other structures (detached garage, fence), personal property, liability, and additional living expenses if you can't occupy your home." },
      { heading: 'Common Exclusions', body: "Floods: not covered — requires separate NFIP or private flood policy. Earthquakes: separate policy needed. Normal wear and tear: not covered. Mold from long-term neglect: often excluded." },
      { heading: 'Replacement Cost vs Actual Cash Value', body: 'Replacement cost pays what it costs to rebuild at today\'s prices. Actual cash value deducts depreciation. Always choose replacement cost — the premium difference is worth it.' },
      { heading: 'Are You Underinsured?', body: 'Construction costs have risen 30-40% since 2020. If your dwelling coverage hasn\'t been updated, you may be significantly underinsured. Get an updated replacement cost estimate from your agent.' },
      { heading: 'Umbrella Policy', body: 'Standard liability is $100K-300K. An umbrella policy adds $1-5M in coverage for about $150-300/year. Essential for multi-property owners, pool owners, and anyone with significant assets.' },
    ]
  },
  { id: 7, category: 'insurance', title: 'Rental Property Insurance: What Landlords Need', summary: 'Standard homeowners policies don\'t cover rentals — here\'s the exact coverage landlords need.', readTime: 6, difficulty: 'intermediate', featured: false, emoji: '🔑', updated: 'Mar 2026',
    content: [
      { heading: 'Landlord Policy (DP-3)', body: "A standard HO-3 policy is void when you rent out your property. You need a Dwelling Policy (DP-3) or Landlord Policy. It covers the structure and your liability — not tenant belongings." },
      { heading: 'Loss of Rental Income', body: 'If your rental is damaged and uninhabitable, loss of rental income coverage pays your lost rent during repairs. This is critical — don\'t skip it.' },
      { heading: 'Require Tenant\'s Insurance', body: "Make renters insurance a lease requirement. It protects tenant belongings and provides their own liability coverage, reducing your exposure." },
      { heading: 'Liability Coverage', body: 'As a landlord, you\'re liable for slip-and-falls, dog bites by tenants\' pets (sometimes), and habitability failures. $500K-$1M liability is recommended. An umbrella policy is wise.' },
      { heading: 'Vacant Property', body: 'Standard policies often exclude coverage for vacant properties after 30-60 days. If a property is between tenants, notify your insurer and get a vacant property endorsement.' },
    ]
  },
  { id: 8, category: 'valuation', title: 'How Property Values Are Determined', summary: 'Understand the appraisal process, what drives appreciation, and how to increase your home\'s value strategically.', readTime: 7, difficulty: 'beginner', featured: false, emoji: '🏠', updated: 'Apr 2026',
    content: [
      { heading: 'The Appraisal Process', body: 'A licensed appraiser compares your home to recent sales of similar properties (comps) within a mile radius. They adjust for differences in size, condition, age, and amenities.' },
      { heading: 'Key Value Drivers', body: 'Location (school district, walkability, neighborhood trajectory). Size (square footage, lot size). Condition (updated vs dated systems and finishes). Unique features (pool, views, garage).' },
      { heading: 'Best ROI Improvements', body: 'Kitchen remodel (60-80% ROI). Bathroom update (60-70%). Curb appeal/landscaping (100%+ if neglected). New roof (60-70%). Adding square footage (varies widely by market).' },
      { heading: 'Low ROI to Avoid', body: 'Swimming pools in most markets (negative ROI). Luxury upgrades in non-luxury neighborhoods (over-improvement). Highly personalized finishes. Converting a garage.' },
      { heading: 'Monitoring Value', body: 'Check Zillow, Redfin, and Realtor.com estimates monthly. But remember: these are algorithms. A real appraisal or agent CMA gives you the most accurate current value.' },
    ]
  },
  { id: 9, category: 'legal', title: 'Property Tax Appeals: A Step-by-Step Guide', summary: 'Navigate property tax assessments with confidence — from filing your appeal to resolution.', readTime: 8, difficulty: 'intermediate', featured: true, emoji: '⚖️', updated: 'May 2026',
    content: [
      { heading: 'When to Appeal', body: 'Appeal if your assessed value exceeds your market value. Studies show 30-60% of assessments are over-valued. The average successful appeal saves $1,200-$2,400/year.' },
      { heading: 'Step 1: Review Your Assessment', body: "Check the county's records for your property. Look for errors: wrong square footage, wrong number of bedrooms, outdated data. These errors alone can win an appeal." },
      { heading: 'Step 2: Gather Comparable Sales', body: "Find 3-5 recent sales of similar homes in your neighborhood. Use Zillow, Redfin, or the county recorder's office. If comps are lower than your assessed value, you have evidence." },
      { heading: 'Step 3: File the Appeal', body: 'Most counties require filing within 45-90 days of the assessment notice. File online or in person with your county Board of Assessors. There is usually no fee.' },
      { heading: 'Step 4: The Hearing', body: 'Present your comps and any errors to the Board of Equalization. Be professional and factual. Most hearings take 15-30 minutes. You don\'t need an attorney.' },
    ]
  },
  { id: 10, category: 'legal', title: 'Georgia Landlord-Tenant Law: What You Must Know', summary: 'Security deposits, eviction procedures, notice requirements, and fair housing compliance for Georgia landlords.', readTime: 10, difficulty: 'advanced', featured: false, emoji: '📋', updated: 'Mar 2026',
    content: [
      { heading: 'Security Deposit Rules', body: 'Georgia law (O.C.G.A. § 44-7-30) requires returning deposits within 30 days of move-out, or providing a written itemization of deductions. Hold deposits in a separate account or surety bond.' },
      { heading: 'Required Disclosures', body: 'Lead paint disclosure for pre-1978 properties (federal law). Provide EPA pamphlet. Georgia has no mandatory disclosure form, but best practice is to document all known defects.' },
      { heading: 'Notice Requirements', body: '60 days written notice required for non-renewal of annual lease. Month-to-month requires 30 days notice. Always send notices via certified mail and keep copies.' },
      { heading: 'Eviction Process', body: 'File a Dispossessory Warrant with Magistrate Court. Tenant has 7 days to respond. If no response, you get a default judgment. Hearing usually within 2-3 weeks of filing. Cannot self-help evict.' },
      { heading: 'Fair Housing', body: 'Cannot discriminate based on race, color, religion, sex, national origin, disability, or familial status. Georgia adds age as a protected class. Violations can result in significant penalties.' },
    ]
  },
  { id: 11, category: 'rental', title: 'Setting the Right Rent Price', summary: 'Research your local market, price competitively, and adjust for seasonality and property type.', readTime: 6, difficulty: 'beginner', featured: false, emoji: '💰', updated: 'Apr 2026',
    content: [
      { heading: 'Research Comparable Rentals', body: 'Search Zillow, Apartments.com, and Facebook Marketplace for similar units in your area. Compare square footage, bedrooms, amenities, and location within a half-mile radius.' },
      { heading: 'The 1% Rule', body: "A rough guideline: monthly rent should be 1% of purchase price. A $300,000 home should rent for $3,000/month. This doesn't account for local market conditions — always verify with comps." },
      { heading: 'Seasonality Matters', body: 'Rental demand peaks May-September. Listing in winter may require pricing 5-10% below peak. Consider when your lease ends — try to time renewals for spring.' },
      { heading: 'Price for Low Vacancy', body: 'A vacancy of even 1 month erases 8% of annual income. Pricing 5% below market may attract better tenants faster and pay off more than holding out for top dollar.' },
      { heading: 'Annual Increases', body: 'Build annual increases into leases (typically 3-5%). Check local ordinances — some areas have rent control or increase caps. Give proper notice before any increase.' },
    ]
  },
  { id: 12, category: 'energy', title: 'Energy Efficiency: Reduce Bills and Increase Value', summary: 'The highest-ROI energy upgrades for homeowners — from simple fixes to major improvements worth making.', readTime: 7, difficulty: 'beginner', featured: false, emoji: '⚡', updated: 'May 2026',
    content: [
      { heading: 'Start With an Audit', body: 'Georgia Power and most utilities offer free energy audits. An auditor identifies air leaks, insulation gaps, and inefficient equipment. It\'s the most valuable first step.' },
      { heading: 'Quick Wins Under $500', body: 'LED bulbs throughout ($50, saves $150/year). Smart thermostat ($150, saves 10-15% on HVAC). Weatherstripping doors and windows ($100). Water heater insulation blanket ($30).' },
      { heading: 'Mid-Range: $500-$5,000', body: 'Attic insulation (30-50% of heat loss through roof). Air sealing (most homes lose 30% of conditioned air through leaks). Energy-efficient windows (10-20% reduction in bills).' },
      { heading: 'Major Upgrades with Incentives', body: 'Heat pump HVAC (30% federal tax credit through 2032). Solar panels (30% federal tax credit + Georgia Power net metering). EV charger installation (30% credit).' },
      { heading: 'Effect on Home Value', body: 'Energy-efficient homes sell for 2-8% more than comparable inefficient homes. A green certification (ENERGY STAR, LEED) can add 5-10% in some markets.' },
    ]
  },
];

const PERSONALIZED = [1, 6, 9]; // IDs suggested based on home profile

// ═══════════════════════════════════════════════════════════════════════
// ARTICLE CARD
// ═══════════════════════════════════════════════════════════════════════

const ArticleCard = ({ article, onClick, saved, onSave }) => {
  const cat = CATEGORIES.find(c => c.key === article.category) || CATEGORIES[0];
  const diff = DIFFICULTY[article.difficulty];
  const CatIcon = cat.icon;

  return (
    <div className="bg-white flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '20px' }} className="flex flex-col flex-1">
        <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '28px' }}>{article.emoji}</span>
          <div className="flex items-center gap-2">
            {article.featured && (
              <span className="flex items-center gap-1 font-bold rounded-full" style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '3px 8px' }}>
                <Star style={{ width: '10px', height: '10px', fill: '#2563eb' }} /> Featured
              </span>
            )}
            <button onClick={e => { e.stopPropagation(); onSave(article.id); }}
              className="flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              style={{ width: '28px', height: '28px' }}>
              <Bookmark style={{ width: '14px', height: '14px', color: saved ? '#1e3a5f' : '#cbd5e1', fill: saved ? '#1e3a5f' : 'none' }} />
            </button>
          </div>
        </div>

        <button onClick={() => onClick(article)} className="text-left flex-1">
          <h3 className="font-semibold text-slate-900" style={{ fontSize: '15px', lineHeight: '1.4', marginBottom: '8px' }}>{article.title}</h3>
          <p className="text-slate-500" style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '14px' }}>{article.summary}</p>
        </button>

        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '14px' }}>
          <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: cat.bg, color: cat.color, padding: '3px 8px' }}>{cat.label}</span>
          <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: diff.bg, color: diff.color, padding: '3px 8px' }}>{diff.label}</span>
          <span className="text-slate-400 font-medium ml-auto flex items-center gap-1" style={{ fontSize: '12px' }}>
            <Clock style={{ width: '11px', height: '11px' }} /> {article.readTime} min
          </span>
        </div>

        <div className="flex items-center gap-2" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
          <button onClick={() => onClick(article)} className="flex-1 font-semibold text-white hover:opacity-90 transition-all rounded-xl" style={{ background: '#1e3a5f', padding: '8px', fontSize: '13px' }}>
            Read Guide
          </button>
          <button className="flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors" style={{ width: '34px', height: '34px' }}>
            <Share2 style={{ width: '13px', height: '13px', color: '#94a3b8' }} />
          </button>
          <span className="text-slate-300 font-medium" style={{ fontSize: '11px', marginLeft: 'auto' }}>Updated {article.updated}</span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ARTICLE READER
// ═══════════════════════════════════════════════════════════════════════

const ArticleReader = ({ article, onClose }) => {
  const cat = CATEGORIES.find(c => c.key === article.category) || CATEGORIES[0];
  const diff = DIFFICULTY[article.difficulty];
  const CatIcon = cat.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        <div className="sticky top-0 bg-white border-b border-slate-100 flex items-center justify-between" style={{ padding: '16px 24px', borderRadius: '16px 16px 0 0' }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '20px' }}>{article.emoji}</span>
            <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: cat.bg, color: cat.color, padding: '3px 8px' }}>{cat.label}</span>
            <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: diff.bg, color: diff.color, padding: '3px 8px' }}>{diff.label}</span>
            <span className="text-slate-400 flex items-center gap-1" style={{ fontSize: '12px' }}><Clock style={{ width: '11px', height: '11px' }} /> {article.readTime} min</span>
          </div>
          <button onClick={onClose} className="flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors" style={{ width: '32px', height: '32px' }}>
            <X style={{ width: '15px', height: '15px', color: '#64748b' }} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '12px', marginBottom: '16px' }}>
            <span>Home</span>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span>Learning Hub</span>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span className="text-slate-700 font-medium truncate">{article.title}</span>
          </div>

          <h1 className="font-semibold text-slate-900" style={{ fontSize: '22px', lineHeight: '1.3', marginBottom: '10px' }}>{article.title}</h1>
          <p className="text-slate-500" style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '28px' }}>{article.summary}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {article.content.map((section, i) => (
              <div key={i}>
                <h2 className="font-semibold text-slate-900 flex items-center gap-2" style={{ fontSize: '16px', marginBottom: '8px' }}>
                  <span className="flex items-center justify-center font-bold text-white flex-shrink-0" style={{ width: '22px', height: '22px', borderRadius: '50%', background: cat.color, fontSize: '11px' }}>{i + 1}</span>
                  {section.heading}
                </h2>
                <p className="text-slate-600" style={{ fontSize: '14px', lineHeight: '1.7', paddingLeft: '30px' }}>{section.body}</p>
              </div>
            ))}
          </div>

          {/* CasaCEO Tip */}
          <div className="flex items-start gap-3 rounded-xl" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '14px', marginTop: '24px' }}>
            <Lightbulb style={{ width: '16px', height: '16px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p className="font-semibold text-slate-900" style={{ fontSize: '13px', marginBottom: '3px' }}>CasaCEO Tip</p>
              <p className="text-slate-500" style={{ fontSize: '13px', lineHeight: '1.6' }}>Use CasaCEO to track and document everything in this guide — from maintenance schedules to expense records and policy documents.</p>
            </div>
          </div>

          {/* Last updated */}
          <p className="text-slate-300 text-center" style={{ fontSize: '12px', marginTop: '16px' }}>Last updated {article.updated} · Content reviewed for accuracy</p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const HomeLearnPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [savedArticles, setSavedArticles] = useState(new Set());
  const [completedArticles, setCompletedArticles] = useState(new Set([1, 6])); // sample: 2 completed

  const toggleSave = (id) => setSavedArticles(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleReadArticle = (article) => {
    setSelectedArticle(article);
    setCompletedArticles(prev => new Set([...prev, article.id]));
  };

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
  const personalized = ARTICLES.filter(a => PERSONALIZED.includes(a.id));
  const completedCount = completedArticles.size;
  const totalCount = ARTICLES.length;

  return (
    <>
      <Helmet><title>Home Learning Hub — CasaCEO</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/home-profile" className="hover:text-slate-600 transition-colors">Home Profile</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Learning Hub</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2f8', flexShrink: 0 }}>
                <BookOpen style={{ width: '24px', height: '24px', color: '#1e3a5f' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Home Learning Hub</h1>
                <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '4px', maxWidth: '520px', lineHeight: '1.6' }}>
                  Empower every homeowner with expert guidance — from maintenance and insurance to energy efficiency and property finance. Your always-on library for smarter homeownership.
                </p>
              </div>
            </div>
            {/* Progress Tracker */}
            <div className="bg-white rounded-2xl border border-slate-200 flex-shrink-0" style={{ padding: '14px 18px', minWidth: '180px' }}>
              <p className="font-semibold text-slate-900" style={{ fontSize: '14px', marginBottom: '4px' }}>Your Progress</p>
              <p className="text-slate-400" style={{ fontSize: '13px', marginBottom: '8px' }}>
                {completedCount} of {totalCount} guides completed
              </p>
              <div className="bg-slate-100 rounded-full overflow-hidden" style={{ height: '6px' }}>
                <div className="rounded-full transition-all" style={{ width: `${(completedCount / totalCount) * 100}%`, height: '6px', background: '#1e3a5f' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Search ── */}
        <div style={{ marginBottom: '24px' }}>
          <div className="relative">
            <Search style={{ width: '16px', height: '16px', color: '#94a3b8', position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text"
              placeholder='Search by topic — maintenance, insurance, energy, finance, or property management'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 text-slate-800 placeholder:text-slate-400"
              style={{ paddingLeft: '42px', paddingRight: searchQuery ? '40px' : '16px', fontSize: '14px' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            )}
          </div>
          <p className="text-slate-400 italic" style={{ fontSize: '12px', marginTop: '6px', paddingLeft: '4px' }}>
            All guides are written by verified professionals and reviewed for accuracy.
          </p>
        </div>

        {/* ── Personalized Recommendations ── */}
        {!searchQuery && activeCategory === 'all' && (
          <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #c7d7eb', padding: '20px', marginBottom: '24px', background: '#eef2f8' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
              <User style={{ width: '16px', height: '16px', color: '#1e3a5f' }} />
              <h3 className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>Based on your home profile, you may also like…</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {personalized.map(article => {
                const cat = CATEGORIES.find(c => c.key === article.category) || CATEGORIES[0];
                return (
                  <button key={article.id} onClick={() => handleReadArticle(article)}
                    className="bg-white text-left hover:shadow-sm transition-all rounded-xl" style={{ padding: '12px 14px', border: '1px solid #e2e8f0' }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px' }}>{article.emoji}</span>
                      <span className="font-semibold rounded-full" style={{ fontSize: '11px', background: cat.bg, color: cat.color, padding: '2px 6px' }}>{cat.label}</span>
                    </div>
                    <p className="font-semibold text-slate-800" style={{ fontSize: '13px', lineHeight: '1.4' }}>{article.title}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Featured Guides ── */}
        {!searchQuery && activeCategory === 'all' && (
          <div style={{ marginBottom: '32px' }}>
            <h2 className="font-semibold text-slate-900 flex items-center gap-2" style={{ fontSize: '20px', marginBottom: '16px' }}>
              <Star style={{ width: '16px', height: '16px', color: '#2563eb', fill: '#2563eb' }} /> Featured Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map(article => (
                <ArticleCard key={article.id} article={article} onClick={handleReadArticle} saved={savedArticles.has(article.id)} onSave={toggleSave} />
              ))}
            </div>
          </div>
        )}

        {/* ── Category Filter Pills ── */}
        <div className="flex flex-wrap gap-2" style={{ marginBottom: '12px' }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                className="flex items-center gap-1.5 font-semibold rounded-full border transition-all"
                style={{ padding: '6px 14px', fontSize: '12px',
                  background: activeCategory === cat.key ? cat.color : cat.bg,
                  color: activeCategory === cat.key ? 'white' : cat.color,
                  borderColor: 'transparent' }}>
                <Icon style={{ width: '13px', height: '13px' }} /> {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Difficulty Filter ── */}
        <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
          <span className="text-slate-400 font-medium" style={{ fontSize: '12px' }}>Level:</span>
          {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
            <button key={d} onClick={() => setActiveDifficulty(d)}
              className="font-semibold rounded-full border transition-all capitalize"
              style={{ padding: '4px 12px', fontSize: '12px',
                background: activeDifficulty === d ? '#1e3a5f' : 'white',
                color: activeDifficulty === d ? 'white' : '#64748b',
                borderColor: activeDifficulty === d ? '#1e3a5f' : '#e2e8f0' }}>
              {d === 'all' ? 'All Levels' : d}
            </button>
          ))}
        </div>

        {/* ── Articles Grid ── */}
        {filtered.length === 0 ? (
          <div className="bg-white text-center" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '48px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '14px' }}>🔍</div>
            <p className="font-semibold text-slate-900" style={{ fontSize: '18px', marginBottom: '8px' }}>No guides found.</p>
            <p className="text-slate-400" style={{ fontSize: '14px', marginBottom: '16px' }}>Try a different search term or category.</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); setActiveDifficulty('all'); }} className="font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1e3a5f', fontSize: '13px' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '20px' }}>
                {activeCategory === 'all' && !searchQuery ? 'All Guides' : `${filtered.length} guide${filtered.length !== 1 ? 's' : ''} found`}
              </h2>
              <span className="text-slate-400" style={{ fontSize: '13px' }}>{filtered.length} articles</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(article => (
                <ArticleCard key={article.id} article={article} onClick={handleReadArticle} saved={savedArticles.has(article.id)} onSave={toggleSave} />
              ))}
            </div>
          </>
        )}

        {/* ── Compass Agent CTA ── */}
        <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl" style={{ background: '#1e3a5f', padding: '20px 24px', marginTop: '32px' }}>
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)' }}>
            <MessageCircle style={{ width: '22px', height: '22px', color: 'white' }} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-semibold text-white" style={{ fontSize: '16px' }}>Ask your agent for personalized guidance.</p>
            <p className="text-blue-200" style={{ fontSize: '13px', marginTop: '3px' }}>Connect with a real estate professional for advice tailored to your properties and market.</p>
          </div>
          <button className="flex items-center gap-2 font-semibold rounded-xl hover:opacity-90 transition-all flex-shrink-0 bg-white" style={{ padding: '10px 20px', fontSize: '13px', color: '#1e3a5f' }}>
            Connect with Agent <ArrowRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        {/* ── Footer ── */}
        <div className="text-center" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginTop: '16px' }}>
          <p className="text-slate-400" style={{ fontSize: '13px', lineHeight: '1.7' }}>
            HomeOS Learning Hub is designed to help homeowners make informed decisions about maintenance, insurance, and property management. All content is educational and not a substitute for professional advice.
          </p>
        </div>
      </div>

      {selectedArticle && <ArticleReader article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
    </>
  );
};

export default HomeLearnPage;
