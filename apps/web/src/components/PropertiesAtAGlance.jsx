import React, { useState, useEffect } from 'react';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import pb from '@/lib/horizonsBackend.js';
import { Home, MapPin, ArrowRight, AlertCircle, CheckCircle2, Plus, CreditCard, Wrench, FolderOpen } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// PROPERTIES AT A GLANCE  (navy field · cream/gold tiles)
//
// The multi-home landing surface. Two doors:
//   • Function row (top): Bills / Maintenance / Records as an ALL-PROPERTIES
//     "go straight to" — skip picking a property, act across everything.
//     Bills honors the allProperties flag today; Maintenance/Records light up
//     automatically once their pages read the flag (already on the roadmap).
//   • Property tiles (below): one tile per home with a real, forward-looking
//     readout — what's due, what needs attention — then enter that home's board.
//
// Cream tiles (gold-soft #f3ecdd) glow against the navy; gold (#c9a96e) is the
// accent, used sparingly. Money rule (locked): per-property "due" aggregates
// round to whole dollars.
// ═══════════════════════════════════════════════════════════════════════

const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';
const CREAM = '#f3ecdd';      // gold-soft: tile surface
const CREAM_HI = '#faf6ec';   // lighter cream for inner panels

const isPaid = (c) => c.status === 'paid';
const isPending = (c) => c.status === 'pending_review';
const isOpen = (c) => !isPaid(c) && !isPending(c); // confirmed, not yet paid

const summarize = (bills, homeId) => {
  const now = new Date();
  const mine = bills.filter((c) => c.homeId === homeId);
  const open = mine.filter(isOpen);
  const dueTotal = open.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const overdueCount = open.filter((c) => c.dueDate && new Date(c.dueDate) < now).length;
  const pendingCount = mine.filter(isPending).length;
  return { dueTotal, openCount: open.length, overdueCount, pendingCount };
};

// ── Function box: an all-properties "go straight to" ──────────────────────
const FunctionBox = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 transition-all hover:-translate-y-0.5 group"
    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px 16px' }}
  >
    <div className="flex items-center justify-center flex-shrink-0" style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(201,169,110,0.16)' }}>
      <Icon style={{ width: '19px', height: '19px', color: GOLD }} />
    </div>
    <div className="text-left flex-1 min-w-0">
      <p className="font-semibold text-white" style={{ fontSize: '14px' }}>{label}</p>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>All properties</p>
    </div>
    <ArrowRight style={{ width: '15px', height: '15px', color: 'rgba(255,255,255,0.5)' }} className="group-hover:translate-x-1 transition-transform" />
  </button>
);

// ── Property tile: cream surface, gold accent ─────────────────────────────
const PropertyGlanceTile = ({ home, summary, onEnter }) => {
  const { dueTotal, openCount, overdueCount, pendingCount } = summary;
  const allClear = openCount === 0 && overdueCount === 0;
  // Status accent stays on the semantic system; gold leads the calm state.
  const accent = overdueCount > 0 ? '#dc2626' : openCount > 0 ? '#f59e0b' : GOLD;

  return (
    <button
      onClick={onEnter}
      className="text-left hover:-translate-y-0.5 transition-all group flex flex-col w-full"
      style={{
        background: CREAM,
        borderRadius: '16px',
        border: '1px solid rgba(201,169,110,0.35)',
        borderTop: `3px solid ${accent}`,
        padding: '20px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3" style={{ marginBottom: '16px' }}>
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fff', border: `1px solid ${GOLD}` }}>
          <Home style={{ width: '22px', height: '22px', color: NAVY }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ fontSize: '17px', color: '#1f2733' }}>
            {home.name || home.address || 'Unnamed home'}
          </p>
          {home.address && (
            <p className="flex items-center gap-1 truncate" style={{ fontSize: '12px', color: '#8a7a5c', marginTop: '2px' }}>
              <MapPin style={{ width: '11px', height: '11px', flexShrink: 0 }} /> {home.address}
            </p>
          )}
        </div>
      </div>

      {/* The glance */}
      {allClear ? (
        <div className="flex items-center gap-2" style={{ color: '#059669', marginBottom: '16px' }}>
          <CheckCircle2 style={{ width: '16px', height: '16px' }} />
          <span className="font-medium" style={{ fontSize: '14px' }}>All caught up</span>
        </div>
      ) : (
        <div className="rounded-xl" style={{ background: CREAM_HI, padding: '12px 14px', marginBottom: '14px', border: '1px solid rgba(201,169,110,0.25)' }}>
          <p className="font-extrabold" style={{ fontSize: '26px', lineHeight: 1, color: '#1f2733' }}>
            ${Math.round(dueTotal).toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: '#5b6472', marginTop: '4px' }}>
            {openCount} {openCount === 1 ? 'bill' : 'bills'} to pay
          </p>
        </div>
      )}

      {/* Attention chips */}
      <div className="flex flex-wrap items-center gap-2" style={{ minHeight: '20px', marginBottom: '16px' }}>
        {overdueCount > 0 && (
          <span className="flex items-center gap-1 font-medium rounded-full" style={{ fontSize: '11px', color: '#dc2626', background: '#fdecec', padding: '3px 9px' }}>
            <AlertCircle style={{ width: '11px', height: '11px' }} /> {overdueCount} overdue
          </span>
        )}
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 font-medium rounded-full" style={{ fontSize: '11px', color: '#b45309', background: '#fdf3e0', padding: '3px 9px' }}>
            {pendingCount} to review
          </span>
        )}
      </div>

      {/* Enter */}
      <div className="flex items-center gap-1.5 font-semibold mt-auto" style={{ fontSize: '13px', color: NAVY }}>
        Open
        <ArrowRight style={{ width: '15px', height: '15px' }} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

const PropertiesAtAGlance = ({ onEnter }) => {
  const { homes, switchHome, viewAllProperties } = useHome();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentUser?.id) { setLoadingBills(false); return; }
      try {
        const records = await pb.collection('service_companies').getFullList({
          batch: 500,
          filter: `ownerId="${currentUser.id}"`,
          sort: 'companyName',
          $autoCancel: false,
        });
        if (!cancelled) setBills(records || []);
      } catch {
        if (!cancelled) setBills([]);
      } finally {
        if (!cancelled) setLoadingBills(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const handleEnter = (home) => {
    switchHome(home);
    if (onEnter) onEnter(home);
  };

  // Go straight to a function in all-properties scope. We set the flag for all
  // three; Bills honors it now, Maintenance/Records will once wired.
  const goAllProperties = (path) => {
    if (viewAllProperties) viewAllProperties();
    navigate(path);
  };

  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-5xl mx-auto" style={{ padding: '8px 0 80px' }}>
      {/* Header row: greeting/title left, compact Add property box right */}
      <div className="flex items-start justify-between gap-4" style={{ marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{greeting}, {firstName}</p>
          <h1 className="font-semibold text-white" style={{ fontSize: '26px', marginTop: '2px' }}>
            Your properties
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            {homes.length} properties · pick one, or jump to a function across all
          </p>
        </div>
        <Link
          to="/manage-homes"
          className="flex items-center gap-2 font-semibold transition-all hover:-translate-y-0.5 flex-shrink-0"
          style={{ background: GOLD, color: NAVY, borderRadius: '12px', padding: '10px 16px', fontSize: '13px' }}
        >
          <Plus style={{ width: '16px', height: '16px' }} /> Add property
        </Link>
      </div>

      {/* Function row: all-properties go-straight-to */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '12px', marginBottom: '28px' }}>
        <FunctionBox icon={CreditCard} label="Bills" onClick={() => goAllProperties('/bill-pay')} />
        <FunctionBox icon={Wrench} label="Maintenance" onClick={() => goAllProperties('/maintenance-management')} />
        <FunctionBox icon={FolderOpen} label="Records" onClick={() => goAllProperties('/documents')} />
      </div>

      {/* Section label */}
      <p className="font-semibold uppercase tracking-wide" style={{ fontSize: '11px', color: GOLD, marginBottom: '12px' }}>
        Or open a property
      </p>

      {/* Property tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '16px' }}>
        {homes.map((home) => (
          <PropertyGlanceTile
            key={home.id}
            home={home}
            summary={loadingBills ? { dueTotal: 0, openCount: 0, overdueCount: 0, pendingCount: 0 } : summarize(bills, home.id)}
            onEnter={() => handleEnter(home)}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertiesAtAGlance;
