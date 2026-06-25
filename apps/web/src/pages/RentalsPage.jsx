import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useHome } from '@/contexts/HomeContext.jsx';
import LeasePanel from '@/components/LeasePanel.jsx';
import RentIncomePanel from '@/components/RentIncomePanel.jsx';
import { Building2, Home, Plus, KeyRound } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// RentalsPage (/rentals) — the rental template's home.
//
// Lists every property the user has flagged propertyType: 'rental'. Each
// property gets a card that carries its own LeasePanel (the rent roll), so
// this single page IS both the portfolio (all rentals side by side) and the
// per-property lens (each card). Income vs expected, expenses, and the
// Schedule E P&L drop INTO these cards in later slices — the card is the
// container they'll fill.
//
// On-thesis: this page only EXISTS for landlords (the sidebar item is
// conditional), and it only SEES the home — it never collects rent or acts on
// a tenant. Design system LOCKED (navy/gold, warm bg, inline tokens).
// ═══════════════════════════════════════════════════════════════════════

const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';
const INK = '#1f2733';
const INK_MUTED = '#5b6472';
const INK_FAINT = '#95a0ae';
const BORDER = '#e9e4db';
const SURFACE = '#ffffff';
const PAGE = '#faf8f4';

const isRental = (h) => h && (h.propertyType === 'rental');

const RentalsPage = () => {
  const { homes, loading } = useHome();

  const rentals = useMemo(
    () => (homes || []).filter(isRental),
    [homes]
  );

  return (
    <div style={{ background: PAGE, minHeight: '100%' }}>
      <Helmet><title>Rentals · CasaCEO</title></Helmet>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px 48px' }}>

        {/* Header */}
        <div className="flex items-center gap-3" style={{ marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: NAVY,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 style={{ width: '21px', height: '21px', color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>
              Rentals
            </h1>
            <p style={{ fontSize: '14px', color: INK_MUTED }}>
              Your rental properties — leases, income, and what ties out at tax time.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ marginTop: '24px', display: 'grid', gap: '16px' }}>
            {[1, 2].map((i) => (
              <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`,
                borderRadius: '14px', padding: '20px', height: '140px' }} />
            ))}
          </div>
        )}

        {/* Empty state — has homes, but none flagged rental */}
        {!loading && rentals.length === 0 && (
          <div style={{ marginTop: '24px', background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: PAGE,
              border: `1px solid ${BORDER}`, display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '14px' }}>
              <KeyRound style={{ width: '22px', height: '22px', color: INK_FAINT }} />
            </div>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: INK, marginBottom: '6px' }}>
              No rental properties yet
            </h2>
            <p style={{ fontSize: '14px', color: INK_MUTED, lineHeight: 1.6, maxWidth: '440px',
              margin: '0 auto 18px' }}>
              Mark a property as a rental when you add or edit it, and it'll show up here with its
              own rent roll, income tracking, and tax summary.
            </p>
            <Link to="/manage-homes"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
                fontSize: '14px', fontWeight: 500, color: '#fff', background: NAVY,
                borderRadius: '8px', textDecoration: 'none' }}>
              <Plus style={{ width: '15px', height: '15px' }} />
              Manage properties
            </Link>
          </div>
        )}

        {/* Portfolio — one card per rental, each carrying its LeasePanel */}
        {!loading && rentals.length > 0 && (
          <div style={{ marginTop: '24px', display: 'grid', gap: '20px' }}>
            {rentals.map((home) => (
              <div key={home.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`,
                borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

                {/* Property header strip */}
                <div className="flex items-center gap-3" style={{ padding: '16px 20px',
                  borderBottom: `1px solid ${BORDER}`, background: PAGE }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#eef4fb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Home style={{ width: '18px', height: '18px', color: NAVY }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: INK,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {home.name || home.address || 'Rental property'}
                    </div>
                    {home.name && home.address && (
                      <div style={{ fontSize: '12px', color: INK_FAINT,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {home.address}
                      </div>
                    )}
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 500, color: NAVY,
                    background: '#fff', border: `1px solid ${GOLD}`, borderRadius: '999px',
                    padding: '2px 10px', flexShrink: 0 }}>
                    Rental
                  </span>
                </div>

                {/* The per-property lens. LeasePanel handles its own load/empty/edit. */}
                <div style={{ padding: '20px' }}>
                  <LeasePanel home={home} />
                  <RentIncomePanel home={home} />

                  {/* The tax-ready P&L for this property is the next slice. */}
                  <p style={{ marginTop: '16px', fontSize: '12px', color: INK_FAINT,
                    lineHeight: 1.5, paddingTop: '14px', borderTop: `1px solid ${BORDER}` }}>
                    The tax-ready profit &amp; loss summary for this property is coming next.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalsPage;
