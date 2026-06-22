import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import { Search, ChevronDown, ChevronUp, CreditCard, Wrench, FileText, ShieldCheck, Mail } from 'lucide-react';

/*
  CasaCEO — Support (/support)
  --------------------------------------------------------------------------
  Recolored to the warm palette and rewritten so the FAQs describe the REAL
  product (forward-by-email bills, per-property pricing, no bank access,
  store-fields-not-files) instead of the old HomeOS claims (AVM/valuation,
  AES-256 vault, smart-home devices, shared access). No fake article counts.
*/

const INK = '#1C3553';
const SKY = '#3E6BA8';
const GOLD = '#c9a96e';
const PAPER = '#F6F3EC';
const SAND = '#EFE9DD';
const STONE = '#6E6A62';
const LINE = '#E3DCCE';

const serif = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const Wordmark = () => (
  <span style={{ textTransform: 'none', whiteSpace: 'nowrap' }}>Casa<span style={{ color: GOLD }}>CEO</span></span>
);

const CATEGORIES = [
  { icon: CreditCard, label: 'Bill Pay' },
  { icon: Wrench, label: 'Maintenance' },
  { icon: FileText, label: 'Documents' },
  { icon: ShieldCheck, label: 'Privacy & security' },
];

const FAQS = [
  { q: 'How do I add my home?', a: 'After signing up, choose "Add property" and enter your address plus a few basic details. That\u2019s the whole setup — you can start forwarding bills and adding maintenance tasks right away.' },
  { q: 'How does forwarding a bill work?', a: 'Each account gets its own CasaCEO email address. Forward a bill to it — or have a provider send statements there directly — and CasaCEO reads the provider, amount, and due date, then files it for you. A quick review step lets you check anything it wasn\u2019t sure about before it counts.' },
  { q: 'Does CasaCEO pay my bills or access my bank?', a: 'No. CasaCEO never connects to your bank, never stores a card, and never moves money. It keeps track of what\u2019s due and reminds you — you pay each bill yourself, your own way. That boundary is the core of how the product protects you.' },
  { q: 'What does it cost?', a: 'Pricing is per property: $4.99/month (or $49.99/year) for a home you live in, and $9.99/month (or $99.99/year) for a rental. Add as many properties as you like — you only pay the per-property price for each.' },
  { q: 'What happens to the emails and PDFs I forward?', a: 'CasaCEO keeps the structured details of a bill — provider, amount, due date — rather than a long-term copy of the original email or file. Storing the fields instead of the document keeps things lean and reduces what\u2019s held about you.' },
  { q: 'Can I manage more than one home?', a: 'Yes. Each property keeps its own tidy set of bills and records, and you switch between them in a tap. A vacation place or a rental stays cleanly separate from the home you live in.' },
  { q: 'How do I cancel?', a: 'You can cancel anytime from your account settings. If you\u2019d like a copy of your records first, reach out and we\u2019ll help you export them.' },
];

const FAQItem = ({ faq, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid ${LINE}` }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '16px' }}>
        <p style={{ fontFamily: sans, fontSize: '16px', fontWeight: 600, color: INK, flex: 1 }}>{faq.q}</p>
        {open ? <ChevronUp style={{ width: '18px', height: '18px', color: STONE, flexShrink: 0 }} /> : <ChevronDown style={{ width: '18px', height: '18px', color: STONE, flexShrink: 0 }} />}
      </button>
      {open && <div style={{ padding: '0 24px 20px' }}><p style={{ fontFamily: sans, fontSize: '15px', color: STONE, lineHeight: 1.75 }}>{faq.a}</p></div>}
    </div>
  );
};

const SupportPage = () => {
  const [query, setQuery] = useState('');
  const filtered = FAQS.filter(f => !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()));

  return (
    <SiteLayout seo={{ title: 'Support — CasaCEO help center' }} fullWidth>
      {/* Hero */}
      <section style={{ background: INK, padding: '76px 24px 62px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: '520px', height: '520px', borderRadius: '50%', background: 'rgba(62,107,168,0.22)', filter: 'blur(20px)', top: '-200px', right: '-120px' }} />
        </div>
        <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 4vw, 2.7rem)', fontWeight: 600, color: '#fff', marginBottom: '14px', letterSpacing: '-0.015em' }}>How can we help?</h1>
          <p style={{ fontFamily: sans, fontSize: '17px', color: 'rgba(255,255,255,0.72)', marginBottom: '28px' }}>Search common questions or browse by topic.</p>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: STONE }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search help…"
              style={{ fontFamily: sans, width: '100%', height: '52px', paddingLeft: '48px', paddingRight: '16px', borderRadius: '12px', border: 'none', fontSize: '16px', outline: 'none', boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }} />
          </div>
        </div>
      </section>

      {/* Categories + FAQ */}
      <section style={{ padding: '60px 24px', background: PAPER }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>Browse by topic</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '52px' }}>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <div key={cat.label} style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${LINE}`, padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Icon style={{ width: '20px', height: '20px', color: INK }} />
                  </div>
                  <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 700, color: INK }}>{cat.label}</p>
                </div>
              );
            })}
          </div>

          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Common questions {query && `— "${query}"`}
          </p>
          <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${LINE}`, overflow: 'hidden' }}>
            {filtered.length > 0
              ? filtered.map((faq, i) => <FAQItem key={i} faq={faq} defaultOpen={i === 0} />)
              : <div style={{ padding: '40px', textAlign: 'center', color: STONE, fontFamily: sans }}>No results for "{query}". Try a different search.</div>
            }
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: '70px 24px', background: '#fff', textAlign: 'center', borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p style={{ fontFamily: serif, fontSize: '22px', fontWeight: 600, color: INK, marginBottom: '8px' }}>Still need a hand?</p>
          <p style={{ fontFamily: sans, fontSize: '15px', color: STONE, marginBottom: '28px' }}>We usually reply within one business day.</p>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '13px 26px', borderRadius: '11px', background: INK, color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
            <Mail style={{ width: '15px', height: '15px' }} /> Contact us
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
};

export default SupportPage;
