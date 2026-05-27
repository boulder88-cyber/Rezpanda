import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Mail, Phone, MessageCircle, CheckCircle2,
  Play, Building2, Users, Home, Briefcase, Send
} from 'lucide-react';

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
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
      transform: visible ? 'translateY(0)' : 'translateY(22px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

const SectionLabel = ({ text, light = false }) => (
  <p style={{ fontSize: '12px', fontWeight: 600, color: light ? 'rgba(232,96,76,0.9)' : '#e8604c', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px' }}>
    {text}
  </p>
);

const ROLES = [
  { value: 'homeowner', label: 'Homeowner', icon: Home },
  { value: 'agent', label: 'Agent', icon: Users },
  { value: 'brokerage', label: 'Brokerage', icon: Building2 },
  { value: 'family-office', label: 'Family Office', icon: Briefcase },
];

const SUPPORT_ITEMS = [
  { icon: Mail, label: 'Email Support', value: 'hello@casaceo.com', desc: 'General inquiries and homeowner support.' },
  { icon: Building2, label: 'Enterprise & Sales', value: 'enterprise@casaceo.com', desc: 'Brokerage partnerships and white-label demos.' },
  { icon: MessageCircle, label: 'Security Contact', value: 'security@casaceo.com', desc: 'Data privacy and security inquiries.' },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  };

  return (
    <>
      <Helmet><title>Contact & Demo — HomeOS</title></Helmet>
      <div className="min-h-screen bg-white overflow-x-hidden">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden" style={{ background: '#1e3a5f', padding: '100px 32px 80px' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute rounded-full opacity-5" style={{ width: '600px', height: '600px', background: '#e8604c', top: '-150px', right: '-100px' }} />
            <div className="absolute rounded-full opacity-5" style={{ width: '350px', height: '350px', background: '#c9a96e', bottom: '-80px', left: '-60px' }} />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, background: 'rgba(232,96,76,0.15)', color: '#e8604c', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(232,96,76,0.3)' }}>
                Contact & Demo
              </span>
            </div>
            <h1 className="font-semibold text-white" style={{ fontSize: '52px', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-0.02em' }}>
              Let's build the future of<br />homeownership together.
            </h1>
            <p className="text-blue-200" style={{ fontSize: '18px', lineHeight: '1.75', maxWidth: '500px', margin: '0 auto' }}>
              Whether you're a homeowner, agent, or brokerage, we'd love to hear from you.
            </p>
          </div>
        </section>

        {/* ── CONTACT FORM + DEMO ── */}
        <section style={{ padding: '80px 32px', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* Contact Form */}
              <FadeIn>
                <div className="bg-white" style={{ borderRadius: '20px', border: '1px solid #e2e8f0', padding: '36px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <SectionLabel text="Get in Touch" />
                  <h2 className="font-semibold text-slate-900" style={{ fontSize: '28px', lineHeight: '1.2', marginBottom: '8px' }}>Send us a message.</h2>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>We typically respond within one business day.</p>

                  {submitted ? (
                    <div className="text-center" style={{ padding: '40px 20px' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <CheckCircle2 style={{ width: '32px', height: '32px', color: '#059669' }} />
                      </div>
                      <p className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '8px' }}>Message received.</p>
                      <p style={{ fontSize: '14px', color: '#64748b' }}>We'll be in touch within one business day.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Name + Email */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Name *</label>
                          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name"
                            style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Email *</label>
                          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com"
                            style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Phone <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                        <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000"
                          style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                      </div>

                      {/* Role selector */}
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>I am a…</label>
                        <div className="grid grid-cols-2 gap-2">
                          {ROLES.map(role => {
                            const Icon = role.icon;
                            const selected = form.role === role.value;
                            return (
                              <button key={role.value} onClick={() => set('role', role.value)}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', border: `2px solid ${selected ? '#1e3a5f' : '#e2e8f0'}`, background: selected ? '#eef2f8' : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                                <Icon style={{ width: '16px', height: '16px', color: selected ? '#1e3a5f' : '#94a3b8' }} />
                                <span style={{ fontSize: '13px', fontWeight: 600, color: selected ? '#1e3a5f' : '#64748b' }}>{role.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Message *</label>
                        <textarea value={form.message} onChange={e => set('message', e.target.value)} placeholder="Tell us what you're looking for, or ask any question…"
                          style={{ width: '100%', height: '120px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: '1.6' }} />
                      </div>

                      <button onClick={handleSubmit} disabled={!form.name || !form.email || !form.message}
                        className="flex items-center justify-center gap-2 font-semibold text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-40"
                        style={{ padding: '14px', fontSize: '15px', background: '#1e3a5f', border: 'none', cursor: 'pointer', width: '100%' }}>
                        <Send style={{ width: '16px', height: '16px' }} /> Send Message
                      </button>
                    </div>
                  )}
                </div>
              </FadeIn>

              {/* Demo Request + Support */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Demo Request */}
                <FadeIn delay={120}>
                  <div style={{ borderRadius: '20px', border: '2px solid #c7d7eb', padding: '32px', background: '#eef2f8' }}>
                    <SectionLabel text="Request a Demo" />
                    <h2 className="font-semibold text-slate-900" style={{ fontSize: '26px', lineHeight: '1.2', marginBottom: '20px' }}>
                      See HomeOS in action.
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                      {[
                        '30-minute live walkthrough',
                        'See HomeOS in action',
                        'Learn how CompassHomeOS works',
                        'Ask questions, get answers',
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 style={{ width: '16px', height: '16px', color: '#1e3a5f', flexShrink: 0 }} />
                          <p style={{ fontSize: '14px', color: '#334155' }}>{item}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => set('message', 'I\'d like to request a 30-minute HomeOS demo.')}
                      className="flex items-center justify-center gap-2 font-semibold text-white rounded-xl hover:opacity-90 transition-all"
                      style={{ padding: '13px 24px', fontSize: '14px', background: '#1e3a5f', border: 'none', cursor: 'pointer', width: '100%' }}>
                      <Play style={{ width: '15px', height: '15px' }} /> Request Demo
                    </button>
                  </div>
                </FadeIn>

                {/* Support */}
                <FadeIn delay={180}>
                  <div className="bg-white" style={{ borderRadius: '20px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <SectionLabel text="Support" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {SUPPORT_ITEMS.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#eef2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon style={{ width: '17px', height: '17px', color: '#1e3a5f' }} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{item.label}</p>
                              <p style={{ fontSize: '12px', color: '#e8604c', fontWeight: 600 }}>{item.value}</p>
                              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER CTA ── */}
        <section style={{ padding: '80px 32px', background: '#1e3a5f', position: 'relative', overflow: 'hidden' }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute rounded-full opacity-5" style={{ width: '400px', height: '400px', background: '#e8604c', top: '-80px', right: '-80px' }} />
          </div>
          <div className="relative z-10" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
            <FadeIn>
              <h2 className="font-semibold text-white" style={{ fontSize: '38px', lineHeight: '1.15', marginBottom: '16px' }}>Ready to start?</h2>
              <p className="text-blue-200" style={{ fontSize: '16px', lineHeight: '1.7', marginBottom: '36px' }}>No credit card required. HomeOS is free to start.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/home-profile" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '14px 28px', fontSize: '15px' }}>
                  Start Free <ArrowRight style={{ width: '16px', height: '16px' }} />
                </Link>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 font-semibold rounded-2xl border hover:bg-white/10 transition-all" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '14px 28px', fontSize: '15px', background: 'transparent', cursor: 'pointer' }}>
                  Contact Sales
                </button>
              </div>
            </FadeIn>
          </div>
        </section>

      </div>
    </>
  );
};

export default ContactPage;
