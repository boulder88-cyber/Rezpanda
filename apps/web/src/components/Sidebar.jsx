import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CreditCard, Wrench, FolderOpen, Compass, X, Building2, KeyRound, HelpCircle } from 'lucide-react';
import { useHome } from '@/contexts/HomeContext.jsx';
import HelpPanel from '@/components/HelpPanel.jsx';

// ── Design-system tokens (navy/gold, warm) ──────────────────────────────
const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';
const INK = '#1f2733';
const INK_SOFT = '#5b6472';
const INK_MUTE = '#95a0ae';
const PAGE = '#faf8f4';
const BORDER = '#e9e4db';
const ACTIVE_BG = '#f3eee4'; // warm tint behind the active item (gold-adjacent)

// Base nav (the locked 4 core items). The Rentals item is added conditionally
// inside the component — it only appears when the user has a rental property,
// so an ordinary homeowner never sees it and the rail stays at the core 4.
// This keeps the 5-tab discipline: Rentals is invisible-until-relevant, not a
// permanent fifth slot.
const NAV = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/bill-pay', label: 'Bills', icon: CreditCard },
  { path: '/maintenance-management', label: 'Maintenance', icon: Wrench },
  { path: '/documents', label: 'Records', icon: FolderOpen },
];

// A nav row. Active = warm tint + navy ink + a gold left-edge bar ("you are
// here"), the one place a gold accent genuinely earns its keep. Rest = quiet
// ink that warms on hover. No blue anywhere (that was the old palette).
const navRow = ({ isActive }) => ({
  position: 'relative',
  display: 'flex', alignItems: 'center', gap: '12px',
  padding: '10px 12px 10px 14px', borderRadius: '10px',
  fontSize: '14px', fontWeight: isActive ? 600 : 500,
  color: isActive ? NAVY : INK_SOFT,
  background: isActive ? ACTIVE_BG : 'transparent',
  textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
});

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { selectedHome, allProperties, otherScope, homes } = useHome();
  const [helpOpen, setHelpOpen] = useState(false);

  // Rentals appears only if the user owns at least one rental property.
  // Slotted right after Bills (rentals are a money surface), before
  // Maintenance — so the rail reads Home · Bills · Rentals · Maintenance ·
  // Records for landlords, and the plain core 4 for everyone else.
  const hasRental = (homes || []).some((h) => h && h.propertyType === 'rental');
  const navItems = hasRental
    ? [
        NAV[0],
        NAV[1],
        { path: '/rentals', label: 'Rentals', icon: KeyRound },
        NAV[2],
        NAV[3],
      ]
    : NAV;

  // What the grounding footer says you're looking at — always honest about scope.
  const scopeLabel = allProperties ? 'All properties'
    : otherScope ? 'Other & unassigned'
    : (selectedHome ? (selectedHome.name || selectedHome.address || 'Your property') : 'No property selected');
  const scopeSub = allProperties ? 'Across every home'
    : otherScope ? 'Bills with no home'
    : (selectedHome && selectedHome.name && selectedHome.address ? selectedHome.address : 'Currently viewing');

  const closeOnMobile = () => { if (window.innerWidth < 1024) closeSidebar(); };

  const renderRow = (item) => {
    const Icon = item.icon;
    return (
      <NavLink key={item.path} to={item.path} onClick={closeOnMobile} className="casaceo-navrow" style={navRow}>
        {({ isActive }) => (
          <>
            {/* gold "you are here" edge bar */}
            <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: isActive ? '20px' : '0px', background: GOLD, borderRadius: '2px', transition: 'height 0.18s' }} />
            <Icon style={{ width: '19px', height: '19px', color: isActive ? NAVY : INK_MUTE, flexShrink: 0 }} />
            {item.label}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <>
      <style>{`
        .casaceo-navrow:hover { background: ${PAGE} !important; color: ${INK} !important; }
        .casaceo-navrow.active:hover { background: ${ACTIVE_BG} !important; color: ${NAVY} !important; }
        .casaceo-explore:hover { background: ${PAGE} !important; color: ${INK_SOFT} !important; }
        .casaceo-help:hover { background: ${PAGE} !important; border-color: ${GOLD} !important; }
      `}</style>
      {/* Mobile overlay */}
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,39,51,0.45)', zIndex: 40 }} className="lg:hidden" onClick={closeSidebar} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '256px', background: '#fff', borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column' }}
      >
        {/* Identity header — now on desktop too, so the rail has a self. */}
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: NAVY, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Home style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>CasaCEO</span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: INK_MUTE, padding: '6px' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map(renderRow)}

          {/* Explore — the one quiet door to the extras, set apart. */}
          <div style={{ paddingTop: '12px', marginTop: '12px', borderTop: `1px solid ${BORDER}` }}>
            <NavLink to="/explore" onClick={closeOnMobile} className="casaceo-explore"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px',
                fontSize: '14px', fontWeight: 500, textDecoration: 'none',
                color: isActive ? INK : INK_MUTE, background: isActive ? PAGE : 'transparent', transition: 'background 0.15s, color 0.15s',
              })}
            >
              <Compass style={{ width: '19px', height: '19px', flexShrink: 0 }} />
              Explore
            </NavLink>
          </div>
        </div>

        {/* How it works — the always-there reference. A defined, tappable card
            (white surface, navy ink + icon) so it reads as a real control, not
            inert helper text — visible without shouting. */}
        <div style={{ padding: '10px 12px 0' }}>
          <button
            onClick={() => setHelpOpen(true)}
            className="casaceo-help"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
              padding: '11px 12px', borderRadius: '10px',
              border: `1px solid ${BORDER}`, background: '#fff', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600, color: INK,
              textAlign: 'left', transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#eef4fb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HelpCircle style={{ width: '17px', height: '17px', color: NAVY }} />
            </span>
            <span style={{ flex: 1 }}>How it works</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: INK_MUTE }}>Guide</span>
          </button>
        </div>

        {/* Grounding footer — the home you're managing, so the rail feels like
            a place that's yours, not a generic menu. Honest about scope. */}
        <div style={{ padding: '12px', borderTop: `1px solid ${BORDER}`, background: PAGE }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef4fb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 style={{ width: '17px', height: '17px', color: NAVY }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scopeLabel}</div>
              <div style={{ fontSize: '11px', color: INK_MUTE, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scopeSub}</div>
            </div>
          </div>
        </div>
      </aside>

      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};

export default Sidebar;
