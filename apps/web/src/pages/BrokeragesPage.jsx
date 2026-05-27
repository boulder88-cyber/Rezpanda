import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import { ArrowRight, Building2, Shield, BarChart2, Users, Globe, Lock, CheckCircle2 } from 'lucide-react';

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
  { icon: Globe, color: '#1e3a5f', bg: '#eef2f8', title: 'Brokerage-Level Branding', desc: 'White-label HomeOS under your brand — typography, colors, logo, and domain. Your platform, powered by HomeOS.' },
  { icon: BarChart2, color: '#1A73E8', bg: '#EFF6FF', title: 'Enterprise Dashboard', desc: 'Portfolio-wide engagement metrics, agent activity, and client retention analytics — all in one brokerage dashboard.' },
  { icon: Shield, color: '#e8604c', bg: '#fdf0ee', title: 'Compliance Tools', desc: 'Built-in data governance, audit logging, and compliance infrastructure ready for enterprise deployment.' },
  { icon: Users, color: '#059669', bg: '#ecfdf5', title: 'Agent Integration', desc: 'Every agent in your brokerage connected to their clients\' HomeOS instances. One ecosystem, fully coordinated.' },
  { icon: Lock, color: '#7c3aed', bg: '#f5f3ff', title: 'Enterprise Security', desc: 'Bank-grade encryption, SOC 2 aligned, role-based access controls, and full data ownership for your brokerage.' },
  { icon: Building2, color: '#d97706', bg: '#fffbeb', title: 'Custom Integrations', desc: 'Connect HomeOS to your existing CRM, transaction management, and marketing systems via API.' },
];

const BrokeragesPage = () => (
  <SiteLayout seo={{ title: 'HomeOS for Brokerages — A Platform Your Agents Will Love.' }} fullWidth>

    {/* Hero */}
    <section style={{ background: 'linear-gradient(135deg, #000000 0%, #1e293b 100%)', padding: '96px 24px 80px', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', top: '-150px', right: '-100px' }} />
      </div>
      <div style={{ maxWidth: '780px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '13px', fontWeight: 600, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', padding: '6px 16px', borderRadius: '999px', display: 'inline-block', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.15)' }}>
          Enterprise · For Brokerages
        </span>
        <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '20px' }}>
          A platform your<br />agents will love.
        </h1>
        <p style={{ fontSize: '19px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 40px' }}>
          White-label HomeOS for your entire brokerage. One platform, your brand, every client.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '15px 32px', borderRadius: '10px', background: 'white', color: '#0F172A', fontSize: '16px', fontWeight: 700, textDecoration: 'none' }}>
            Request a Demo <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
          <Link to="/compass-preview" style={{ display: 'inline-flex', padding: '15px 32px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '16px', fontWeight: 600, textDecoration: 'none' }}>
            See CompassHomeOS →
          </Link>
        </div>
      </div>
    </section>

    {/* Features grid */}
    <section style={{ padding: '96px 24px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Enterprise-grade from day one.
            </h2>
            <p style={{ fontSize: '17px', color: '#64748b' }}>Built for scale. Designed for compliance. Ready for your brand.</p>
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

    {/* Enterprise checklist */}
    <section style={{ padding: '80px 24px', background: 'white' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
        <FadeIn>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#1A73E8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>What's Included</p>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '20px' }}>Everything in one enterprise package.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['White-label platform with your branding', 'All agent licenses included', 'Brokerage analytics dashboard', 'Enterprise security & compliance', 'API access and CRM integrations', 'Dedicated success manager', 'Custom SLA and support', 'Onboarding for all agents'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#1A73E8', flexShrink: 0 }} />
                  <p style={{ fontSize: '14px', color: '#334155' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={120}>
          <div style={{ background: '#0f172a', borderRadius: '20px', padding: '36px', color: 'white', textAlign: 'center' }}>
            <Building2 style={{ width: '40px', height: '40px', color: '#93c5fd', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Enterprise Pricing</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: 1.6 }}>Custom pricing based on agent count, brand requirements, and integration scope.</p>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '13px 28px', borderRadius: '10px', background: '#1A73E8', color: 'white', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>
              Request a Demo <ArrowRight style={{ width: '15px', height: '15px' }} />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>

  </SiteLayout>
);

export default BrokeragesPage;
