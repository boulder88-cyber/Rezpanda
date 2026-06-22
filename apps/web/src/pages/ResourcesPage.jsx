import React from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import { ArrowRight, BookOpen, CreditCard, Wrench, FileText, Home, ShieldCheck } from 'lucide-react';

/*
  CasaCEO — Resources (/resources)
  --------------------------------------------------------------------------
  Rewritten from the old HomeOS resources page (valuation/equity/insurance-
  analyzer/family-office/agent-referral fiction + full rainbow palette).
  New content reflects the REAL product: getting set up, the three pillars,
  the per-property model, and the privacy posture. Cards are honest topic
  cards (no fake article pages behind them yet) — "Read more" is omitted
  rather than linking nowhere. Tokens mirror the rest of the marketing site.
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
  { label: 'All', key: 'all' },
  { label: 'Getting started', key: 'start' },
  { label: 'Using CasaCEO', key: 'using' },
  { label: 'Good to know', key: 'know' },
];

const ARTICLES = [
  { type: 'start', tag: 'Getting started', title: 'Adding your first home', desc: 'Enter your address and a few details — that\u2019s the whole setup. Here\u2019s what to expect in the first five minutes.', readTime: '4 min read', icon: Home },
  { type: 'using', tag: 'Bill Pay', title: 'Forwarding a bill so it files itself', desc: 'How to send a bill to your CasaCEO address and let it sort itself by provider, amount, and due date.', readTime: '5 min read', icon: CreditCard },
  { type: 'using', tag: 'Bill Pay', title: 'Reviewing what the system wasn\u2019t sure about', desc: 'A quick walkthrough of the review step — checking a parsed amount or due date before it counts.', readTime: '4 min read', icon: CreditCard },
  { type: 'using', tag: 'Maintenance', title: 'Building a year of upkeep in one sitting', desc: 'Set recurring tasks once — filters, gutters, seasonal checks — and let the right reminders come back on their own.', readTime: '6 min read', icon: Wrench },
  { type: 'using', tag: 'Documents', title: 'Keeping the papers that actually matter', desc: 'Deeds, policies, warranties, receipts — what\u2019s worth keeping in one findable place, and what isn\u2019t. (Coming soon.)', readTime: '5 min read', icon: FileText },
  { type: 'start', tag: 'Multiple homes', title: 'Running more than one property', desc: 'How per-property records work, switching between homes, and what changes when you add a second place.', readTime: '5 min read', icon: Home },
  { type: 'know', tag: 'Privacy', title: 'Why CasaCEO never touches your bank', desc: 'No account access, no stored card, no money moved by the app. What that means for your security and your control.', readTime: '6 min read', icon: ShieldCheck },
  { type: 'know', tag: 'How it works', title: 'What \u201cstore the fields, not the file\u201d means', desc: 'CasaCEO keeps the structured details of a bill, not a long-term copy of the email or PDF. Here\u2019s the reasoning.', readTime: '5 min read', icon: BookOpen },
];

const ResourceCard = ({ article }) => {
  const Icon = article.icon;
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${LINE}`, overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s', height: '100%', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 14px 34px -18px rgba(28,53,83,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ height: '110px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ width: '34px', height: '34px', color: INK }} />
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 700, color: SKY, background: '#E9F0F8', padding: '2px 9px', borderRadius: '999px' }}>{article.tag}</span>
          <span style={{ fontFamily: sans, fontSize: '11px', color: STONE }}>{article.readTime}</span>
        </div>
        <p style={{ fontFamily: serif, fontSize: '17px', fontWeight: 600, color: INK, marginBottom: '8px', lineHeight: 1.35, letterSpacing: '-0.01em' }}>{article.title}</p>
        <p style={{ fontFamily: sans, fontSize: '13.5px', color: STONE, lineHeight: 1.6 }}>{article.desc}</p>
      </div>
    </div>
  );
};

const ResourcesPage = () => {
  const [active, setActive] = React.useState('all');
  const filtered = active === 'all' ? ARTICLES : ARTICLES.filter(a => a.type === active);

  return (
    <SiteLayout seo={{ title: 'Resources — CasaCEO guides and how-tos' }} fullWidth>
      {/* Hero */}
      <section style={{ background: INK, padding: '78px 24px 66px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: '520px', height: '520px', borderRadius: '50%', background: 'rgba(62,107,168,0.22)', filter: 'blur(20px)', top: '-200px', right: '-120px' }} />
        </div>
        <div style={{ maxWidth: '620px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: '#BBD0EC', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>Resources</p>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 600, color: '#fff', letterSpacing: '-0.015em', marginBottom: '14px' }}>
            Getting the most from <Wordmark />
          </h1>
          <p style={{ fontFamily: sans, fontSize: '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65 }}>
            Short, plain-English guides for setting up and running your home — no jargon, no filler.
          </p>
        </div>
      </section>

      <section style={{ padding: '60px 24px', background: PAPER }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '36px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setActive(cat.key)}
                style={{ fontFamily: sans, padding: '8px 18px', borderRadius: '999px', border: `1px solid ${active === cat.key ? INK : LINE}`, background: active === cat.key ? INK : '#fff', color: active === cat.key ? '#fff' : STONE, fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
            {filtered.map((article, i) => <ResourceCard key={i} article={article} />)}
          </div>
        </div>
      </section>

      {/* Closing CTA — points at signup rather than a non-wired newsletter form */}
      <section style={{ padding: '76px 24px', background: '#fff', textAlign: 'center', borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', fontWeight: 600, color: INK, marginBottom: '12px', letterSpacing: '-0.015em' }}>
            The best way to learn it is to start.
          </h2>
          <p style={{ fontFamily: sans, fontSize: '15px', color: STONE, marginBottom: '28px', lineHeight: 1.6 }}>
            Add your first property and try forwarding a single bill — most of this clicks into place in a few minutes.
          </p>
          <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: sans, padding: '14px 30px', borderRadius: '11px', background: INK, color: '#fff', fontSize: '15px', fontWeight: 700, textDecoration: 'none', transition: 'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            Get started <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ResourcesPage;
