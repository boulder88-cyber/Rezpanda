import React, { useState } from 'react';
import { Zap, Droplets, ChevronDown } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// QUICK GUIDES — low-key stick-figure how-tos for the handful of things
// worth knowing before you need them (a tripped breaker, the main water
// shutoff). Lives on the "Home care" tab, above the seasonal schedule.
//
// Tone: laid back, not alarmist. These are the two most common "something's
// wrong and I need to act in the next 5 minutes" moments a homeowner hits —
// the goal is calm, correct, and quick to scan, not a full home-repair
// course. Each guide ends with a plain "when to stop and call someone"
// line, because that's the part people actually need reassurance about.
//
// Built as plain inline SVG + CSS @keyframes, matching this codebase's
// real convention — framer-motion is listed in package.json but isn't
// actually used anywhere in apps/web/src, so it isn't introduced here.
// Motion is slow and looping ("low key"), and every animation freezes on
// a clear pose under prefers-reduced-motion.
//
// Design tokens match MaintenanceHelpPanel.jsx / MaintenanceManagementPage.jsx
// exactly, so this reads as the same product, not a bolted-on widget.
// ═══════════════════════════════════════════════════════════════════════

const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';
const INK = '#1f2733';
const INK_SOFT = '#5b6472';
const INK_MUTE = '#95a0ae';
const SURFACE = '#ffffff';
const BORDER = '#e9e4db';
const NAVY_TINT = '#eef2f7';

// ─── Shared keyframes, scoped by class name so the two animations never
// collide with each other or anything else on the page. ──────────────────
const GuideStyles = () => (
  <style>{`
    @keyframes qgBreakerLever {
      0%, 20%   { transform: translateY(0); }
      45%, 60%  { transform: translateY(20px); }
      85%, 100% { transform: translateY(0); }
    }
    @keyframes qgBreakerHand {
      0%, 20%   { transform: translate(0, 0); }
      45%, 60%  { transform: translate(4px, 18px); }
      85%, 100% { transform: translate(0, 0); }
    }
    @keyframes qgValveTurn {
      0%, 15%   { transform: rotate(0deg); }
      50%       { transform: rotate(-95deg); }
      85%, 100% { transform: rotate(0deg); }
    }
    .qg-breaker-lever { animation: qgBreakerLever 4.5s ease-in-out infinite; }
    .qg-breaker-hand  { animation: qgBreakerHand 4.5s ease-in-out infinite; }
    .qg-valve-wheel   { animation: qgValveTurn 5s ease-in-out infinite; transform-origin: 150px 92px; }
    @media (prefers-reduced-motion: reduce) {
      .qg-breaker-lever, .qg-breaker-hand, .qg-valve-wheel { animation: none; }
    }
  `}</style>
);

// A calm little stick figure — reused by both scenes, just repositioned.
const StickFigure = ({ x = 0, y = 0 }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle cx="0" cy="0" r="10" fill={SURFACE} stroke={INK} strokeWidth="3" />
    <line x1="0" y1="10" x2="0" y2="52" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="0" y1="52" x2="-14" y2="86" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="0" y1="52" x2="12" y2="88" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="0" y1="22" x2="-16" y2="42" stroke={INK} strokeWidth="3" strokeLinecap="round" />
  </g>
);

const BreakerAnimation = () => (
  <svg viewBox="0 0 220 150" width="100%" height="150" role="img" aria-label="A stick figure firmly resetting a tripped breaker switch">
    {/* the person, standing beside the panel */}
    <StickFigure x={55} y={48} />
    {/* reaching arm + hand, synced with the lever */}
    <g className="qg-breaker-hand">
      <line x1="55" y1="70" x2="118" y2="66" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="118" cy="66" r="5" fill={GOLD} />
    </g>

    {/* the panel */}
    <rect x="110" y="20" width="90" height="115" rx="8" fill={SURFACE} stroke={BORDER} strokeWidth="2" />
    <rect x="120" y="30" width="70" height="95" rx="5" fill={NAVY_TINT} stroke={BORDER} />

    {/* four ordinary breakers, resting "on" */}
    {[0, 1, 3, 4].map((i) => (
      <g key={i}>
        <rect x={128 + i * 12} y="46" width="8" height="40" rx="4" fill={BORDER} />
        <rect x={129 + i * 12} y="48" width="6" height="16" rx="3" fill={INK_MUTE} />
      </g>
    ))}

    {/* the tripped one — animated, so it visibly resets */}
    <rect x="152" y="46" width="8" height="40" rx="4" fill={BORDER} />
    <rect x="153" y="48" width="6" height="16" rx="3" fill={GOLD} className="qg-breaker-lever" />
  </svg>
);

const ValveAnimation = () => (
  <svg viewBox="0 0 220 150" width="100%" height="150" role="img" aria-label="A stick figure turning the main water shutoff valve clockwise">
    <StickFigure x={65} y={52} />
    {/* arm to the wheel rim */}
    <line x1="65" y1="72" x2="122" y2="88" stroke={INK} strokeWidth="3" strokeLinecap="round" />

    {/* pipe running down to the valve */}
    <rect x="140" y="106" width="20" height="34" fill={INK_MUTE} rx="2" />

    {/* the wheel — spokes + rim rotate together, hand stays put on the rim */}
    <g className="qg-valve-wheel">
      <circle cx="150" cy="92" r="26" fill="none" stroke={NAVY} strokeWidth="5" />
      <line x1="150" y1="66" x2="150" y2="118" stroke={NAVY} strokeWidth="4" />
      <line x1="124" y1="92" x2="176" y2="92" stroke={NAVY} strokeWidth="4" />
      <circle cx="150" cy="92" r="6" fill={GOLD} />
    </g>
  </svg>
);

// ─── Guide content ────────────────────────────────────────────────────────
const GUIDES = [
  {
    id: 'breaker',
    icon: Zap,
    title: 'Resetting a tripped breaker',
    teaser: 'Lights out in one room? Probably this — two minutes, no tools.',
    Animation: BreakerAnimation,
    steps: [
      'Find your panel — usually a metal box in a basement, garage, or utility closet.',
      "Look for the one switch that's out of line with the rest — it'll sit in the middle instead of matched up with its neighbors.",
      'Push it firmly all the way to OFF, then firmly back to ON. You should feel it click into place.',
    ],
    note: "If it trips again right away, stop resetting it — that usually means something's actually wrong on that circuit. Call an electrician instead.",
  },
  {
    id: 'valve',
    icon: Droplets,
    title: 'Turning off the main water shutoff',
    teaser: "Worth finding today, not during a leak — takes 30 seconds either way.",
    Animation: ValveAnimation,
    steps: [
      'Find the shutoff — usually where the main line enters the house: a basement, crawlspace, or a box near the street.',
      'Turn the valve clockwise ("righty-tighty") until it stops. No need to force it past that.',
      "Open a nearby faucet for a moment — it confirms the water's off and relieves pressure in the pipes.",
    ],
    note: "The real trick is knowing where it is before you need it. If you've never looked, that's the five minutes worth spending this week.",
  },
];

const GuideRow = ({ guide, isOpen, onToggle }) => {
  const Icon = guide.icon;
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
          padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: NAVY_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon style={{ width: '18px', height: '18px', color: NAVY }} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: INK }}>{guide.title}</div>
          <div style={{ fontSize: '13px', color: INK_MUTE, marginTop: '2px' }}>{guide.teaser}</div>
        </span>
        <ChevronDown
          style={{
            width: '18px', height: '18px', color: INK_MUTE, flexShrink: 0,
            transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {isOpen && (
        <div style={{ padding: '0 20px 24px 20px' }}>
          <div style={{
            background: '#faf8f4', borderRadius: '12px', border: `1px solid ${BORDER}`,
            padding: '16px', marginBottom: '16px',
          }}>
            <guide.Animation />
          </div>

          <ol style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: 0, padding: 0, listStyle: 'none' }}>
            {guide.steps.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%', background: NAVY, color: '#fff',
                  fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '1px',
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: '14px', color: INK_SOFT, lineHeight: 1.5 }}>{step}</span>
              </li>
            ))}
          </ol>

          <div style={{
            marginTop: '14px', padding: '10px 14px', borderRadius: '8px',
            background: '#fdf6e9', border: `1px solid ${GOLD}33`,
            fontSize: '13px', color: INK_SOFT, lineHeight: 1.5,
          }}>
            {guide.note}
          </div>
        </div>
      )}
    </div>
  );
};

const QuickGuidesSection = () => {
  const [openId, setOpenId] = useState(null);

  return (
    <div style={{
      background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`,
      overflow: 'hidden', marginBottom: '24px',
    }}>
      <GuideStyles />
      <div style={{ padding: '20px 20px 4px 20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: INK }}>Quick guides</h2>
        <p style={{ fontSize: '13px', color: INK_MUTE, marginTop: '4px' }}>
          A couple of everyday things worth knowing how to do — no rush, no tools required.
        </p>
      </div>

      {GUIDES.map((guide) => (
        <GuideRow
          key={guide.id}
          guide={guide}
          isOpen={openId === guide.id}
          onToggle={() => setOpenId(openId === guide.id ? null : guide.id)}
        />
      ))}
    </div>
  );
};

export default QuickGuidesSection;
