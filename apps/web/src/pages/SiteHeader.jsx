import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// NAV DATA
// ═══════════════════════════════════════════════════════════════════════

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Product', href: '/product' },
  { label: 'For Agents', href: '/agents' },
  { label: 'For Brokerages', href: '/brokerages' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '/resources' },
  { label: 'Support', href: '/support' },
];

// ═══════════════════════════════════════════════════════════════════════
// LOGO
// ═══════════════════════════════════════════════════════════════════════

const HomeOSLogo = ({ dark = false }) => (
  <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
    {/* Icon mark */}
    <div style={{
      width: '32px', height: '32px', borderRadius: '8px',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #1A73E8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L2 6.5V14h4v-4h4v4h4V6.5L8 2z" fill="white" fillOpacity="0.95" />
      </svg>
    </div>
    {/* Wordmark */}
    <span style={{ fontSize: '18px', fontWeight: 800, color: dark ? 'white' : '#0F172A', letterSpacing: '-0.02em' }}>
      HomeOS
    </span>
  </Link>
);

// ═══════════════════════════════════════════════════════════════════════
// MOBILE DRAWER
// ═══════════════════════════════════════════════════════════════════════

const MobileDrawer = ({ open, onClose }) => {
  const location = useLocation();

  useEffect(() => { onClose(); }, [location.pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 150, backdropFilter: 'blur(2px)' }} />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '80%', maxWidth: '320px',
        background: 'white', zIndex: 151, display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      }}>
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <HomeOSLogo />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X style={{ width: '20px', height: '20px', color: '#64748b' }} />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          {NAV_LINKS.map(link => (
            <Link key={link.href} to={link.href} style={{
              display: 'block', padding: '13px 24px', fontSize: '16px', fontWeight: 500,
              color: '#334155', textDecoration: 'none', borderBottom: '1px solid #f8fafc',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Bottom CTAs */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/login" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '15px', fontWeight: 600, color: '#334155', textDecoration: 'none' }}>
            Log In
          </Link>
          <Link to="/signup" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: '10px', background: '#1A73E8', fontSize: '15px', fontWeight: 600, color: 'white', textDecoration: 'none' }}>
            Get Started →
          </Link>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN HEADER
// ═══════════════════════════════════════════════════════════════════════

const SiteHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (href) => location.pathname === href;

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Left — Logo */}
          <HomeOSLogo />

          {/* Center — Nav links (desktop) */}
          <nav className="hidden lg:flex" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {NAV_LINKS.map(link => (
              <Link key={link.href} to={link.href} style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: isActive(link.href) ? 700 : 500,
                color: isActive(link.href) ? '#1A73E8' : '#475569',
                background: isActive(link.href) ? '#EFF6FF' : 'transparent',
                textDecoration: 'none', transition: 'color 0.15s, background 0.15s', whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { if (!isActive(link.href)) { e.currentTarget.style.color = '#1A73E8'; e.currentTarget.style.background = '#F8FAFC'; } }}
                onMouseLeave={e => { if (!isActive(link.href)) { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; } }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right — Auth CTAs (desktop) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Desktop only */}
            <Link to="/login" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#475569', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#1A73E8'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              className="hidden sm:block"
            >
              Log In
            </Link>
            <Link to="/signup" style={{
              padding: '8px 18px', borderRadius: '8px', background: '#1A73E8', color: 'white',
              fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Get Started <ArrowRight style={{ width: '14px', height: '14px' }} />
            </Link>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', marginLeft: '4px', display: 'none' }}
              className="lg:hidden" aria-label="Open menu">
              <Menu style={{ width: '22px', height: '22px', color: '#475569' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Inline CSS for responsive visibility */}
      <style>{`
        @media (max-width: 1023px) {
          nav.hidden { display: none !important; }
          a.hidden { display: none !important; }
          button.lg\\:hidden { display: block !important; }
        }
        @media (min-width: 1024px) {
          button.lg\\:hidden { display: none !important; }
        }
        @media (min-width: 640px) {
          a.hidden { display: block !important; }
        }
      `}</style>
    </>
  );
};

export default SiteHeader;
export { HomeOSLogo };
