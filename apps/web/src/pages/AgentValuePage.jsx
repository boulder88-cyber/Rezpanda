import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Users, Home, TrendingUp, Bell, FileText,
  Shield, Star, CheckCircle2, MessageCircle, Award,
  Repeat, Lightbulb, BarChart2, Calendar, Wrench
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION HOOK
// ═══════════════════════════════════════════════════════════════════════

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
};

const FadeIn = ({ children, delay = 0 }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SHARED
// ═══════════════════════════════════════════════════════════════════════

const SectionLabel = ({ text, light = false }) => (
  <p style={{ fontSize: '12px', fontWeight: 600, color: light ? 'rgba(232,96,76,0.9)' : '#e8604c', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px' }}>
    {text}
  </p>
);

const Divider = () => (
  <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 32px' }}>
    <div style={{ height: '1px', background: '#e2e8f0' }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════

const VALUE_POINTS = [
  {
    number: '01', icon: Repeat, color: '#1e3a5f', bg: '#eef2f8',
    title: 'Always-On Client Relationship',
    desc: 'HomeOS becomes the homeowner\'s daily command center — and the agent stays connected through it. Every time a client checks their home, they see your brand.',
  },
  {
    number: '02', icon: Home, color: '#059669', bg: '#ecfdf5',
    title: 'Post-Closing Value',
    desc: 'Agents provide ongoing support: maintenance reminders, valuation updates, insurance insights, and more — creating real value long after the keys are handed over.',
  },
  {
    number: '03', icon: Bell, color: '#d97706', bg: '#fffbeb',
    title: 'Automated Touchpoints',
    desc: 'HomeOS generates natural, helpful reasons to reach out — without feeling salesy. Renewal alerts, maintenance milestones, and valuation updates keep the conversation alive.',
  },
  {
    number: '04', icon: Star, color: '#7c3aed', bg: '#f5f3ff',
    title: 'Lifetime Referral Engine',
    desc: 'When clients think about their home, they see the agent\'s brand inside HomeOS. Every interaction reinforces the relationship and drives repeat business.',
  },
  {
    number: '05', icon: Award, color: '#e8604c', bg: '#fdf0ee',
    title: 'Differentiation',
    desc: 'Agents offering HomeOS stand out in listing presentations and buyer consultations. No competitor can match a platform that keeps the relationship alive for years.',
  },
];

const AGENT_TOOLS = [
  { icon: Users, label: 'Client Home Profiles' },
  { icon: BarChart2, label: 'Portfolio Insights' },
  { icon: TrendingUp, label: 'Market Updates' },
  { icon: Home, label: 'Valuation Trends' },
  { icon: Wrench, label: 'Maintenance Alerts' },
  { icon: FileText, label: 'Document Requests' },
  { icon: Bell, label: 'Renewal Reminders' },
  { icon: MessageCircle, label: 'Client Messaging' },
];

const TESTIMONIALS = [
  {
    quote: 'HomeOS changed how I stay in touch with past clients. I\'m getting referrals from people I closed with three years ago because they see my name every time they check their home.',
    name: 'Sarah M.', role: 'Top Producer · Atlanta, GA', avatar: 'SM',
  },
  {
    quote: 'In listing presentations, showing clients that I\'ll support them with HomeOS after closing is a game-changer. It\'s the one thing competitors can\'t replicate.',
    name: 'James T.', role: 'Buyer\'s Specialist · St. Simons Island, GA', avatar: 'JT',
  },
  {
    quote: 'My repeat business has increased 40% since I started offering HomeOS. Clients stay loyal when they feel supported year-round.',
    name: 'Maria L.', role: 'Luxury Specialist · Buckhead, GA', avatar: 'ML',
  },
];

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

const AgentValuePage = () => (
  <>
    <Helmet><title>How HomeOS Elevates the Modern Real Estate Agent — CasaCEO</title></Helmet>
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden" style={{ background: '#1e3a5f', padding: '120px 32px 96px' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-5" style={{ width: '600px', height: '600px', background: '#e8604c', top: '-150px', right: '-100px' }} />
          <div className="absolute rounded-full opacity-5" style={{ width: '350px', height: '350px', background: '#c9a96e', bottom: '-80px', left: '-60px' }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, background: 'rgba(232,96,76,0.15)', color: '#e8604c', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(232,96,76,0.3)' }}>
              For Real Estate Agents
            </span>
          </div>
          <h1 className="font-semibold text-white" style={{ fontSize: '56px', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.02em' }}>
            Stay connected long<br />after closing.
          </h1>
          <p className="text-blue-200" style={{ fontSize: '20px', lineHeight: '1.75', maxWidth: '580px', margin: '0 auto 48px' }}>
            HomeOS gives agents a powerful way to support clients year-round — not just during the transaction.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/home-profile" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '16px 32px', fontSize: '16px' }}>
              Bring HomeOS to Your Clients <ArrowRight style={{ width: '18px', height: '18px' }} />
            </Link>
            <Link to="/homeos" className="flex items-center gap-2 font-semibold rounded-2xl border transition-all hover:bg-white/10" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '16px 32px', fontSize: '16px' }}>
              See How Agents Use HomeOS
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. THE AGENT PROBLEM ── */}
      <section style={{ padding: '96px 32px', background: 'white' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <SectionLabel text="The Agent Problem" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '24px' }}>
                Most agents lose touch<br />after closing.
              </h2>
              <p className="text-slate-500" style={{ fontSize: '17px', lineHeight: '1.8', marginBottom: '16px' }}>
                The traditional real estate relationship ends at the closing table. Clients move on. Agents lose visibility. Brokerages lose long-term engagement.
              </p>
              <p className="text-slate-500" style={{ fontSize: '17px', lineHeight: '1.8', marginBottom: '32px' }}>
                There's no system that keeps the relationship alive.
              </p>
              <p className="font-bold" style={{ fontSize: '22px', color: '#e8604c' }}>HomeOS changes that.</p>
            </FadeIn>
            <FadeIn delay={120}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { phase: 'During Transaction', status: 'Fully connected', ok: true },
                  { phase: 'At Closing', status: 'Handshake & goodbye', ok: false },
                  { phase: '6 Months Later', status: 'No contact', ok: false },
                  { phase: '1 Year Later', status: 'Client uses another agent', ok: false },
                  { phase: 'With HomeOS', status: 'Connected for life', ok: true, highlight: true },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between" style={{
                    padding: '14px 18px', borderRadius: '12px',
                    background: row.highlight ? '#1e3a5f' : row.ok ? '#ecfdf5' : '#fef2f2',
                    border: `1px solid ${row.highlight ? '#1e3a5f' : row.ok ? '#a7f3d0' : '#fecaca'}`,
                  }}>
                    <p className="font-semibold" style={{ fontSize: '14px', color: row.highlight ? 'white' : '#334155' }}>{row.phase}</p>
                    <div className="flex items-center gap-2">
                      {row.ok
                        ? <CheckCircle2 style={{ width: '14px', height: '14px', color: row.highlight ? '#86efac' : '#059669' }} />
                        : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                      }
                      <p style={{ fontSize: '13px', color: row.highlight ? '#93c5fd' : row.ok ? '#059669' : '#dc2626' }}>{row.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 3. HOW HOMEOS HELPS AGENTS ── */}
      <section style={{ padding: '96px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '56px' }}>
              <SectionLabel text="How HomeOS Helps Agents" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '16px' }}>
                A platform that keeps you<br />connected for life.
              </h2>
              <p className="text-slate-500" style={{ fontSize: '17px', maxWidth: '520px', margin: '0 auto' }}>
                Five ways HomeOS transforms the agent-client relationship from transactional to lifelong.
              </p>
            </div>
          </FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {VALUE_POINTS.map((vp, i) => {
              const Icon = vp.icon;
              return (
                <FadeIn key={i} delay={i * 70}>
                  <div className="bg-white" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="flex items-start gap-6">
                      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '52px', height: '52px', borderRadius: '14px', background: vp.bg }}>
                        <Icon style={{ width: '24px', height: '24px', color: vp.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: vp.color, background: vp.bg, padding: '2px 8px', borderRadius: '999px' }}>{vp.number}</span>
                          <h3 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>{vp.title}</h3>
                        </div>
                        <p className="text-slate-500" style={{ fontSize: '15px', lineHeight: '1.7' }}>{vp.desc}</p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 4. AGENT TOOLS ── */}
      <section style={{ padding: '96px 32px', background: 'white' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '48px' }}>
              <SectionLabel text="Agent Tools Inside HomeOS" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15' }}>
                Everything you need to stay connected.
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AGENT_TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <FadeIn key={i} delay={i * 60}>
                  <div className="bg-white text-center hover:shadow-md hover:-translate-y-0.5 transition-all" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-center justify-center mx-auto" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2f8', marginBottom: '12px' }}>
                      <Icon style={{ width: '22px', height: '22px', color: '#1e3a5f' }} />
                    </div>
                    <p className="font-semibold text-slate-800" style={{ fontSize: '14px' }}>{tool.label}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 5. TESTIMONIALS ── */}
      <section style={{ padding: '96px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '48px' }}>
              <SectionLabel text="Agent Testimonials" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '40px', lineHeight: '1.15' }}>
                Agents who use HomeOS win more business.
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="bg-white" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '20px' }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} style={{ width: '14px', height: '14px', color: '#f59e0b', display: 'inline-block', fill: '#f59e0b' }} />
                    ))}
                  </div>
                  <p className="text-slate-600 flex-1" style={{ fontSize: '15px', lineHeight: '1.8', marginBottom: '24px', fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center font-bold text-white flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e3a5f', fontSize: '13px' }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{t.name}</p>
                      <p className="text-slate-400" style={{ fontSize: '12px' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CTA ── */}
      <section style={{ padding: '96px 32px', background: '#1e3a5f', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full opacity-5" style={{ width: '500px', height: '500px', background: '#e8604c', top: '-100px', right: '-100px' }} />
          <div className="absolute rounded-full opacity-5" style={{ width: '300px', height: '300px', background: '#c9a96e', bottom: '-60px', left: '-60px' }} />
        </div>
        <div className="relative z-10" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <SectionLabel text="Get Started" light />
            <h2 className="font-semibold text-white" style={{ fontSize: '44px', lineHeight: '1.15', marginBottom: '20px' }}>
              Bring HomeOS to Your Clients
            </h2>
            <p className="text-blue-200" style={{ fontSize: '18px', lineHeight: '1.7', marginBottom: '40px' }}>
              Give clients a reason to stay loyal — and give yourself a reason to stay top of mind every day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/home-profile" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '16px 32px', fontSize: '16px' }}>
                Bring HomeOS to Your Clients <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
              <Link to="/homeos" className="flex items-center gap-2 font-semibold rounded-2xl border hover:bg-white/10 transition-all" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '16px 32px', fontSize: '16px' }}>
                See How Agents Use HomeOS
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  </>
);

export default AgentValuePage;
