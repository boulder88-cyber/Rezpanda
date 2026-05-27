import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import { Search, ChevronDown, ChevronUp, Home, FileText, Wrench, Shield, Mail, MessageCircle } from 'lucide-react';

const CATEGORIES = [
  { icon: Home, label: 'Getting Started', color: '#1e3a5f', bg: '#eef2f8', count: 12 },
  { icon: FileText, label: 'Documents', color: '#7c3aed', bg: '#f5f3ff', count: 8 },
  { icon: Wrench, label: 'Maintenance', color: '#f97316', bg: '#fff7ed', count: 10 },
  { icon: Shield, label: 'Insurance & Utilities', color: '#e8604c', bg: '#fdf0ee', count: 7 },
];

const FAQS = [
  { q: 'How do I add my home to HomeOS?', a: 'After signing up, click "Add Home" from your dashboard. Enter your property address and HomeOS will auto-populate public record data. You can then add purchase details, upload documents, and connect your utilities.' },
  { q: 'Is my data secure?', a: 'Yes — all data is encrypted at rest with AES-256 and in transit with TLS 1.3. Documents are stored in an encrypted vault. We never sell or share your data. You can export or delete everything at any time.' },
  { q: 'How does the AI document classification work?', a: 'When you upload a document, HomeOS AI analyzes it to detect the type (warranty, insurance policy, receipt, etc.), extracts key fields like dates and amounts, and suggests tags. You can review and edit before saving.' },
  { q: 'Can I invite my spouse or partner to access the platform?', a: 'Yes — go to Shared Access in your Home Profile and invite collaborators by email. You can grant Owner, Editor, or Viewer permissions and manage access at any time.' },
  { q: 'How does the home valuation work?', a: 'HomeOS uses an Automated Valuation Model (AVM) that refreshes daily based on comparable sales, market trends, and your home\'s details. You can also add manual snapshots at any time.' },
  { q: 'What happens if I cancel my account?', a: 'You can export all your data before canceling. After cancellation, your data is permanently deleted from active systems within 30 days and from backups within 90 days.' },
  { q: 'Do you have a mobile app?', a: 'A native iOS and Android app is in development. Currently, HomeOS is fully responsive and works great in mobile browsers. Sign up at casaceo.com to be notified when the app launches.' },
  { q: 'How do I connect my smart home devices?', a: 'From Smart Home Hub in your dashboard, you can connect Nest, Ring, Ecobee, and smart meters. Integration settings allow you to manage connected devices and configure alert preferences.' },
];

const FAQItem = ({ faq, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '16px' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', flex: 1 }}>{faq.q}</p>
        {open ? <ChevronUp style={{ width: '18px', height: '18px', color: '#94a3b8', flexShrink: 0 }} /> : <ChevronDown style={{ width: '18px', height: '18px', color: '#94a3b8', flexShrink: 0 }} />}
      </button>
      {open && <div style={{ padding: '0 24px 20px' }}><p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.8 }}>{faq.a}</p></div>}
    </div>
  );
};

const SupportPage = () => {
  const [query, setQuery] = useState('');
  const filtered = FAQS.filter(f => !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()));

  return (
    <SiteLayout seo={{ title: 'Support — HomeOS Help Center' }} fullWidth>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1A73E8 100%)', padding: '72px 24px 64px', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: 'white', marginBottom: '16px', letterSpacing: '-0.02em' }}>How can we help?</h1>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.7)', marginBottom: '28px' }}>Search our help center or browse by category.</p>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94a3b8' }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search help articles…"
              style={{ width: '100%', height: '52px', paddingLeft: '48px', paddingRight: '16px', borderRadius: '12px', border: 'none', fontSize: '16px', outline: 'none', boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }} />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '64px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>Browse by Category</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '56px' }}>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.label} style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px 16px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Icon style={{ width: '20px', height: '20px', color: cat.color }} />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>{cat.label}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>{cat.count} articles</p>
                </button>
              );
            })}
          </div>

          {/* FAQ */}
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Frequently Asked Questions {query && `— "${query}"`}
          </p>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            {filtered.length > 0
              ? filtered.map((faq, i) => <FAQItem key={i} faq={faq} defaultOpen={i === 0} />)
              : <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No results for "{query}". Try a different search.</div>
            }
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: '64px 24px', background: 'white' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Still need help?</p>
          <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '28px' }}>Our team typically responds within one business day.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '12px 24px', borderRadius: '10px', background: '#1A73E8', color: 'white', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              <Mail style={{ width: '15px', height: '15px' }} /> Email Support
            </Link>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '12px 24px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              <MessageCircle style={{ width: '15px', height: '15px' }} /> Request Demo
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default SupportPage;
