import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Home, ChevronRight, ArrowRight, Compass,
  TrendingUp, DollarSign, Building2, Clock, Cpu, TreePine, LineChart
} from 'lucide-react';

// Optional extras — everything that isn't a primary tile lives here, one tap
// from the dashboard. Deliberately a flat list, not a grid of loud tiles.
const EXPLORE_ITEMS = [
  { title: 'Home Value', description: 'See what your home is worth today.', icon: TrendingUp, link: '/home-valuation', color: '#1e3a5f', bg: '#eef2f8' },
  { title: 'Spending', description: 'Track where your money goes across the year.', icon: DollarSign, link: '/expenses', color: '#059669', bg: '#ecfdf5' },
  { title: 'Utilities', description: 'All your utility accounts in one view.', icon: Building2, link: '/utilities', color: '#0891b2', bg: '#ecfeff' },
  { title: 'Home Timeline', description: 'Every event and update, remembered automatically.', icon: Clock, link: '/timeline', color: '#1e3a5f', bg: '#eef2f8' },
  { title: 'Smart Home', description: 'Connect and manage your smart devices.', icon: Cpu, link: '/smart-home', color: '#7c3aed', bg: '#f5f3ff' },
  { title: 'Landscaping', description: 'Keep your yard and plants on schedule.', icon: TreePine, link: '/plants', color: '#16a34a', bg: '#f0fdf4' },
  { title: 'Reports', description: 'Data-driven views of your home and spending.', icon: LineChart, link: '/reports', color: '#d97706', bg: '#fffbeb' },
];

const ExplorePage = () => {
  return (
    <>
      <Helmet><title>Explore — CasaCEO</title></Helmet>

      <div className="min-h-screen bg-slate-50">

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px' }}>
          {/* Home button — clear way back to the dashboard */}
          <Link to="/dashboard" className="inline-flex items-center gap-2 font-semibold text-slate-600 hover:text-slate-900 transition-colors" style={{ fontSize: '14px', marginBottom: '16px' }}>
            <Home style={{ width: '16px', height: '16px' }} /> Home
          </Link>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '12px' }}>
            <Link to="/dashboard" className="hover:text-slate-600 transition-colors">Home</Link>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
            <span className="text-slate-700 font-medium">Explore</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9' }}>
              <Compass style={{ width: '24px', height: '24px', color: '#64748b' }} />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2' }}>Explore</h1>
              <p className="text-slate-400" style={{ fontSize: '14px', marginTop: '2px' }}>
                Optional tools for when you want to dig deeper into your home.
              </p>
            </div>
          </div>
        </div>

        {/* ── Items ── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            {EXPLORE_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  to={item.link}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid #f1f5f9' }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-base">{item.title}</p>
                    <p className="text-slate-400 text-sm">{item.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>

          <p className="text-center text-slate-400 text-xs" style={{ marginTop: '20px' }}>
            More tools live here as CasaCEO grows. Your day-to-day stays on the home screen.
          </p>
        </div>
      </div>
    </>
  );
};

export default ExplorePage;
