import React, { useState } from 'react';
import { Zap, Droplets, Droplet, Plug, BellRing, Waves, RotateCcw, Flame, ChevronDown } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// QUICK GUIDES — low-key, slightly goofy stick-figure how-tos for the
// handful of things worth knowing before you need them. Lives on the
// "Home care" tab, above the seasonal schedule.
//
// Tone: light humor, not a full comedy routine. Funnier copy plus a small
// "ta-da" bounce/sparkle once the fix lands — still reads as trustworthy
// how-to content, not a meme account. The gas guide is the one deliberate
// exception: real safety stakes (smell gas → get everyone out → get help),
// so it stays calm and straight-faced, no jokes, no victory bounce, and it
// explicitly stops short of anything involving relighting a flame — that
// part is the gas company's job, not a homeowner's.
//
// Built as plain inline SVG + CSS @keyframes, matching this codebase's real
// convention — framer-motion is listed in package.json but isn't actually
// used anywhere in apps/web/src, so it isn't introduced here. Motion stays
// slow and looping, and every animation freezes on a clear pose under
// prefers-reduced-motion.
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

// ─── Shared keyframes, scoped by class name so animations never collide
// with each other or anything else on the page. ──────────────────────────
const GuideStyles = () => (
  <style>{`
    /* a lever/button being pushed and released */
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
    /* a smaller button press (outlet, disposal) */
    @keyframes qgSmallPress {
      0%, 20%   { transform: translateY(0); }
      45%, 60%  { transform: translateY(7px); }
      85%, 100% { transform: translateY(0); }
    }
    @keyframes qgSmallPressHand {
      0%, 20%   { transform: translate(0, 0); }
      45%, 60%  { transform: translate(2px, 6px); }
      85%, 100% { transform: translate(0, 0); }
    }
    /* a quarter-turn of a wheel or oval valve handle — origin set per element */
    @keyframes qgQuarterTurn {
      0%, 15%   { transform: rotate(0deg); }
      50%       { transform: rotate(-95deg); }
      85%, 100% { transform: rotate(0deg); }
    }
    /* a gentle up-and-down pump (plunger) */
    @keyframes qgPump {
      0%, 15%   { transform: translateY(0); }
      50%       { transform: translateY(16px); }
      85%, 100% { transform: translateY(0); }
    }
    /* a slow reaching bob (detector) */
    @keyframes qgBob {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-5px); }
    }
    /* an indicator light pulsing, or settling from "alert" to "calm" */
    @keyframes qgPulse {
      0%, 45%   { opacity: 1; }
      55%, 100% { opacity: 0.3; }
    }
    @keyframes qgSettle {
      0%, 45%   { opacity: 0.35; }
      55%, 100% { opacity: 1; }
    }
    /* sound waves expanding and fading */
    @keyframes qgWaveExpand {
      0%, 100% { opacity: 0.6; transform: scale(0.92); }
      50%      { opacity: 0.1; transform: scale(1.08); }
    }
    /* the little "ta-da" — a small hop and wobble once the fix lands. Not
       used on the gas guide, on purpose. */
    @keyframes qgVictoryBounce {
      0%, 65%   { transform: translate(0, 0) rotate(0deg); }
      74%       { transform: translate(0, -8px) rotate(-6deg); }
      82%       { transform: translate(0, 2px) rotate(4deg); }
      90%       { transform: translate(0, -2px) rotate(-2deg); }
      100%      { transform: translate(0, 0) rotate(0deg); }
    }
    /* a small sparkle that pops in right as the fix lands */
    @keyframes qgSparkle {
      0%, 62%   { opacity: 0; transform: scale(0.4) rotate(0deg); }
      74%       { opacity: 1; transform: scale(1.15) rotate(15deg); }
      88%, 100% { opacity: 0; transform: scale(0.7) rotate(15deg); }
    }

    .qg-breaker-lever { animation: qgBreakerLever 4.5s ease-in-out infinite; }
    .qg-breaker-hand  { animation: qgBreakerHand 4.5s ease-in-out infinite; }
    .qg-valve-wheel   { animation: qgQuarterTurn 5s ease-in-out infinite; transform-origin: 150px 92px; }
    .qg-shutoff-valve { animation: qgQuarterTurn 5s ease-in-out infinite; transform-origin: 120px 140px; }
    .qg-gas-valve     { animation: qgQuarterTurn 5s ease-in-out infinite; transform-origin: 150px 95px; }
    .qg-outlet-button { animation: qgSmallPress 4.5s ease-in-out infinite; }
    .qg-outlet-hand   { animation: qgSmallPressHand 4.5s ease-in-out infinite; }
    .qg-outlet-led    { animation: qgSettle 4.5s ease-in-out infinite; }
    .qg-disposal-button { animation: qgSmallPress 4.5s ease-in-out infinite; }
    .qg-disposal-hand   { animation: qgSmallPressHand 4.5s ease-in-out infinite; }
    .qg-plunger-cup   { animation: qgPump 4.5s ease-in-out infinite; }
    .qg-plunger-hand  { animation: qgPump 4.5s ease-in-out infinite; }
    .qg-detector-hand { animation: qgBob 3.2s ease-in-out infinite; }
    .qg-detector-led  { animation: qgPulse 1.6s ease-in-out infinite; }
    .qg-detector-wave { animation: qgWaveExpand 2.4s ease-in-out infinite; transform-origin: 150px 20px; }
    .qg-detector-wave2 { animation: qgWaveExpand 2.4s ease-in-out infinite 0.4s; transform-origin: 150px 20px; }
    .qg-victory       { animation: qgVictoryBounce 4.5s ease-in-out infinite; }
    .qg-sparkle       { animation: qgSparkle 4.5s ease-in-out infinite; }

    @media (prefers-reduced-motion: reduce) {
      .qg-breaker-lever, .qg-breaker-hand, .qg-valve-wheel, .qg-shutoff-valve,
      .qg-gas-valve, .qg-outlet-button, .qg-outlet-hand, .qg-outlet-led,
      .qg-disposal-button, .qg-disposal-hand, .qg-plunger-cup, .qg-plunger-hand,
      .qg-detector-hand, .qg-detector-led, .qg-detector-wave, .qg-detector-wave2,
      .qg-victory, .qg-sparkle {
        animation: none;
      }
    }
  `}</style>
);

// A calm little stick figure — reused across scenes, just repositioned.
// Reaching arms are drawn separately per scene, starting at (x, y+22), so
// each guide can aim the arm at its own target while every figure still
// reads as the same character.
const StickFigure = ({ x = 0, y = 0 }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle cx="0" cy="0" r="10" fill={SURFACE} stroke={INK} strokeWidth="3" />
    <line x1="0" y1="10" x2="0" y2="52" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="0" y1="52" x2="-14" y2="86" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="0" y1="52" x2="12" y2="88" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    <line x1="0" y1="22" x2="-16" y2="42" stroke={INK} strokeWidth="3" strokeLinecap="round" />
  </g>
);

// A little 4-ray sparkle, for the moment a fix lands. Wrapped in an outer,
// statically-positioned <g> so the CSS scale/opacity animation on the inner
// <g> has a clean local origin — SVG elements don't reliably combine an
// attribute `transform` and an animated CSS `transform` on the SAME node,
// so position and animation are always split across a parent/child pair
// throughout this file.
const Sparkle = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <g className="qg-sparkle">
      <line x1="0" y1="-8" x2="0" y2="8" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
      <line x1="-8" y1="0" x2="8" y2="0" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
      <line x1="-5.5" y1="-5.5" x2="5.5" y2="5.5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="-5.5" y1="5.5" x2="5.5" y2="-5.5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </g>
);

const BreakerAnimation = () => (
  <svg viewBox="0 0 220 150" width="100%" height="150" role="img" aria-label="A stick figure triumphantly resetting a tripped breaker switch">
    <g className="qg-victory" style={{ transformOrigin: '55px 90px' }}>
      <StickFigure x={55} y={48} />
      <g className="qg-breaker-hand">
        <line x1="55" y1="70" x2="118" y2="66" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="118" cy="66" r="5" fill={GOLD} />
      </g>
    </g>

    <rect x="110" y="20" width="90" height="115" rx="8" fill={SURFACE} stroke={BORDER} strokeWidth="2" />
    <rect x="120" y="30" width="70" height="95" rx="5" fill={NAVY_TINT} stroke={BORDER} />

    {[0, 1, 3, 4].map((i) => (
      <g key={i}>
        <rect x={128 + i * 12} y="46" width="8" height="40" rx="4" fill={BORDER} />
        <rect x={129 + i * 12} y="48" width="6" height="16" rx="3" fill={INK_MUTE} />
      </g>
    ))}

    <rect x="152" y="46" width="8" height="40" rx="4" fill={BORDER} />
    <rect x="153" y="48" width="6" height="16" rx="3" fill={GOLD} className="qg-breaker-lever" />
    <Sparkle x={175} y={40} />
  </svg>
);

const ValveAnimation = () => (
  <svg viewBox="0 0 220 150" width="100%" height="150" role="img" aria-label="A stick figure proudly turning the main water shutoff valve clockwise">
    <g className="qg-victory" style={{ transformOrigin: '65px 95px' }}>
      <StickFigure x={65} y={52} />
      <line x1="65" y1="72" x2="122" y2="88" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </g>

    <rect x="140" y="106" width="20" height="34" fill={INK_MUTE} rx="2" />

    <g className="qg-valve-wheel">
      <circle cx="150" cy="92" r="26" fill="none" stroke={NAVY} strokeWidth="5" />
      <line x1="150" y1="66" x2="150" y2="118" stroke={NAVY} strokeWidth="4" />
      <line x1="124" y1="92" x2="176" y2="92" stroke={NAVY} strokeWidth="4" />
      <circle cx="150" cy="92" r="6" fill={GOLD} />
    </g>
    <Sparkle x={183} y={70} />
  </svg>
);

const OutletAnimation = () => (
  <svg viewBox="0 0 220 150" width="100%" height="150" role="img" aria-label="A stick figure pressing the reset button on a GFCI outlet, delighted when it works">
    <g className="qg-victory" style={{ transformOrigin: '55px 92px' }}>
      <StickFigure x={55} y={50} />
      <g className="qg-outlet-hand">
        <line x1="55" y1="72" x2="115" y2="92" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="115" cy="92" r="5" fill={GOLD} />
      </g>
    </g>

    <rect x="120" y="45" width="55" height="85" rx="6" fill={SURFACE} stroke={BORDER} strokeWidth="2" />
    <rect x="132" y="55" width="5" height="12" rx="1" fill={INK_MUTE} />
    <rect x="148" y="55" width="5" height="12" rx="1" fill={INK_MUTE} />
    <circle cx="140" cy="75" r="3" fill={INK_MUTE} />

    {/* TEST button — static */}
    <rect x="127" y="95" width="16" height="11" rx="2" fill={INK_SOFT} />
    {/* RESET button — the one being pressed */}
    <rect x="147" y="95" width="16" height="11" rx="2" fill={GOLD} className="qg-outlet-button" />
    {/* indicator light — dim until reset, then steady */}
    <circle cx="155" cy="118" r="3" fill={GOLD} className="qg-outlet-led" />
    <Sparkle x={185} y="108" />
  </svg>
);

const DetectorAnimation = () => (
  <svg viewBox="0 0 220 150" width="100%" height="150" role="img" aria-label="A stick figure reaching up, mildly exasperated, to swap the battery in a chirping smoke detector">
    <ellipse cx="150" cy="20" rx="30" ry="9" fill={SURFACE} stroke={BORDER} strokeWidth="2" />
    <path d="M 128 8 Q 150 -10 172 8" stroke={GOLD} strokeWidth="2" fill="none" className="qg-detector-wave" />
    <path d="M 118 12 Q 150 -20 182 12" stroke={GOLD} strokeWidth="2" fill="none" className="qg-detector-wave2" />
    <circle cx="150" cy="20" r="4" fill={GOLD} className="qg-detector-led" />

    <g className="qg-victory" style={{ transformOrigin: '100px 140px' }}>
      <g transform="translate(100, 100)">
        <circle cx="0" cy="0" r="10" fill={SURFACE} stroke={INK} strokeWidth="3" />
        <line x1="0" y1="10" x2="0" y2="45" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="45" x2="-13" y2="78" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="45" x2="11" y2="80" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="18" x2="-15" y2="32" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className="qg-detector-hand">
        <line x1="100" y1="115" x2="140" y2="45" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <rect x="132" y="30" width="14" height="18" rx="2" fill={GOLD} />
      </g>
    </g>
  </svg>
);

const ShutoffValveAnimation = () => (
  <svg viewBox="0 0 220 150" width="100%" height="150" role="img" aria-label="A stick figure turning a toilet's shutoff valve a quarter turn, pleased with itself">
    <g className="qg-victory" style={{ transformOrigin: '55px 100px' }}>
      <StickFigure x={55} y={58} />
      <line x1="55" y1="80" x2="118" y2="108" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="118" cy="108" r="5" fill={GOLD} />
    </g>

    {/* toilet, simplified */}
    <rect x="150" y="65" width="40" height="42" rx="6" fill={SURFACE} stroke={BORDER} strokeWidth="2" />
    <path d="M 148 105 C 148 122 192 122 192 105 L 192 118 C 192 132 148 132 148 118 Z" fill={SURFACE} stroke={BORDER} strokeWidth="2" />
    <ellipse cx="170" cy="132" rx="30" ry="9" fill={SURFACE} stroke={BORDER} strokeWidth="2" />

    {/* supply line + shutoff handle */}
    <line x1="118" y1="120" x2="140" y2="120" stroke={INK_MUTE} strokeWidth="4" />
    <ellipse cx="118" cy="120" rx="11" ry="6" fill={NAVY} className="qg-shutoff-valve" />
    <Sparkle x={100} y={98} />
  </svg>
);

const PlungerAnimation = () => (
  <svg viewBox="0 0 220 150" width="100%" height="150" role="img" aria-label="A stick figure plunging a clogged sink drain with visible determination">
    {/* sink */}
    <rect x="95" y="82" width="110" height="48" rx="6" fill={NAVY_TINT} stroke={BORDER} strokeWidth="2" />
    <ellipse cx="150" cy="82" rx="55" ry="14" fill={SURFACE} stroke={BORDER} strokeWidth="2" />
    <ellipse cx="150" cy="82" rx="8" ry="3" fill={INK_MUTE} />

    <g className="qg-victory" style={{ transformOrigin: '55px 82px' }}>
      <g className="qg-plunger-hand">
        <line x1="55" y1="62" x2="140" y2="40" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="140" cy="40" r="5" fill={GOLD} />
      </g>
      <StickFigure x={55} y={40} />
    </g>

    <g className="qg-plunger-cup">
      <line x1="150" y1="6" x2="150" y2="40" stroke={INK_SOFT} strokeWidth="5" strokeLinecap="round" />
      <path d="M 130 40 Q 150 66 170 40 Z" fill={INK} />
    </g>
  </svg>
);

const DisposalAnimation = () => (
  <svg viewBox="0 0 220 150" width="100%" height="150" role="img" aria-label="A stick figure pressing the reset button under a jammed garbage disposal, relieved when it works">
    {/* underside of the sink, with the disposal canister hanging down */}
    <rect x="95" y="20" width="110" height="30" rx="4" fill={NAVY_TINT} stroke={BORDER} strokeWidth="2" />
    <rect x="120" y="48" width="60" height="16" fill={INK_MUTE} />
    <rect x="132" y="62" width="36" height="55" rx="10" fill={SURFACE} stroke={BORDER} strokeWidth="2" />

    <g className="qg-victory" style={{ transformOrigin: '70px 115px' }}>
      <StickFigure x={70} y={75} />
      <g className="qg-disposal-hand">
        <line x1="70" y1="97" x2="127" y2="110" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="127" cy="110" r="5" fill={GOLD} />
      </g>
    </g>

    <circle cx="150" cy="112" r="6" fill={GOLD} className="qg-disposal-button" />
    <Sparkle x={175} y={100} />
  </svg>
);

// The gas guide stays deliberately plain: no victory bounce, no sparkle,
// no jokes in the animation. Real stakes, calm illustration.
const GasAnimation = () => (
  <svg viewBox="0 0 220 150" width="100%" height="150" role="img" aria-label="A stick figure calmly turning off the main gas shutoff valve">
    <StickFigure x={60} y={55} />
    <line x1="60" y1="77" x2="120" y2="95" stroke={INK} strokeWidth="3" strokeLinecap="round" />

    {/* gas meter + pipe */}
    <rect x="130" y="55" width="55" height="45" rx="6" fill={SURFACE} stroke={BORDER} strokeWidth="2" />
    <circle cx="157" cy="77" r="14" fill={NAVY_TINT} stroke={BORDER} strokeWidth="2" />
    <line x1="130" y1="95" x2="115" y2="95" stroke={INK_MUTE} strokeWidth="6" />

    {/* the shutoff valve, a quarter turn from open to closed */}
    <g className="qg-gas-valve">
      <line x1="150" y1="95" x2="150" y2="120" stroke={INK_MUTE} strokeWidth="5" />
      <rect x="132" y="90" width="36" height="10" rx="3" fill={NAVY} />
    </g>
  </svg>
);

// ─── Guide content ────────────────────────────────────────────────────────
const GUIDES = [
  {
    id: 'breaker',
    icon: Zap,
    title: 'Resetting a tripped breaker',
    teaser: "Half the kitchen went dark and someone's asking if you paid the bill? Probably not. Probably this.",
    Animation: BreakerAnimation,
    steps: [
      'Find your panel — usually a metal box in a basement, garage, or utility closet.',
      "Look for the one switch that's out of line with the rest — it'll sit in the middle instead of matched up with its neighbors.",
      "Push it firmly all the way to OFF, then firmly back to ON. You should feel it click into place — deeply satisfying, no notes.",
    ],
    note: "If it trips again right away, stop resetting it — that usually means something's actually wrong on that circuit. Call an electrician instead.",
  },
  {
    id: 'valve',
    icon: Droplets,
    title: 'Turning off the main water shutoff',
    teaser: "The one valve standing between 'burst hose' and 'oddly calm Tuesday.'",
    Animation: ValveAnimation,
    steps: [
      'Find the shutoff — usually where the main line enters the house: a basement, crawlspace, or a box near the street.',
      'Turn the valve clockwise ("righty-tighty") until it stops. No need to force it past that.',
      "Open a nearby faucet for a moment — it confirms the water's off and relieves pressure in the pipes.",
    ],
    note: "The real trick is knowing where it is before you need it. If you've never looked, that's the five minutes worth spending this week — not at 2am with a towel in your hand.",
  },
  {
    id: 'outlet',
    icon: Plug,
    title: 'Resetting a GFCI outlet',
    teaser: "Your hair dryer isn't broken. The outlet is just having a moment.",
    Animation: OutletAnimation,
    steps: [
      "Find the outlet with TEST and RESET buttons — usually in a bathroom, kitchen, garage, or outdoors. One dead GFCI can knock out several outlets on the same circuit.",
      'Press RESET firmly. A soft click and the outlet is usually live again — congratulate yourself accordingly.',
      "If it won't stay reset, unplug whatever was plugged in first and try again — a faulty appliance is a common cause.",
    ],
    note: "A GFCI that keeps tripping with nothing plugged in may be nearing the end of its life, or there's a wiring issue. That one's worth a call.",
  },
  {
    id: 'detector',
    icon: BellRing,
    title: 'Silencing a chirping smoke or CO detector',
    teaser: "That single 2am beep every 45 seconds isn't a ghost. It's a $4 battery, being dramatic.",
    Animation: DetectorAnimation,
    steps: [
      'Figure out which unit is chirping — walk the house and listen; with multiple units, it can take a minute (and some muttering).',
      'Pop it off its mounting bracket (usually a quarter-twist) and swap in a fresh battery of the type it calls for.',
      "Press and hold the test button until it beeps once, confirming it's back online, then remount it and enjoy the silence.",
    ],
    note: "If a fresh battery doesn't stop the chirping, or the unit is more than 8-10 years old, it's time to replace the whole detector rather than keep swapping batteries.",
  },
  {
    id: 'shutoff',
    icon: Droplet,
    title: 'Shutting off water to a toilet or sink',
    teaser: "A toilet auditioning for a water feature doesn't need the whole house shut down — just this.",
    Animation: ShutoffValveAnimation,
    steps: [
      "Look for the small oval handle on the supply line — behind or beside the toilet, or in the cabinet under a sink.",
      'Turn it clockwise a quarter turn, until the handle sits crosswise to the pipe instead of in line with it.',
      "That stops water to just that fixture — everything else in the house keeps running normally, blissfully unaware.",
    ],
    note: "If the handle won't turn, or turns but doesn't stop the water, don't force it — that's a sign it needs replacing, and the main shutoff is your backup in the meantime.",
  },
  {
    id: 'plunger',
    icon: Waves,
    title: 'Clearing a slow or clogged drain',
    teaser: "The single most satisfying 30 seconds in home maintenance. Try this before the chemicals.",
    Animation: PlungerAnimation,
    steps: [
      "Fill the sink with a couple inches of water — it helps the plunger seal and pushes the pressure through.",
      "Press the plunger down over the drain to force out the air, then pump firmly up and down 10-15 times without breaking the seal. This is the fun part.",
      "Pull it away on an upstroke to release the clog, then run hot water to confirm it's draining freely.",
    ],
    note: "Skip the plunger on a drain you've already dosed with chemical cleaner — it can splash back. And if plunging doesn't clear it after a couple of tries, it's a plumber's job, not a stronger-chemical job.",
  },
  {
    id: 'disposal',
    icon: RotateCcw,
    title: 'Freeing a jammed garbage disposal',
    teaser: "It's humming a little tune but refusing to actually spin. Rude. Here's the fix.",
    Animation: DisposalAnimation,
    steps: [
      "Turn it off at the switch first — always, before you put anything near it.",
      "If it has one, use the small hex key in the center hole underneath to manually work the flywheel back and forth until it turns freely.",
      "Press the small red reset button on the bottom of the unit, then turn the switch back on and run water to test.",
    ],
    note: "Never put your hand down the drain to clear a jam, even with the power off. If the hex key and reset button don't fix it, that's a call to a plumber or appliance repair, not a workaround.",
  },
  {
    id: 'gas',
    icon: Flame,
    title: 'If you smell gas: the shutoff',
    teaser: "This one has exactly one job — get it off, then get help.",
    Animation: GasAnimation,
    steps: [
      "If you smell gas (a strong, rotten-egg odor), don't flip any switches or light anything — just get everyone outside right away.",
      "If you know where the meter is and can reach it safely, turn the shutoff valve a quarter turn until the handle sits crosswise to the pipe. If you're not sure or can't get to it safely, skip straight to the next step.",
      "From outside, call your gas company or 911. Don't go back in until they tell you it's safe.",
    ],
    note: "This guide stops at 'get the gas off.' Turning it back on and relighting pilot lights is the gas company's job, not a homeowner's — never attempt that part yourself.",
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
          A handful of everyday things worth knowing how to do — no rush, no special tools.
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
