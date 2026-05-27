import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import { ArrowRight, Users, CheckCircle2, Star, Bell, TrendingUp, Home, FileText } from 'lucide-react';

const useFadeIn = () => {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, v];
};
const FadeIn = ({ children, delay = 0 }) => {
  const [ref, v] = useFadeIn();
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(20px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>{children}</div>;
};

const FEATURES = [
  { icon: Home, color: '#1e3a5f', bg: '#eef2f8', title: 'Branded HomeOS for Clients', desc: 'Give every client a HomeOS experience with your branding. Stay top-of-mind long after closing day.' },
  { icon: Bell, color: '#f97316', bg: '#fff7ed', title: 'Automated Client Touchpoints', desc: 'HomeOS automatically surfaces maintenance reminders, anniversaries, and valuation updates — keeping you connected.' },
  { icon: TrendingUp, color: '#059669', bg: '#ecfdf5', title: 'Post-Closing Value', desc: 'Turn transactions into long-term relationships. Clients stay engaged — and refer more business back to you.' },
  { icon: Users, color: '#7c3aed', bg: '#f5f3ff', title: 'Client Retention Analytics', desc: 'Track engagement across your entire client portfolio. See who\'s active and who needs a touchpoint.' },
  { icon: FileText, color: '#e8604c', bg: '#fdf0ee', title: 'Closing Doc Integration', desc: 'Client documents from closing automatically populate their HomeOS vault — nothing to upload manually.' },
  { icon: Star, color: '#d97706', bg: '#fffbeb', title: 'Referral Network Effect', desc: 'Delighted homeowners become active referrers. HomeOS turns your clients into your best marketing channel.' },
];

const AgentsPage = () => (
  <SiteLayout seo={{ title: 'HomeOS for Agents — Win More Clients. Stay Top-of-Mind.' }} fullWidth>

    {/* Hero */}
    <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '96px 24px 80px', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(26,115,232,0.1)', top: '-120px', right: '-80px' }} />
      </div>
      <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '13px', fontWeight: 600, background: 'rgba(26,115,232,0.2)', color: '#93c5fd', padding: '6px 16px', borderRadius: '999px', display: 'inline-block', marginBottom: '24px' }}>
          For Real Estate Agents
        </span>
        <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '20px' }}>
          Win more clients.<br />Stay top-of-mind.
        </h1>
        <p style={{ fontSize: '19px', color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 40px' }}>
          HomeOS is the post-closing platform that keeps you connected to every client — with zero extra effort.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '15px 32px', borderRadius: '10px', background: '#1A73E8', color: 'white', fontSize: '16px', fontWeight: 700, textDecoration: 'none' }}>
            Get Agent Access <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
          <Link to="/pricing" style={{ display: 'inline-flex', padding: '15px 32px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '16px', fontWeight: 600, textDecoration: 'none' }}>
            View Pricing
          </Link>
        </div>
      </div>
    </section>

    {/* Stats bar */}
    <div style={{ background: '#1A73E8', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
        {[['3x', 'More referrals from HomeOS clients'], ['87%', 'Client retention rate vs 32% industry avg'], ['$0', 'Setup cost for agents on Pro plan']].map(([stat, label]) => (
          <div key={stat}>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{stat}</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Features */}
    <section style={{ padding: '96px 24px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Everything agents need to stay connected.
            </h2>
            <p style={{ fontSize: '17px', color: '#64748b' }}>Six features built specifically for real estate professionals.</p>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <FadeIn key={i} delay={i * 60}>
                <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Icon style={{ width: '20px', height: '20px', color: f.color }} />
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>{f.title}</p>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section style={{ padding: '80px 24px', background: '#0f172a', textAlign: 'center' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '14px' }}>
          Start building lifetime client relationships.
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>$19/mo per agent. Cancel anytime.</p>
        <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '15px 36px', borderRadius: '10px', background: '#1A73E8', color: 'white', fontSize: '16px', fontWeight: 700, textDecoration: 'none' }}>
          Get Agent Access <ArrowRight style={{ width: '16px', height: '16px' }} />
        </Link>
      </div>
    </section>
  </SiteLayout>
);

export default AgentsPage;
