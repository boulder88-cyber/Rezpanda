import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  BarChart2, Download, FileText, ChevronRight, Share2,
  TrendingUp, Shield, Zap, Wrench, Home, Star, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const REPORTS = [
  {
    id: 1, title: 'Annual Home Report', type: 'annual', icon: Home, color: '#1e3a5f', bg: '#eef2f8',
    desc: 'Comprehensive 12-month summary of your home — valuation, maintenance, costs, insurance, and timeline.',
    generated: 'May 2026', pages: 8, ready: true,
    highlights: ['Value up +$65K (+5.5%)', '$2,840 in maintenance', '14 timeline events', '2 insurance renewals upcoming'],
  },
  {
    id: 2, title: 'Insurance Risk Report', type: 'insurance', icon: Shield, color: '#e8604c', bg: '#fdf0ee',
    desc: 'Analyzes your current coverage, detects gaps, and recommends policy improvements.',
    generated: 'May 2026', pages: 4, ready: true,
    highlights: ['2 coverage gaps detected', 'No flood insurance', 'Umbrella gap for rental', 'Action required before Sep renewal'],
  },
  {
    id: 3, title: 'Utility Efficiency Report', type: 'utility', icon: Zap, color: '#d97706', bg: '#fffbeb',
    desc: 'Reviews your utility spend, benchmarks against comparable homes, and identifies savings opportunities.',
    generated: 'Apr 2026', pages: 3, ready: true,
    highlights: ['$299/mo total utilities', '18% above neighborhood avg', '$420/yr electric savings potential', 'Smart thermostat recommended'],
  },
  {
    id: 4, title: 'Maintenance Forecast', type: 'maintenance', icon: Wrench, color: '#f97316', bg: '#fff7ed',
    desc: 'Predicts upcoming maintenance needs and costs for the next 12 months.',
    generated: 'May 2026', pages: 5, ready: true,
    highlights: ['$4,200 forecast next 12mo', '1 overdue item', 'HVAC replacement in ~6 years', 'Water heater at 9yr life'],
  },
  {
    id: 5, title: 'Equity Growth Report', type: 'equity', icon: TrendingUp, color: '#059669', bg: '#ecfdf5',
    desc: 'Tracks your equity growth, mortgage paydown, and projected 5-year wealth building.',
    generated: 'May 2026', pages: 4, ready: true,
    highlights: ['$615K current equity', '+$42K equity this year', '5yr projection: $980K', 'Refinance opportunity at 6.5%'],
  },
];

const CHART_DATA = [
  { month: 'Dec', maintenance: 580, utilities: 280, insurance: 180 },
  { month: 'Jan', maintenance: 120, utilities: 320, insurance: 180 },
  { month: 'Feb', maintenance: 90, utilities: 290, insurance: 180 },
  { month: 'Mar', maintenance: 420, utilities: 260, insurance: 180 },
  { month: 'Apr', maintenance: 180, utilities: 240, insurance: 180 },
  { month: 'May', maintenance: 1450, utilities: 299, insurance: 180 },
];

const InsightsReportsPage = () => {
  const [selected, setSelected] = useState(REPORTS[0]);
  const Icon = selected.icon;

  return (
    <>
      <Helmet><title>Insights & Reports — HomeOS</title></Helmet>
      <div className="max-w-7xl mx-auto pb-20">
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '28px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '10px' }}>
            <Link to="/reports" className="hover:text-slate-600">Reports</Link>
            <ChevronRight style={{ width: '13px', height: '13px' }} />
            <span className="text-slate-700 font-medium">Insights & Reports</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 style={{ width: '24px', height: '24px', color: '#1e3a5f' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '26px' }}>Insights & Reports</h1>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>Auto-generated · Export to PDF · Share with advisors</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Report cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Available Reports</p>
            {REPORTS.map(report => {
              const RIcon = report.icon;
              return (
                <button key={report.id} onClick={() => setSelected(report)} className="w-full text-left bg-white hover:shadow-sm transition-all"
                  style={{ borderRadius: '12px', border: `2px solid ${selected.id === report.id ? report.color : '#e2e8f0'}`, padding: '14px 16px', cursor: 'pointer' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: report.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <RIcon style={{ width: '17px', height: '17px', color: report.color }} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{report.title}</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8' }}>Generated {report.generated} · {report.pages}pp</p>
                    </div>
                    {report.ready && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', flexShrink: 0 }} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Report detail */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div className="flex items-start justify-between" style={{ marginBottom: '14px' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: selected.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: '22px', height: '22px', color: selected.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{selected.title}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>Generated {selected.generated} · {selected.pages} pages</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '12px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                    <Share2 style={{ width: '13px', height: '13px' }} /> Share
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', background: '#1e3a5f', color: 'white', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    <Download style={{ width: '13px', height: '13px' }} /> Export PDF
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '16px' }}>{selected.desc}</p>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Key Highlights</p>
                <div className="grid grid-cols-2 gap-2">
                  {selected.highlights.map((h, i) => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: '9px', background: selected.bg, display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Star style={{ width: '12px', height: '12px', color: selected.color, flexShrink: 0 }} />
                      <p style={{ fontSize: '12px', color: '#334155', fontWeight: 500 }}>{h}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Spending chart */}
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '16px' }}>Monthly Cost Breakdown — Last 6 Months</p>
              <div style={{ height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA} barSize={12}>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(v, n) => [`$${v}`, n]} />
                    <Bar dataKey="maintenance" fill="#f97316" radius={[3, 3, 0, 0]} name="Maintenance" />
                    <Bar dataKey="utilities" fill="#d97706" radius={[3, 3, 0, 0]} name="Utilities" />
                    <Bar dataKey="insurance" fill="#1e3a5f" radius={[3, 3, 0, 0]} name="Insurance" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-5" style={{ marginTop: '8px' }}>
                {[['#f97316', 'Maintenance'], ['#d97706', 'Utilities'], ['#1e3a5f', 'Insurance']].map(([color, label]) => (
                  <span key={label} className="flex items-center gap-1.5" style={{ fontSize: '11px', color: '#94a3b8' }}>
                    <span style={{ width: '10px', height: '8px', borderRadius: '2px', background: color, display: 'inline-block' }} /> {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InsightsReportsPage;
