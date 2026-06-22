import React from 'react';
import { Link } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════════
// TOKENS (mirror the marketing pages)
// ═══════════════════════════════════════════════════════════════════════

const INK = '#1C3553';   // warmed navy — footer background + brand
const GOLD = '#c9a96e';  // accent (CEO wordmark)
const serif = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// ═══════════════════════════════════════════════════════════════════════
// DATA
// Only links to pages/anchors that actually exist AND match the locked
// positioning (homeowner running their own home). Product anchors point at
// the three real sections on /product: #bills, #maintenance, #documents.
// ═══════════════════════════════════════════════════════════════════════

const FOOTER_COLS = [
  {
    heading: 'Product',
    links: [
      { label: 'Overview', href: '/product' },
      { label: 'Bill Pay', href: '/product#bills' },
      { label: 'Maintenance', href: '/product#maintenance' },
      { label: 'Documents', href: '/product#documents' },
    ],
  },
  {
    heading: 'For you',
    links: [
      { label: 'Homeowners', href: '/pricing' },
      { label: 'Multiple homes', href: '/properties' },
      { label: 'Caretakers', href: '/about' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Contact', href: '/contact' },
      { label: 'Security', href: '/security' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// SOCIAL ICONS (inline SVG)
// ═══════════════════════════════════════════════════════════════════════

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════

const SiteFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: INK, color: 'white', fontFamily: sans }}>
      {/* Main footer grid */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '48px', alignItems: 'flex-start' }}>

          {/* Column 1 — Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L2 6.5V14h4v-4h4v4h4V6.5L8 2z" fill="white" fillOpacity="0.95" />
                </svg>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                <span style={{ color: 'white' }}>Casa</span><span style={{ color: GOLD }}>CEO</span>
              </span>
            </Link>

            {/* Tagline — warm, home-positioned, no OS framing */}
            <p style={{ fontFamily: serif, fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '20px', maxWidth: '210px' }}>
              A calm place to run your home.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { icon: <LinkedInIcon />, href: 'https://linkedin.com', label: 'LinkedIn' },
                { icon: <TwitterIcon />, href: 'https://twitter.com', label: 'Twitter' },
              ].map(social => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"
                  aria-label={social.label}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Columns 2–5 */}
          {FOOTER_COLS.map(col => (
            <div key={col.heading}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                {col.heading}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.href} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.62)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'white'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.62)'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            © {currentYear} CasaCEO. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Status', '/status']].map(([label, href]) => (
              <Link key={label} to={href} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
