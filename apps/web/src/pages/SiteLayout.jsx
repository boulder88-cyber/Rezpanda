import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import SiteHeader from './SiteHeader.jsx';
import SiteFooter from './SiteFooter.jsx';

// ═══════════════════════════════════════════════════════════════════════
// SEO COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export const SEO = ({
  title = 'HomeOS — The Operating System for Homeownership',
  description = 'HomeOS organizes your home, documents, maintenance, insurance, and valuation in one intelligent platform.',
  canonical,
  og = {},
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    {canonical && <link rel="canonical" href={canonical} />}
    <meta property="og:title" content={og.title || title} />
    <meta property="og:description" content={og.description || description} />
    <meta property="og:type" content="website" />
    {og.image && <meta property="og:image" content={og.image} />}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={og.title || title} />
    <meta name="twitter:description" content={og.description || description} />
  </Helmet>
);

// ═══════════════════════════════════════════════════════════════════════
// SITE LAYOUT
// ═══════════════════════════════════════════════════════════════════════

const SiteLayout = ({
  children,
  seo = {},
  fullWidth = false,
  hideHeader = false,
  hideFooter = false,
}) => {
  // Scroll to top on mount
  // Scroll handling. With a hash, scroll to that section; otherwise to top.
  // Re-runs on path OR hash change, so anchor links work even when you're
  // already on the page (BrowserRouter does not scroll to hashes on its own).
  //
  // Why this is more involved than a one-liner: every section on these pages
  // is wrapped in a fade-in that starts offset and invisible, and sections
  // mount/expand as React paints. A single requestAnimationFrame fires before
  // the target has settled, so scrollIntoView lands short (looks like "jumps
  // to top"). We instead RETRY for a short window until the element exists and
  // its position stops moving, and we offset for the sticky header height.
  const location = useLocation();
  useEffect(() => {
    const HEADER_OFFSET = 80; // sticky header (64px) + a little breathing room

    if (!location.hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = decodeURIComponent(location.hash.slice(1));
    let cancelled = false;
    let lastTop = null;
    let stableCount = 0;
    const start = Date.now();

    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(id);

      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
        // Keep nudging until the measured position holds steady across a few
        // frames (i.e. fade-in/layout has settled), then do the final scroll.
        if (lastTop !== null && Math.abs(top - lastTop) < 2) {
          stableCount += 1;
        } else {
          stableCount = 0;
        }
        lastTop = top;
        window.scrollTo({ top, behavior: 'smooth' });
        if (stableCount >= 2) return; // settled — stop retrying
      }

      // Retry for up to ~1.2s, then give up gracefully.
      if (Date.now() - start < 1200) {
        requestAnimationFrame(tryScroll);
      } else if (!el) {
        window.scrollTo(0, 0);
      }
    };

    // Start after the current paint so the section has begun mounting.
    requestAnimationFrame(tryScroll);
    return () => { cancelled = true; };
  }, [location.pathname, location.hash]);

  return (
    <>
      <SEO {...seo} />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#ffffff' }}>
        {!hideHeader && <SiteHeader />}
        <main style={{ flex: 1 }}>
          {fullWidth ? children : (
            <div style={{ maxWidth: 'var(--container-max, 1280px)', margin: '0 auto', padding: '0 var(--container-pad, 24px)', width: '100%' }}>
              {children}
            </div>
          )}
        </main>
        {!hideFooter && <SiteFooter />}
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SHARED SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

export const SectionContainer = ({ children, bg = '#ffffff', py = '80px', style = {} }) => (
  <section style={{ background: bg, padding: `${py} 0`, ...style }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
      {children}
    </div>
  </section>
);

export const SectionLabel = ({ text, color = '#1A73E8' }) => (
  <p style={{ fontSize: '12px', fontWeight: 700, color, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>
    {text}
  </p>
);

export const SectionHeading = ({ children, center = false, size = '2.5rem', style = {} }) => (
  <h2 style={{ fontSize: size, fontWeight: 700, lineHeight: 1.2, color: '#0F172A', textAlign: center ? 'center' : 'left', marginBottom: '16px', letterSpacing: '-0.02em', ...style }}>
    {children}
  </h2>
);

export const SectionSubtext = ({ children, center = false }) => (
  <p style={{ fontSize: '18px', lineHeight: 1.7, color: '#64748b', textAlign: center ? 'center' : 'left', maxWidth: center ? '600px' : undefined, margin: center ? '0 auto' : undefined }}>
    {children}
  </p>
);

export const Button = ({ children, variant = 'primary', size = 'md', href, onClick, style = {} }) => {
  const sizes = { sm: { padding: '8px 18px', fontSize: '13px' }, md: { padding: '12px 24px', fontSize: '15px' }, lg: { padding: '15px 32px', fontSize: '16px' } };
  const variants = {
    primary: { background: '#1A73E8', color: 'white', border: 'none' },
    secondary: { background: 'transparent', color: '#1A73E8', border: '2px solid #1A73E8' },
    navy: { background: '#1e3a5f', color: 'white', border: 'none' },
    coral: { background: '#e8604c', color: 'white', border: 'none' },
    outline: { background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.4)' },
  };
  const base = { ...sizes[size], ...variants[variant], borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', transition: 'opacity 0.15s, transform 0.15s', ...style };
  const El = href ? 'a' : 'button';
  return <El href={href} onClick={onClick} style={base} onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{children}</El>;
};

export const Card = ({ children, style = {}, hover = false }) => (
  <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: hover ? 'box-shadow 0.2s, transform 0.2s' : undefined, ...style }}
    onMouseEnter={hover ? e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; } : undefined}
    onMouseLeave={hover ? e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; } : undefined}>
    {children}
  </div>
);

export default SiteLayout;
