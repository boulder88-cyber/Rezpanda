import React from 'react';

export const CasaCEOLogo = ({ className, size = 'md' }) => {
  const sizes = {
    sm: { card: 120, house: 0.5, text: 14, tagline: 7 },
    md: { card: 180, house: 0.75, text: 20, tagline: 8 },
    lg: { card: 260, house: 1, text: 28, tagline: 9 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className || ''}`}>
      {/* Icon */}
      <svg width={s.card * 0.28} height={s.card * 0.28} viewBox="0 0 56 56" fill="none">
        <rect width="56" height="56" rx="14" fill="#1e3a5f"/>
        <g transform="translate(28, 32)">
          <rect x="-14" y="0" width="28" height="20" rx="4" fill="#ffffff" opacity="0.92"/>
          <path d="M-18 2 L0 -16 L18 2 Z" fill="#ffffff" opacity="0.92"/>
          <path d="M-5 20 L-5 8 Q-5 3 0 3 Q5 3 5 8 L5 20 Z" fill="#e8604c"/>
          <rect x="-13" y="3" width="8" height="7" rx="2.5" fill="#e8604c" opacity="0.75"/>
          <rect x="5" y="3" width="8" height="7" rx="2.5" fill="#e8604c" opacity="0.75"/>
          <rect x="6" y="-14" width="4" height="6" rx="2" fill="#ffffff" opacity="0.7"/>
        </g>
      </svg>

      {/* Wordmark */}
      <div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: s.text, lineHeight: 1, color: '#1e3a5f', letterSpacing: '-0.5px' }}>
          Casa<span style={{ color: '#e8604c' }}>CEO</span>
        </div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, fontSize: s.tagline, color: '#94a3b8', letterSpacing: '2px', marginTop: '2px' }}>
          BE THE CEO OF YOUR HOMES
        </div>
      </div>
    </div>
  );
};

// Icon only — for app icon / favicon use
export const CasaCEOIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
    <rect width="56" height="56" rx="14" fill="#1e3a5f"/>
    <g transform="translate(28, 32)">
      <rect x="-14" y="0" width="28" height="20" rx="4" fill="#ffffff" opacity="0.92"/>
      <path d="M-18 2 L0 -16 L18 2 Z" fill="#ffffff" opacity="0.92"/>
      <path d="M-5 20 L-5 8 Q-5 3 0 3 Q5 3 5 8 L5 20 Z" fill="#e8604c"/>
      <rect x="-13" y="3" width="8" height="7" rx="2.5" fill="#e8604c" opacity="0.75"/>
      <rect x="5" y="3" width="8" height="7" rx="2.5" fill="#e8604c" opacity="0.75"/>
      <rect x="6" y="-14" width="4" height="6" rx="2" fill="#ffffff" opacity="0.7"/>
    </g>
  </svg>
);

export default CasaCEOLogo;
