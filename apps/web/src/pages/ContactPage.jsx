import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from './SiteLayout.jsx';
import { ArrowRight, Mail, ShieldCheck, CheckCircle2, Send } from 'lucide-react';

/*
  CasaCEO — Contact (/contact)
  --------------------------------------------------------------------------
  Reframed from the old HomeOS contact/demo page. Removed: coral/blue palette,
  agent/brokerage/family-office role buttons, the "CompassHomeOS" demo block,
  enterprise/sales framing, and the dead /home-profile CTA. Wrapped in
  SiteLayout (it rendered bare before — no header/footer). Kept a simple,
  honest contact form (name / email / message) and two real support emails.

  NOTE: the form is front-end only — on submit it shows a confirmation but
  does not yet POST anywhere. Wiring it to a real inbox/endpoint is a separate
  task; flagged so it isn't mistaken for a working pipe.
*/

const INK = '#1C3553';
const SKY = '#3E6BA8';
const GOLD = '#c9a96e';
const PAPER = '#F6F3EC';
const SAND = '#EFE9DD';
const SAGE = '#6B8F71';
const STONE = '#6E6A62';
const LINE = '#E3DCCE';

const serif = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const Wordmark = () => (
  <span style={{ textTransform: 'none', whiteSpace: 'nowrap' }}>Casa<span style={{ color: GOLD }}>CEO</span></span>
);

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};
const FadeIn = ({ children, delay = 0 }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
};

const SUPPORT_ITEMS = [
  { icon: Mail, label: 'General & support', value: 'hello@casaceo.com', desc: 'Questions, help getting set up, anything about your account.' },
  { icon: ShieldCheck, label: 'Privacy & security', value: 'security@casaceo.com', desc: 'Data, privacy, and security inquiries.' },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  };

  const inputStyle = { fontFamily: sans, width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: `1px solid ${LINE}`, fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontFamily: sans, fontSize: '12px', fontWeight: 600, color: INK, display: 'block', marginBottom: '6px' };

  return (
    <SiteLayout seo={{ title: 'Contact — CasaCEO' }} fullWidth>
      {/* Hero */}
      <section style={{ background: INK, padding: '82px 24px 70px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: '560px', height: '560px', borderRadius: '50%', background: 'rgba(62,107,168,0.22)', filter: 'blur(20px)', top: '-200px', right: '-130px' }} />
        </div>
        <div style={{ maxWidth: '620px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: '#BBD0EC', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' }}>Contact</p>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 4.5vw, 2.9rem)', fontWeight: 600, color: '#fff', lineHeight: 1.12, letterSpacing: '-0.015em', marginBottom: '16px' }}>
            Questions? We\u2019re happy to help.
          </h1>
          <p style={{ fontFamily: sans, fontSize: '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
            Drop us a note and we\u2019ll get back to you, usually within a business day.
          </p>
        </div>
      </section>

      {/* Form + contacts */}
      <section style={{ padding: '70px 24px', background: PAPER }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>

          {/* Form */}
          <FadeIn>
            <div style={{ background: '#fff', borderRadius: '18px', border: `1px solid ${LINE}`, padding: '32px' }}>
              <h2 style={{ fontFamily: serif, fontSize: '24px', fontWeight: 600, color: INK, marginBottom: '6px', letterSpacing: '-0.01em' }}>Send us a message</h2>
              <p style={{ fontFamily: sans, fontSize: '14px', color: STONE, marginBottom: '26px' }}>We typically respond within one business day.</p>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '36px 16px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#EEF2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <CheckCircle2 style={{ width: '30px', height: '30px', color: SAGE }} />
                  </div>
                  <p style={{ fontFamily: serif, fontSize: '20px', fontWeight: 600, color: INK, marginBottom: '6px' }}>Message received.</p>
                  <p style={{ fontFamily: sans, fontSize: '14px', color: STONE }}>We\u2019ll be in touch within a business day.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Name *</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Message *</label>
                    <textarea value={form.message} onChange={e => set('message', e.target.value)} placeholder="How can we help?"
                      style={{ ...inputStyle, height: '120px', padding: '12px 14px', resize: 'none', lineHeight: 1.6 }} />
                  </div>
                  <button onClick={handleSubmit} disabled={!form.name || !form.email || !form.message}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: sans, padding: '14px', fontSize: '15px', fontWeight: 700, color: '#fff', background: INK, border: 'none', borderRadius: '11px', cursor: 'pointer', width: '100%', opacity: (!form.name || !form.email || !form.message) ? 0.4 : 1, transition: 'opacity 0.15s' }}>
                    <Send style={{ width: '16px', height: '16px' }} /> Send message
                  </button>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Contact emails */}
          <FadeIn delay={120}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fff', borderRadius: '18px', border: `1px solid ${LINE}`, padding: '28px' }}>
                <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '18px' }}>Reach us directly</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {SUPPORT_ITEMS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon style={{ width: '18px', height: '18px', color: INK }} />
                        </div>
                        <div>
                          <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 700, color: INK }}>{item.label}</p>
                          <p style={{ fontFamily: sans, fontSize: '13px', color: SKY, fontWeight: 600 }}>{item.value}</p>
                          <p style={{ fontFamily: sans, fontSize: '12.5px', color: STONE, marginTop: '2px', lineHeight: 1.5 }}>{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: SAND, borderRadius: '18px', border: `1px solid ${LINE}`, padding: '24px' }}>
                <p style={{ fontFamily: serif, fontSize: '17px', fontWeight: 600, color: INK, marginBottom: '6px' }}>Just want to try it?</p>
                <p style={{ fontFamily: sans, fontSize: '13.5px', color: STONE, lineHeight: 1.6, marginBottom: '16px' }}>
                  You can add your first property and start in a few minutes — no need to talk to us first.
                </p>
                <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: sans, padding: '11px 22px', borderRadius: '10px', background: INK, color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                  Get started <ArrowRight style={{ width: '15px', height: '15px' }} />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ContactPage;
