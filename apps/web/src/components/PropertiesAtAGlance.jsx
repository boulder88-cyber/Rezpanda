import React, { useState, useEffect } from 'react';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import pb from '@/lib/horizonsBackend.js';
import { Home, MapPin, ArrowRight, AlertCircle, CheckCircle2, Plus, CreditCard, Wrench, FolderOpen } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// PROPERTIES AT A GLANCE  (warm off-white field · navy tiles)
//
// Two doors, stacked:
//   • Property tiles (top row): one navy tile per home with a real readout —
//     what's due, what needs attention — then enter that home's board.
//   • Function row (below): Bills / Maintenance / Records as an ALL-PROPERTIES
//     "go straight to." Bills honors the allProperties flag today;
//     Maintenance/Records light up once their pages read it (on the roadmap).
//
// Navy tiles on the warm #faf8f4 page, gold as the sparing accent. Money rule
// (locked): per-property "due" aggregates round to whole dollars.
// ═══════════════════════════════════════════════════════════════════════

const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';

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

// ── Property tile: navy surface, gold accent ──────────────────────────────
const PropertyGlanceTile = ({ home, summary, onEnter }) => {
  const { dueTotal, openCount, overdueCount, pendingCount } = summary;
  const allClear = openCount === 0 && overdueCount === 0;
  // Top accent reflects urgency; gold leads the calm state.
  const accent = overdueCount > 0 ? '#dc2626' : openCount > 0 ? '#f59e0b' : GOLD;

  return (
    <button
      onClick={onEnter}
      className="text-left hover:-translate-y-0.5 transition-all group flex flex-col w-full h-full"
      style={{
        background: NAVY,
        borderRadius: '16px',
        borderTop: `3px solid ${accent}`,
        padding: '20px',
        boxShadow: '0 6px 18px rgba(30,58,95,0.18)',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3" style={{ marginBottom: '16px' }}>
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.10)', border: `1px solid ${GOLD}` }}>
          <Home style={{ width: '22px', height: '22px', color: GOLD }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate" style={{ fontSize: '17px' }}>
            {home.name || home.address || 'Unnamed home'}
          </p>
          {home.address && (
            <p className="flex items-center gap-1 truncate" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>
              <MapPin style={{ width: '11px', height: '11px', flexShrink: 0 }} /> {home.address}
            </p>
          )}
        </div>
      </div>

      {/* The glance */}
      {allClear ? (
        <div className="flex items-center gap-2" style={{ color: '#6ee7b7', marginBottom: '16px' }}>
          <CheckCircle2 style={{ width: '16px', height: '16px' }} />
          <span className="font-medium" style={{ fontSize: '14px' }}>All caught up</span>
        </div>
      ) : (
        <div className="rounded-xl" style={{ background: 'rgba(255,255,255,0.07)', padding: '12px 14px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.10)' }}>
          <p className="font-extrabold text-white" style={{ fontSize: '26px', lineHeight: 1 }}>
            ${Math.round(dueTotal).toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
            {openCount} {openCount === 1 ? 'bill' : 'bills'} to pay
          </p>
        </div>
      )}

      {/* Attention chips */}
      <div className="flex flex-wrap items-center gap-2" style={{ minHeight: '20px', marginBottom: '16px' }}>
        {overdueCount > 0 && (
          <span className="flex items-center gap-1 font-medium rounded-full" style={{ fontSize: '11px', color: '#fca5a5', background: 'rgba(220,38,38,0.18)', padding: '3px 9px' }}>
            <AlertCircle style={{ width: '11px', height: '11px' }} /> {overdueCount} overdue
          </span>
        )}
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 font-medium rounded-full" style={{ fontSize: '11px', color: '#fcd34d', background: 'rgba(245,158,11,0.16)', padding: '3px 9px' }}>
            {pendingCount} to review
          </span>
        )}
      </div>

      {/* Enter */}
      <div className="flex items-center gap-1.5 font-semibold mt-auto" style={{ fontSize: '13px', color: GOLD }}>
        Open
        <ArrowRight style={{ width: '15px', height: '15px' }} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

// ── Function box: an all-properties "go straight to" ──────────────────────
const FunctionBox = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md group bg-white"
    style={{ border: '1px solid #e9e4db', borderRadius: '14px', padding: '14px 16px' }}
  >
    <div className="flex items-center justify-center flex-shrink-0" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eef2f8' }}>
      <Icon style={{ width: '19px', height: '19px', color: NAVY }} />
    </div>
    <div className="text-left flex-1 min-w-0">
      <p className="font-semibold" style={{ fontSize: '14px', color: '#1f2733' }}>{label}</p>
      <p style={{ fontSize: '11px', color: '#95a0ae' }}>All properties</p>
    </div>
    <ArrowRight style={{ width: '15px', height: '15px', color: '#cbd5e1' }} className="group-hover:translate-x-1 transition-transform" />
  </button>
);

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
        const records = await pb.collection('invoices').getFullList({
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
          <p style={{ fontSize: '14px', color: '#5b6472' }}>{greeting}, {firstName}</p>
          <h1 className="font-semibold" style={{ fontSize: '26px', color: '#1f2733', marginTop: '2px' }}>
            Your properties
          </h1>
          <p style={{ fontSize: '13px', color: '#95a0ae', marginTop: '4px' }}>
            {homes.length} properties · pick one, or jump to a function across all
          </p>
        </div>
        <Link
          to="/manage-homes"
          className="flex items-center gap-2 font-semibold transition-all hover:-translate-y-0.5 flex-shrink-0 text-white"
          style={{ background: NAVY, borderRadius: '12px', padding: '10px 16px', fontSize: '13px' }}
        >
          <Plus style={{ width: '16px', height: '16px' }} /> Add property
        </Link>
      </div>

      {/* Property tiles — equal-width grid columns so two tiles render the
          same size, with items stretched to equal height (a tile with bills
          and a tile that's all-clear now match). Grid is width-capped and
          centered so a single tile doesn't stretch full-bleed. */}
      <div
        className="grid mx-auto items-stretch"
        style={{
          gap: '16px',
          marginBottom: '28px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          maxWidth: homes.length === 1 ? '360px' : homes.length === 2 ? '760px' : '100%',
        }}
      >
        {homes.map((home) => (
          <PropertyGlanceTile
            key={home.id}
            home={home}
            summary={loadingBills ? { dueTotal: 0, openCount: 0, overdueCount: 0, pendingCount: 0 } : summarize(bills, home.id)}
            onEnter={() => handleEnter(home)}
          />
        ))}
      </div>

      {/* Function row — below, all-properties go-straight-to */}
      <p className="font-semibold uppercase tracking-wide" style={{ fontSize: '11px', color: GOLD, marginBottom: '12px' }}>
        Or jump to a function
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '12px' }}>
        <FunctionBox icon={CreditCard} label="Bills" onClick={() => goAllProperties('/bill-pay')} />
        <FunctionBox icon={Wrench} label="Maintenance" onClick={() => goAllProperties('/maintenance-management')} />
        <FunctionBox icon={FolderOpen} label="Records" onClick={() => goAllProperties('/documents')} />
      </div>
    </div>
  );
};

export default PropertiesAtAGlance;
