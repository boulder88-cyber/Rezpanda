import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  Play, BookOpen, Mic, Clock, Star, Search, Filter,
  ChevronRight, ExternalLink, CheckCircle2, AlertTriangle,
  Wrench, Zap, Droplets, Wind, TreePine, Shield,
  ThumbsUp, Tag, ArrowRight, Lightbulb, X, Home
} from 'lucide-react';

// ─── Content Data ─────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all', label: 'All Topics', icon: Home, color: '#1e3a5f', bg: '#eef2f8' },
  { key: 'plumbing', label: 'Plumbing', icon: Droplets, color: '#0891b2', bg: '#ecfeff' },
  { key: 'electrical', label: 'Electrical', icon: Zap, color: '#d97706', bg: '#fffbeb' },
  { key: 'hvac', label: 'HVAC', icon: Wind, color: '#2563eb', bg: '#eff6ff' },
  { key: 'general', label: 'General Repair', icon: Wrench, color: '#f97316', bg: '#fff7ed' },
  { key: 'landscaping', label: 'Landscaping', icon: TreePine, color: '#16a34a', bg: '#f0fdf4' },
  { key: 'safety', label: 'Safety', icon: Shield, color: '#dc2626', bg: '#fef2f2' },
];

const DIFFICULTY = {
  easy: { label: 'Easy', color: '#059669', bg: '#ecfdf5' },
  medium: { label: 'Medium', color: '#d97706', bg: '#fffbeb' },
  hard: { label: 'Hard', color: '#dc2626', bg: '#fef2f2' },
};

const CONTENT = [
  // ── PLUMBING ──
  {
    id: 1, category: 'plumbing', type: 'video', difficulty: 'easy',
    title: 'How to Fix a Leaky Faucet',
    description: 'Stop that drip once and for all. Most faucet leaks are caused by a worn washer or O-ring — a 20 minute fix that saves $100+ on your water bill.',
    duration: '8 min', diy: true,
    youtubeSearch: 'how to fix leaky faucet DIY',
    tools: ['Adjustable wrench', 'Screwdriver', 'Replacement washers'],
    saves: '$150 plumber visit',
    tips: ['Turn off water supply valve first', 'Take photos before disassembly', 'Bring old washer to hardware store for exact match'],
    whenToCallPro: 'If leak is behind the wall or pipe is corroded',
    tags: ['faucet', 'drip', 'leak', 'quick fix'],
  },
  {
    id: 2, category: 'plumbing', type: 'video', difficulty: 'easy',
    title: 'Unclog a Drain Without Chemicals',
    description: 'Chemical drain cleaners damage pipes over time. Learn the safer, more effective methods using a drain snake or simple baking soda technique.',
    duration: '6 min', diy: true,
    youtubeSearch: 'unclog drain without chemicals DIY',
    tools: ['Drain snake', 'Baking soda', 'White vinegar', 'Boiling water'],
    saves: '$80-120 plumber visit',
    tips: ['Prevention: use drain strainers', 'Monthly baking soda + vinegar treatment keeps drains clear', 'Hair is the #1 cause of bathroom clogs'],
    whenToCallPro: 'Multiple drains clogged at once — could be main line issue',
    tags: ['clog', 'drain', 'bathroom', 'kitchen'],
  },
  {
    id: 3, category: 'plumbing', type: 'guide', difficulty: 'easy',
    title: 'Shut Off Your Water in an Emergency',
    description: 'Every homeowner needs to know this. Locate your main shutoff valve before a burst pipe turns a small problem into a catastrophe.',
    duration: '3 min read', diy: true,
    youtubeSearch: 'how to shut off main water supply home',
    tools: ['Nothing — just knowledge'],
    saves: 'Thousands in water damage',
    tips: ['Main shutoff is usually near water meter or where pipe enters house', 'Test it annually so it doesn\'t freeze seized', 'Label it clearly for family members'],
    whenToCallPro: 'Immediately after shutting off — for burst pipes call a plumber same day',
    tags: ['emergency', 'shutoff', 'burst pipe', 'must know'],
  },
  {
    id: 4, category: 'plumbing', type: 'video', difficulty: 'medium',
    title: 'Replace a Toilet Flapper',
    description: 'A running toilet can waste 200 gallons of water per day. The flapper is usually the culprit and takes 10 minutes to replace for under $10.',
    duration: '10 min', diy: true,
    youtubeSearch: 'replace toilet flapper running toilet fix',
    tools: ['Replacement flapper ($5-10)', 'Your hands — no tools needed'],
    saves: '$200/year on water bill + $120 plumber',
    tips: ['Universal flappers fit most toilets', 'Add food coloring to tank — if it appears in bowl without flushing, flapper is leaking', 'Replace every 3-5 years proactively'],
    whenToCallPro: 'If replacing flapper doesn\'t stop running — may be fill valve',
    tags: ['toilet', 'running', 'flapper', 'water waste'],
  },

  // ── ELECTRICAL ──
  {
    id: 5, category: 'electrical', type: 'video', difficulty: 'easy',
    title: 'Reset a Tripped Circuit Breaker',
    description: 'Power out in one room? Before calling an electrician, check your breaker panel. Most tripped breakers are a simple reset — takes 30 seconds.',
    duration: '4 min', diy: true,
    youtubeSearch: 'how to reset tripped circuit breaker',
    tools: ['Nothing needed'],
    saves: '$200 electrician call',
    tips: ['Breakers should snap firmly to ON — partial position means tripped', 'If it trips again immediately, unplug devices and try again', 'Repeatedly tripping = overloaded circuit or short circuit — call a pro'],
    whenToCallPro: 'Breaker won\'t reset or keeps tripping — could be dangerous wiring',
    tags: ['circuit breaker', 'power out', 'electrical panel', 'quick fix'],
  },
  {
    id: 6, category: 'electrical', type: 'video', difficulty: 'easy',
    title: 'Replace a Light Switch',
    description: 'A dead switch is a simple swap. With basic safety steps, replacing a standard light switch is a beginner-friendly 15 minute project.',
    duration: '12 min', diy: true,
    youtubeSearch: 'how to replace light switch DIY beginner',
    tools: ['Flathead screwdriver', 'Phillips screwdriver', 'Voltage tester ($10)', 'Replacement switch ($3)'],
    saves: '$150 electrician visit',
    tips: ['ALWAYS turn off breaker first and test with voltage tester', 'Take a photo of old wiring before disconnecting', 'Match switch type — single pole vs 3-way'],
    whenToCallPro: 'Wires are aluminum (silver colored), more than 3 wires present, or sparks',
    tags: ['light switch', 'electrical', 'beginner', 'replace'],
  },
  {
    id: 7, category: 'electrical', type: 'guide', difficulty: 'easy',
    title: 'Test and Replace GFCI Outlets',
    description: 'GFCI outlets in bathrooms and kitchens save lives. They should be tested monthly — takes 10 seconds.',
    duration: '5 min read', diy: true,
    youtubeSearch: 'test replace GFCI outlet bathroom kitchen',
    tools: ['GFCI outlet ($15-25)', 'Screwdrivers', 'Voltage tester'],
    saves: 'Could save your life + $150 electrician',
    tips: ['Test button = trips it. Reset button = restores power', 'Replace if test/reset doesn\'t work properly', 'Required by code in bathrooms, kitchens, garages, outdoors'],
    whenToCallPro: 'If GFCI keeps tripping without obvious cause — ground fault somewhere',
    tags: ['GFCI', 'outlet', 'bathroom', 'safety', 'monthly check'],
  },

  // ── HVAC ──
  {
    id: 8, category: 'hvac', type: 'video', difficulty: 'easy',
    title: 'Change Your HVAC Air Filter',
    description: 'The single most important maintenance task most homeowners skip. A dirty filter makes your HVAC work 15% harder and costs you money every month.',
    duration: '5 min', diy: true,
    youtubeSearch: 'how to change HVAC air filter home',
    tools: ['Replacement filter (check size on old filter)', 'Vacuum (optional)'],
    saves: '$200-400/year on energy bills + extends HVAC life',
    tips: ['Check filter monthly — change every 1-3 months', 'MERV 8-11 is ideal for most homes', 'Arrow on filter points toward the blower (away from return duct)', 'Write install date on filter with marker'],
    whenToCallPro: 'If you notice reduced airflow after changing filter — may need duct cleaning',
    tags: ['HVAC', 'filter', 'monthly', 'energy savings', 'must do'],
  },
  {
    id: 9, category: 'hvac', type: 'video', difficulty: 'easy',
    title: 'Clean Your AC Condenser Unit',
    description: 'That big metal box outside needs annual cleaning. Dirty coils reduce efficiency by 25%. A garden hose and 20 minutes saves hundreds in energy costs.',
    duration: '15 min', diy: true,
    youtubeSearch: 'clean AC condenser unit outside DIY',
    tools: ['Garden hose with sprayer', 'Fin comb (optional)', 'Coil cleaner spray ($10)'],
    saves: '$300-500/year in energy + longer equipment life',
    tips: ['Turn off power at disconnect box first', 'Spray from inside out to push debris out', 'Keep plants and debris 2 feet away year-round', 'Best done in spring before cooling season'],
    whenToCallPro: 'Bent fins over 20% of coil or refrigerant leak (hissing sound)',
    tags: ['AC', 'condenser', 'annual', 'energy savings', 'summer prep'],
  },
  {
    id: 10, category: 'hvac', type: 'guide', difficulty: 'medium',
    title: 'Program Your Smart Thermostat',
    description: 'A properly programmed smart thermostat pays for itself in 1-2 months. Most people never set it up correctly.',
    duration: '10 min read', diy: true,
    youtubeSearch: 'program smart thermostat save money Nest Ecobee',
    tools: ['Your thermostat app or manual'],
    saves: '$180/year average household savings',
    tips: ['68°F when home, 60°F when away/asleep in winter is the sweet spot', 'Each degree lower saves ~3% on heating', 'Use geofencing if your thermostat supports it'],
    whenToCallPro: 'Thermostat wiring issues or C-wire problems during installation',
    tags: ['thermostat', 'smart home', 'energy savings', 'Nest', 'Ecobee'],
  },

  // ── GENERAL REPAIR ──
  {
    id: 11, category: 'general', type: 'video', difficulty: 'easy',
    title: 'Caulk a Bathtub or Shower',
    description: 'Old, moldy caulk isn\'t just ugly — it leads to water damage behind walls. Recaulking is a $10 fix that prevents $10,000 in damage.',
    duration: '20 min', diy: true,
    youtubeSearch: 'how to caulk bathtub shower DIY',
    tools: ['Caulk remover tool ($5)', 'Mold-resistant silicone caulk ($8)', 'Caulk gun', 'Painter\'s tape'],
    saves: 'Prevents major water damage',
    tips: ['Use 100% silicone for wet areas — NOT latex', 'Fill tub with water while caulking so joint is slightly stretched', 'Let cure 24 hours before using shower'],
    whenToCallPro: 'Water damage already behind walls — soft drywall, staining, mold smell',
    tags: ['caulk', 'bathroom', 'shower', 'waterproofing', 'prevention'],
  },
  {
    id: 12, category: 'general', type: 'video', difficulty: 'easy',
    title: 'Patch a Drywall Hole',
    description: 'Doorknob dents, picture hanging mistakes, or accidents — drywall holes are one of the most common fixes. Smaller than 6" is a beginner DIY.',
    duration: '30 min + dry time', diy: true,
    youtubeSearch: 'patch drywall hole repair DIY small large',
    tools: ['Spackle or joint compound', 'Putty knife', 'Sandpaper (120 grit)', 'Primer', 'Paint'],
    saves: '$200-400 handyman visit',
    tips: ['Small holes (under 3"): spackle, sand, paint', 'Medium holes: use mesh patch kit ($8)', 'Match texture before painting for invisible repair'],
    whenToCallPro: 'Structural damage, water damage, or holes near electrical/plumbing',
    tags: ['drywall', 'patch', 'hole', 'wall repair', 'beginner'],
  },
  {
    id: 13, category: 'general', type: 'guide', difficulty: 'easy',
    title: '10 Things to Check Every Spring',
    description: 'A simple annual walkthrough catches small problems before they become expensive ones. This checklist takes 2 hours and could save thousands.',
    duration: '8 min read', diy: true,
    youtubeSearch: 'spring home maintenance checklist annual inspection',
    tools: ['Flashlight', 'Binoculars (for roof)', 'Garden hose'],
    saves: 'Prevents thousands in deferred maintenance',
    tips: [
      'Gutters: clean and check for sagging',
      'Roof: look for missing/curled shingles from ground',
      'Caulking: check windows, doors, and penetrations',
      'HVAC: replace filter, clean condenser',
      'Deck/patio: check for loose boards and rot',
    ],
    whenToCallPro: 'Anything structural, roof damage, or foundation cracks',
    tags: ['spring', 'checklist', 'annual', 'inspection', 'prevention'],
  },
  {
    id: 14, category: 'general', type: 'video', difficulty: 'medium',
    title: 'Fix a Squeaky Floor',
    description: 'That annoying creak at 2am waking everyone up. Most squeaky floors are fixable from above with one screw and a special bit — no subfloor access needed.',
    duration: '15 min', diy: true,
    youtubeSearch: 'fix squeaky floor from above without removing floor',
    tools: ['Squeeeeek No More kit ($20)', 'Drill', 'Score tool'],
    saves: '$300-500 flooring contractor',
    tips: ['Works through carpet or hardwood', 'Screw goes through flooring into joist — snaps off flush', 'Find the joist with a stud finder first'],
    whenToCallPro: 'Squeaking over entire large area or if floor feels springy/soft — structural issue',
    tags: ['squeaky floor', 'hardwood', 'carpet', 'quick fix'],
  },

  // ── LANDSCAPING ──
  {
    id: 15, category: 'landscaping', type: 'guide', difficulty: 'easy',
    title: 'Winterize Your Sprinkler System',
    description: 'Skipping sprinkler winterization leads to burst pipes come spring — a $500+ repair. Blowing out the lines takes 30 minutes and a compressor.',
    duration: '30 min', diy: true,
    youtubeSearch: 'how to winterize sprinkler system blow out DIY',
    tools: ['Air compressor (rent for $30-50)', 'Safety glasses'],
    saves: '$500+ in burst pipe repairs',
    tips: ['Blow out each zone separately, 2-3 passes each', 'Don\'t exceed 50 PSI for poly pipe, 80 PSI for PVC', 'Turn off backflow preventer and controller after'],
    whenToCallPro: 'If you have a complex system or are unsure — sprinkler companies charge $75-100',
    tags: ['sprinkler', 'winterize', 'irrigation', 'fall prep'],
  },
  {
    id: 16, category: 'landscaping', type: 'video', difficulty: 'easy',
    title: 'Fix a Dead Patch in Your Lawn',
    description: 'Dead grass patches are usually easy to fix with overseeding or sod plugs. Identify the cause first or it\'ll keep coming back.',
    duration: '15 min', diy: true,
    youtubeSearch: 'fix dead patches lawn grass repair overseeding',
    tools: ['Rake', 'Grass seed or sod plugs', 'Topsoil', 'Fertilizer'],
    saves: '$200+ landscaper visit',
    tips: ['Rule out grubs or disease first (pull back dead grass — white grubs visible)', 'Best time to seed: early fall for cool season, spring for warm season', 'Water 2x daily for 2 weeks until established'],
    whenToCallPro: 'Large areas or if grubs/disease confirmed — may need treatment first',
    tags: ['lawn', 'grass', 'dead patch', 'overseeding'],
  },

  // ── SAFETY ──
  {
    id: 17, category: 'safety', type: 'guide', difficulty: 'easy',
    title: 'Test Every Smoke & CO Detector',
    description: 'Most fire deaths happen because smoke detectors had dead batteries or were missing. This 10-minute monthly task is the most important safety check you can do.',
    duration: '10 min monthly', diy: true,
    youtubeSearch: 'test smoke detector carbon monoxide detector home safety',
    tools: ['9V batteries', 'Step stool'],
    saves: 'Could save your life',
    tips: ['Test monthly — press test button for 5+ seconds', 'Replace batteries annually even if they work', 'Replace entire unit every 10 years — sensors degrade', 'CO detectors needed on every level near sleeping areas'],
    whenToCallPro: 'Never — this is always a DIY task',
    tags: ['smoke detector', 'carbon monoxide', 'safety', 'monthly', 'batteries'],
  },
  {
    id: 18, category: 'safety', type: 'guide', difficulty: 'easy',
    title: 'Check Your Fire Extinguisher',
    description: 'Do you even know where your fire extinguisher is? 60% of homeowners either don\'t have one or have one that\'s expired. 5-minute check.',
    duration: '5 min', diy: true,
    youtubeSearch: 'how to check fire extinguisher home inspection',
    tools: ['Your existing extinguisher'],
    saves: 'Could save your home',
    tips: ['Needle should be in green zone — red zone means recharge or replace', 'ABC rated for homes handles most fires', 'Kitchen: aim away from grease fire — use lid to smother instead', 'Know PASS: Pull, Aim, Squeeze, Sweep'],
    whenToCallPro: 'Never for inspection — take to fire station for recharge',
    tags: ['fire extinguisher', 'safety', 'annual check', 'PASS'],
  },
];

// ─── Content Card ─────────────────────────────────────────────────────
const ContentCard = ({ item, onClick }) => {
  const cat = CATEGORIES.find(c => c.key === item.category);
  const diff = DIFFICULTY[item.difficulty];
  const Icon = cat?.icon || Wrench;

  return (
    <button
      onClick={() => onClick(item)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group w-full"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cat?.bg }}>
              <Icon className="w-4 h-4" style={{ color: cat?.color }} />
            </div>
            <div className="flex items-center gap-1.5">
              {item.type === 'video' && (
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                  <Play className="w-3 h-3" /> Video
                </span>
              )}
              {item.type === 'guide' && (
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">
                  <BookOpen className="w-3 h-3" /> Guide
                </span>
              )}
              {item.type === 'podcast' && (
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-500">
                  <Mic className="w-3 h-3" /> Podcast
                </span>
              )}
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: diff?.bg, color: diff?.color }}>
            {diff?.label}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-sm mb-1.5 group-hover:text-blue-600 transition-colors leading-snug">
          {item.title}
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" /> {item.duration}
            </span>
            {item.saves && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <ThumbsUp className="w-3 h-3" /> {item.saves}
              </span>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </button>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────
const DetailModal = ({ item, onClose }) => {
  const cat = CATEGORIES.find(c => c.key === item.category);
  const diff = DIFFICULTY[item.difficulty];
  const Icon = cat?.icon || Wrench;

  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.youtubeSearch)}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-4">
        {/* Header */}
        <div className="rounded-t-3xl px-8 py-6 relative" style={{ background: cat?.color || '#1e3a5f' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-xs">{cat?.label}</span>
              <span className="text-white/40">·</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{diff?.label}</span>
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-white mb-1">{item.title}</h2>
          <p className="text-white/70 text-sm">{item.description}</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Watch / Find Content */}
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl border-2 border-red-100 bg-red-50 hover:bg-red-100 transition-colors group"
          >
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-900">Watch on YouTube</p>
              <p className="text-slate-500 text-xs">Search: "{item.youtubeSearch}"</p>
            </div>
            <ExternalLink className="w-4 h-4 text-red-400 group-hover:text-red-600" />
          </a>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-900">{item.duration}</p>
              <p className="text-xs text-slate-400">Time needed</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <ThumbsUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-green-700 leading-tight">{item.saves}</p>
              <p className="text-xs text-slate-400">You save</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <CheckCircle2 className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-blue-700">{item.diy ? 'DIY' : 'Pro Advised'}</p>
              <p className="text-xs text-slate-400">Recommended</p>
            </div>
          </div>

          {/* Tools Needed */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-slate-400" /> Tools & Materials
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.tools.map((tool, i) => (
                <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Pro Tips */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Pro Tips
            </h3>
            <div className="space-y-2">
              {item.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-amber-50 rounded-xl">
                  <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* When to Call a Pro */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <h3 className="font-bold text-red-700 text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> When to Call a Pro Instead
            </h3>
            <p className="text-xs text-red-600 leading-relaxed">{item.whenToCallPro}</p>
          </div>

          {/* Log it */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-700 text-sm">Did this fix your problem?</p>
              <p className="text-slate-400 text-xs">Log it in your Maintenance tracker</p>
            </div>
            <a
              href="/maintenance-management"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: '#1e3a5f' }}
            >
              Log Repair <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────
const HomeLearnPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = CONTENT.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesType = activeType === 'all' || item.type === activeType;
    const matchesDiff = activeDifficulty === 'all' || item.difficulty === activeDifficulty;
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesType && matchesDiff && matchesSearch;
  });

  return (
    <>
      <Helmet>
        <title>Home Learning Hub — CasaCEO</title>
      </Helmet>

      <div className="max-w-6xl mx-auto pb-20">

        {/* Header */}
        <div className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden" style={{ background: '#1e3a5f' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: '#c9a96e', transform: 'translate(30%,-30%)' }}></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold text-white mb-2">Home Learning Hub</h1>
            <p className="text-blue-200 text-base max-w-2xl leading-relaxed">
              Popular DIY fixes, maintenance guides, and pro tips — organized by category and difficulty. Know when to DIY and when to call a pro.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { label: `${CONTENT.length} Guides & Videos`, icon: <BookOpen className="w-3.5 h-3.5" /> },
                { label: 'Quick fixes to weekend projects', icon: <Clock className="w-3.5 h-3.5" /> },
                { label: 'DIY vs Pro guidance on every topic', icon: <Wrench className="w-3.5 h-3.5" /> },
              ].map((tag, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-white/10 text-blue-200 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
                  {tag.icon} {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search guides... try 'leaky faucet', 'smoke detector', 'HVAC filter'"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-4">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  activeCategory === cat.key ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
                style={activeCategory === cat.key ? { background: cat.color } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <div className="flex gap-2 bg-white border border-slate-200 rounded-xl p-1">
            {['all', 'video', 'guide'].map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeType === type ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {type === 'all' ? 'All Types' : type === 'video' ? '▶ Video' : '📖 Guide'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 bg-white border border-slate-200 rounded-xl p-1">
            {['all', 'easy', 'medium', 'hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setActiveDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeDifficulty === diff ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {diff === 'all' ? 'All Levels' : DIFFICULTY[diff]?.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 self-center ml-auto">{filtered.length} results</p>
        </div>

        {/* Content Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
            <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="font-bold text-slate-400 text-sm">No results for "{searchQuery}"</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="mt-3 text-xs text-blue-500 hover:text-blue-600">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(item => (
              <ContentCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </div>
        )}

        {/* Coming Soon */}
        <div className="mt-10 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6 text-center">
          <Lightbulb className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 mb-2">More Content Coming Soon</h3>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            We're building original CasaCEO video guides, seasonal maintenance checklists, and a podcast series with expert contractors. Stay tuned.
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
};

export default HomeLearnPage;
