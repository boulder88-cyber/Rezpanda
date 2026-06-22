import React from 'react';
import SiteLayout from './SiteLayout.jsx';
import { Sparkles, CreditCard, Wrench, FileText, ShieldCheck } from 'lucide-react';

/*
  CasaCEO — Changelog (/changelog)
  --------------------------------------------------------------------------
  The old changelog was a fictional HomeOS release history (Insurance
  Analyzer, Valuation Dashboard, CompassHomeOS, 14 launch modules). Replaced
  with one honest "just launching" entry describing what actually exists:
  the three pillars, per-property pricing, no bank access. As real releases
  ship, add entries above this one.
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

const HERE_NOW = [
  { icon: CreditCard, label: 'Bill Pay', desc: 'Forward a bill and it files itself — sorted by provider and due date, with a quick review step for anything uncertain.' },
  { icon: Wrench, label: 'Maintenance', desc: 'Set recurring upkeep once and let the right reminders come back on their own, per property.' },
  { icon: ShieldCheck, label: 'Private by design', desc: 'No bank access, no stored card, no money moved by the app. The structured details of a bill are kept — not a long-term copy of the file.' },
];

const COMING = [
  { icon: FileText, label: 'Documents', desc: 'A findable home for deeds, policies, warranties, and receipts.' },
];

const ChangelogPage = () => (
  <SiteLayout seo={{ title: 'Changelog — CasaCEO' }} fullWidth>
    {/* Hero */}
    <section style={{ background: INK, padding: '78px 24px 62px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '520px', height: '520px', borderRadius: '50%', background: 'rgba(62,107,168,0.22)', filter: 'blur(20px)', top: '-200px', right: '-120px' }} />
      </div>
      <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <Sparkles style={{ width: '26px', height: '26px', color: GOLD }} />
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 4vw, 2.7rem)', fontWeight: 600, color: '#fff', marginBottom: '14px', letterSpacing: '-0.015em' }}>What\u2019s new</h1>
        <p style={{ fontFamily: sans, fontSize: '17px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
          <Wordmark /> is just getting started. Here\u2019s where things stand today.
        </p>
      </div>
    </section>

    {/* Single honest entry */}
    <section style={{ padding: '64px 24px', background: PAPER }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: '18px', border: `1px solid ${LINE}`, overflow: 'hidden' }}>
          <div style={{ height: '3px', background: GOLD }} />
          <div style={{ padding: '28px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <p style={{ fontFamily: serif, fontSize: '22px', fontWeight: 600, color: INK }}>Launch</p>
              <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 700, color: SAGE, background: '#EEF2EC', padding: '3px 10px', borderRadius: '999px' }}>Now</span>
            </div>
            <p style={{ fontFamily: sans, fontSize: '14px', color: STONE, lineHeight: 1.6, marginBottom: '24px' }}>
              The first version of <Wordmark /> — a calm place to run your home, built around three simple things and a firm privacy boundary.
            </p>

            <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Here now</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              {HERE_NOW.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '13px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ width: '18px', height: '18px', color: INK }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: sans, fontSize: '14.5px', fontWeight: 700, color: INK, marginBottom: '2px' }}>{item.label}</p>
                      <p style={{ fontFamily: sans, fontSize: '13.5px', color: STONE, lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: SKY, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Coming soon</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {COMING.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '13px', opacity: 0.85 }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: SAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ width: '18px', height: '18px', color: INK }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: sans, fontSize: '14.5px', fontWeight: 700, color: INK, marginBottom: '2px' }}>{item.label}</p>
                      <p style={{ fontFamily: sans, fontSize: '13.5px', color: STONE, lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p style={{ fontFamily: sans, fontSize: '13px', color: STONE, textAlign: 'center', marginTop: '24px', lineHeight: 1.6 }}>
          We\u2019ll post updates here as new things ship. Thanks for being early.
        </p>
      </div>
    </section>
  </SiteLayout>
);

export default ChangelogPage;
