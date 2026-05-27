import React from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import { ArrowRight, BookOpen, FileText, Video, Users, Tag } from 'lucide-react';

const CATEGORIES = [
  { label: 'All', key: 'all' },
  { label: 'Guides', key: 'guide' },
  { label: 'Tutorials', key: 'tutorial' },
  { label: 'Case Studies', key: 'case-study' },
];

const ARTICLES = [
  { type: 'guide', tag: 'Getting Started', title: 'The Complete Guide to HomeOS', desc: 'Everything you need to know to get your home fully organized in HomeOS — from setup to advanced features.', readTime: '12 min read', icon: BookOpen, color: '#1e3a5f', bg: '#eef2f8' },
  { type: 'guide', tag: 'Documents', title: 'How to Build Your Digital Document Vault', desc: 'A step-by-step guide to scanning, uploading, and organizing every document your home will ever need.', readTime: '8 min read', icon: FileText, color: '#7c3aed', bg: '#f5f3ff' },
  { type: 'tutorial', tag: 'Maintenance', title: 'Setting Up Your Annual Maintenance Schedule', desc: 'Use HomeOS to build a 12-month preventive maintenance plan — before problems become expensive repairs.', readTime: '6 min read', icon: BookOpen, color: '#f97316', bg: '#fff7ed' },
  { type: 'case-study', tag: 'Case Study', title: 'How One Family Office Uses HomeOS for 7 Properties', desc: 'A look at how a high-net-worth family manages their full property portfolio with HomeOS Portfolio tier.', readTime: '10 min read', icon: Users, color: '#059669', bg: '#ecfdf5' },
  { type: 'tutorial', tag: 'Insurance', title: 'Finding Coverage Gaps with the Insurance Analyzer', desc: 'A walkthrough of using HomeOS to detect uncovered risks — flood, umbrella, and liability gaps.', readTime: '7 min read', icon: FileText, color: '#e8604c', bg: '#fdf0ee' },
  { type: 'guide', tag: 'Valuation', title: 'Understanding Your Home\'s Equity Position', desc: 'How to read your Valuation Dashboard, understand LTV, and use sell-vs-hold analysis for financial planning.', readTime: '9 min read', icon: BookOpen, color: '#1A73E8', bg: '#EFF6FF' },
  { type: 'case-study', tag: 'Case Study', title: 'Real Estate Agent: 3x Referrals with HomeOS', desc: 'How one agent in Atlanta doubled her referral rate by giving every client a branded HomeOS experience.', readTime: '8 min read', icon: Users, color: '#d97706', bg: '#fffbeb' },
  { type: 'tutorial', tag: 'Mobile', title: 'Scanning Documents with the HomeOS Mobile App', desc: 'A quick tutorial on using your phone camera to capture and auto-classify documents in seconds.', readTime: '4 min read', icon: Video, color: '#0891b2', bg: '#ecfeff' },
];

const ResourceCard = ({ article }) => {
  const Icon = article.icon;
  return (
    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ height: '120px', background: article.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ width: '36px', height: '36px', color: article.color }} />
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: article.color, background: article.bg, padding: '2px 8px', borderRadius: '999px' }}>{article.tag}</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{article.readTime}</span>
        </div>
        <p style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '8px', lineHeight: 1.4 }}>{article.title}</p>
        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.7, marginBottom: '16px' }}>{article.desc}</p>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A73E8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          Read more <ArrowRight style={{ width: '13px', height: '13px' }} />
        </span>
      </div>
    </div>
  );
};

const ResourcesPage = () => {
  const [active, setActive] = React.useState('all');
  const filtered = active === 'all' ? ARTICLES : ARTICLES.filter(a => a.type === active);

  return (
    <SiteLayout seo={{ title: 'Resources — HomeOS Guides, Tutorials & Case Studies' }} fullWidth>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1A73E8 100%)', padding: '72px 24px 64px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#93c5fd', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>Resources</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '14px' }}>
            Learn HomeOS
          </h1>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
            Guides, tutorials, and case studies to help you get the most from your home.
          </p>
        </div>
      </section>

      <section style={{ padding: '64px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '36px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setActive(cat.key)}
                style={{ padding: '8px 18px', borderRadius: '999px', border: `1px solid ${active === cat.key ? '#1A73E8' : '#e2e8f0'}`, background: active === cat.key ? '#1A73E8' : 'white', color: active === cat.key ? 'white' : '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filtered.map((article, i) => <ResourceCard key={i} article={article} />)}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section style={{ padding: '64px 24px', background: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <p style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Stay up to date</p>
          <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px' }}>New guides and tutorials published every week.</p>
          <div style={{ display: 'flex', gap: '8px', maxWidth: '440px', margin: '0 auto' }}>
            <input placeholder="your@email.com" style={{ flex: 1, height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }} />
            <button style={{ padding: '0 20px', borderRadius: '10px', background: '#1A73E8', color: 'white', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ResourcesPage;
