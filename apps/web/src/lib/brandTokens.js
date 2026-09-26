// ═══════════════════════════════════════════════════════════════════════
// CasaCEO brand tokens — the ONE source for color and type.
// Marketing pages and the app both import from here so they can't drift.
//
// Color roles (one job per color):
//   NAVY   structure + ink for headlines, icon badges, primary buttons
//   GOLD   brand accent only: wordmark "CEO", focus rings, small highlights
//   TONE   status colors: red = past due ONLY, amber = needs attention,
//          green = all good, quiet = neutral
//
// Type:
//   FONT_SANS   Outfit — everything in the app, all body text everywhere
//   FONT_SERIF  marketing headlines only (the landing page's one flourish)
// ═══════════════════════════════════════════════════════════════════════

export const NAVY = '#1e3a5f';
export const GOLD = '#c9a96e';
export const GOLD_INK = '#8a6d3b';   // gold dark enough for text on light surfaces (AA)

export const INK = '#1f2733';        // body text on light surfaces
export const MUTED = '#5b6472';      // secondary text
export const FAINT = '#95a0ae';      // tertiary text, captions

export const PAPER = '#faf8f4';      // warm page background
export const SAND = '#f3efe8';       // warm tint for icon wells / soft fills
export const LINE = '#e9e4db';       // card borders
export const LINE_SOFT = '#f0ece4';  // inner dividers

// Status palette — light-surface pairs, all text/bg combinations pass AA.
export const TONE = {
  red:   { text: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  amber: { text: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  green: { text: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
  quiet: { text: MUTED,     bg: PAPER,     border: LINE },
};

// Status colors for use ON navy (hero, dark sections).
export const TONE_ON_NAVY = {
  green: '#6ee7b7',
  gold: '#e6d3ae',
};

export const FONT_SANS = "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
export const FONT_SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif";