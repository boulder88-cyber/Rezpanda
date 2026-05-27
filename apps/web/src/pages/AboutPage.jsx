import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Home, Star, Lightbulb, Shield, Heart,
  TrendingUp, CheckCircle2, Building2, Briefcase, Users
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
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
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

const Divider = () => (
  <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px' }}>
    <div style={{ height: '1px', background: '#e2e8f0' }} />
  </div>
);

const VALUES = [
  { icon: Lightbulb, label: 'Simplicity', desc: 'Homeownership is complex. HomeOS makes it simple.', color: '#d97706', bg: '#fffbeb' },
  { icon: Shield, label: 'Trust', desc: 'Your data is yours. Always transparent, always secure.', color: '#1e3a5f', bg: '#eef2f8' },
  { icon: TrendingUp, label: 'Intelligence', desc: 'Proactive insights — not just storage.', color: '#059669', bg: '#ecfdf5' },
  { icon: Star, label: 'Continuity', desc: "Your home's history preserved forever.", color: '#7c3aed', bg: '#f5f3ff' },
  { icon: Heart, label: 'Empowerment', desc: 'Every homeowner deserves clarity and control.', color: '#e8604c', bg: '#fdf0ee' },
];

const TIMELINE = [
  { year: '2023', title: 'Concept', desc: 'The idea: every home deserves a digital operating system. Research begins.' },
  { year: '2024', title: 'Prototype', desc: 'First version of CasaCEO built. Core modules — maintenance, documents, valuation — take shape.' },
  { year: '2025', title: 'HomeOS v1', desc: 'Full platform launch. HomeOS domain portfolio assembled covering 36% of US real estate market.' },
  { year: '2026', title: 'CompassHomeOS Expansion', desc: 'White-label enterprise platform launched. Partnership conversations underway with leading brokerages.' },
];

const AboutPage = () => (
  <>
    <Helmet><title>About HomeOS — The Operating System for Homeownership</title></Helmet>
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
              About HomeOS
            </span>
          </div>
          <h1 className="font-semibold text-white" style={{ fontSize: '52px', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-0.02em' }}>
            A new category for the most<br />important asset in your life.
          </h1>
          <p className="text-blue-200" style={{ fontSize: '18px', lineHeight: '1.75', maxWidth: '540px', margin: '0 auto' }}>
            HomeOS was created to bring clarity, intelligence, and continuity to homeownership.
          </p>
        </div>
      </section>

      {/* ── FOUNDER STORY ── */}
      <section style={{ padding: '80px 32px', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <FadeIn>
              <SectionLabel text="Why HomeOS Was Created" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '36px', lineHeight: '1.15', marginBottom: '24px' }}>
                The home deserved<br />something better.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {[
                  'The home is the largest asset in most people\'s lives.',
                  'Yet it has no system, no memory, no intelligence.',
                  'Homeownership is fragmented and stressful.',
                  'HomeOS was created to fix that.',
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 style={{ width: '18px', height: '18px', color: '#e8604c', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.7' }}>{line}</p>
                  </div>
                ))}
              </div>
              <p className="font-bold" style={{ fontSize: '20px', color: '#1e3a5f', borderLeft: '4px solid #e8604c', paddingLeft: '16px', lineHeight: '1.5' }}>
                "To give every homeowner clarity,<br />control, and confidence."
              </p>
            </FadeIn>

            {/* Founder Bio */}
            <FadeIn delay={120}>
              <div style={{ background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {/* Photo placeholder */}
                <div style={{ height: '220px', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a9e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '2px solid rgba(255,255,255,0.3)' }}>
                      <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>D</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Founder Photo</p>
                  </div>
                </div>
                <div style={{ padding: '28px' }}>
                  <p className="font-semibold text-slate-900" style={{ fontSize: '20px', marginBottom: '4px' }}>Dan</p>
                  <p style={{ fontSize: '13px', color: '#e8604c', fontWeight: 600, marginBottom: '20px' }}>Founder, HomeOS / CasaCEO</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { icon: Briefcase, text: 'Senior VP at a financial services firm' },
                      { icon: Home, text: 'Founder of CasaCEO / HomeOS' },
                      { icon: Building2, text: 'Family office operator for UHNW clients' },
                      { icon: TrendingUp, text: 'Deep experience in real estate, finance & operations' },
                      { icon: Star, text: 'Mission: create the Home Ownership Operating System' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#eef2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon style={{ width: '14px', height: '14px', color: '#1e3a5f' }} />
                          </div>
                          <p style={{ fontSize: '14px', color: '#475569' }}>{item.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── MISSION ── */}
      <section style={{ padding: '80px 32px', background: '#1e3a5f' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <SectionLabel text="Mission" light />
            <h2 className="font-semibold text-white" style={{ fontSize: '44px', lineHeight: '1.2', marginBottom: '20px' }}>
              "To give every homeowner<br />clarity, control, and confidence."
            </h2>
            <p className="text-blue-200" style={{ fontSize: '17px', lineHeight: '1.8' }}>
              HomeOS exists to transform homeownership from a source of stress into a source of strength — by giving every homeowner the system their home deserves.
            </p>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── VALUES ── */}
      <section style={{ padding: '80px 32px', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '48px' }}>
              <SectionLabel text="Our Values" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '36px', lineHeight: '1.15' }}>What we stand for.</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <FadeIn key={i} delay={i * 70}>
                  <div className="bg-white text-center hover:shadow-md hover:-translate-y-0.5 transition-all" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Icon style={{ width: '24px', height: '24px', color: v.color }} />
                    </div>
                    <p className="font-semibold text-slate-900" style={{ fontSize: '17px', marginBottom: '8px' }}>{v.label}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>{v.desc}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── TIMELINE ── */}
      <section style={{ padding: '80px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <FadeIn>
            <div className="text-center" style={{ marginBottom: '56px' }}>
              <SectionLabel text="Our Story" />
              <h2 className="font-semibold text-slate-900" style={{ fontSize: '36px', lineHeight: '1.15' }}>How we got here.</h2>
            </div>
          </FadeIn>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {TIMELINE.map((item, i) => {
              const isLast = i === TIMELINE.length - 1;
              return (
                <FadeIn key={i} delay={i * 80}>
                  <div style={{ display: 'flex', gap: '0' }}>
                    {/* Spine */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '72px', flexShrink: 0 }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: i === TIMELINE.length - 1 ? '#e8604c' : '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, boxShadow: '0 0 0 4px #f8fafc' }}>
                        <p style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>{item.year.slice(-2)}'</p>
                      </div>
                      {!isLast && <div style={{ width: '2px', flex: 1, background: '#e2e8f0', minHeight: '32px' }} />}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, paddingLeft: '20px', paddingBottom: isLast ? '0' : '40px', paddingTop: '8px' }}>
                      <div className="flex items-center gap-3" style={{ marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#e8604c', background: '#fdf0ee', padding: '2px 8px', borderRadius: '999px' }}>{item.year}</span>
                        <p className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>{item.title}</p>
                      </div>
                      <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.7' }}>{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 32px', background: '#1e3a5f', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full opacity-5" style={{ width: '400px', height: '400px', background: '#e8604c', top: '-80px', right: '-80px' }} />
        </div>
        <div className="relative z-10" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <h2 className="font-semibold text-white" style={{ fontSize: '38px', lineHeight: '1.15', marginBottom: '16px' }}>Explore HomeOS</h2>
            <p className="text-blue-200" style={{ fontSize: '16px', lineHeight: '1.7', marginBottom: '36px' }}>
              Join the homeowners, agents, and brokerages building the future of homeownership.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/homeos" className="flex items-center gap-2 font-semibold text-white rounded-2xl hover:opacity-90 transition-all" style={{ background: '#e8604c', padding: '14px 28px', fontSize: '15px' }}>
                Explore HomeOS <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
              <Link to="/contact" className="flex items-center gap-2 font-semibold rounded-2xl border hover:bg-white/10 transition-all" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '14px 28px', fontSize: '15px' }}>
                Contact Us
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  </>
);

export default AboutPage;
