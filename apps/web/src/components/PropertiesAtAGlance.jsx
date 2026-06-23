import React, { useState, useEffect } from 'react';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import pb from '@/lib/horizonsBackend.js';
import { Home, MapPin, ArrowRight, AlertCircle, CheckCircle2, Plus, CreditCard, Wrench, FolderOpen, Inbox } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// PROPERTIES AT A GLANCE  (warm off-white field · navy tiles)
//
// Stacked doors:
//   • Portfolio strip (top): one calm all-properties readout — total due,
//     due this week, overdue, to review — so the "across all" answer is
//     visible, not just implied by the function row.
//   • Property tiles: one navy tile per home with a real readout — what's
//     due, the next bill date, and the home's maintenance standing — then
//     enter that home's board. White house icon to match the brand logo.
//   • "Needs your eye" row: surfaces anything overdue or pending review
//     across all homes as tap-through items; collapses to a calm line when
//     there's nothing to do.
//   • Function row: Bills / Maintenance / Records as an ALL-PROPERTIES
//     "go straight to."
//
// Navy tiles on the warm #faf8f4 page, gold as the sparing accent. Money rule
// (locked): per-property "due" aggregates round to whole dollars; individual
// bill amounts keep cents. Maintenance date math mirrors
// MaintenanceManagementPage (maintenance_systems collection, nextServiceDate;
// overdue = past today, soon = within 30 days). Maintenance fetch fails open.
// ═══════════════════════════════════════════════════════════════════════

const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';

const isPaid = (c) => c.status === 'paid';
const isPending = (c) => c.status === 'pending_review';
const isOpen = (c) => !isPaid(c) && !isPending(c); // confirmed, not yet paid

// Days until a date (positive = future, negative = past). Mirrors the
// management page's ceil-based day math.
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const today = new Date();
  return Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
};

const summarize = (bills, systems, homeId) => {
  const now = new Date();
  const mine = bills.filter((c) => c.homeId === homeId);
  const open = mine.filter(isOpen);
  const dueTotal = open.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const overdueCount = open.filter((c) => c.dueDate && new Date(c.dueDate) < now).length;
  const pendingCount = mine.filter(isPending).length;

  // Next open bill by due date (soonest first).
  const dated = open.filter((c) => c.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const nextBill = dated[0] || null;

  // Maintenance standing for this home.
  const homeSystems = systems.filter((s) => s.homeId === homeId);
  const mOverdue = homeSystems.filter((s) => s.nextServiceDate && new Date(s.nextServiceDate) < now).length;
  const mSoon = homeSystems.filter((s) => {
    const d = daysUntil(s.nextServiceDate);
    return d !== null && d >= 0 && d <= 30;
  }).length;

  return { dueTotal, openCount: open.length, overdueCount, pendingCount, nextBill, mOverdue, mSoon, mTotal: homeSystems.length };
};

// Short "Aug 14" style date.
const shortDate = (dateStr) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

// ── Property tile: navy surface, gold accent, white icon ──────────────────
const PropertyGlanceTile = ({ home, summary, onEnter }) => {
  const { dueTotal, openCount, overdueCount, pendingCount, nextBill, mOverdue, mSoon, mTotal } = summary;
  const allClear = openCount === 0 && overdueCount === 0;
  // Top accent reflects urgency; gold leads the calm state.
  const accent = overdueCount > 0 ? '#dc2626' : openCount > 0 ? '#f59e0b' : GOLD;

  // Maintenance one-liner (real maintenance_systems data).
  let maintLine = null;
  if (mTotal > 0) {
    if (mOverdue > 0) maintLine = { text: `${mOverdue} maintenance ${mOverdue === 1 ? 'task' : 'tasks'} overdue`, color: '#fca5a5' };
    else if (mSoon > 0) maintLine = { text: `${mSoon} due this month`, color: '#fcd34d' };
    else maintLine = { text: 'Maintenance on track', color: 'rgba(255,255,255,0.55)' };
  }

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
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)' }}>
          <Home style={{ width: '22px', height: '22px', color: '#ffffff' }} />
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

      {/* The glance — bills */}
      {allClear ? (
        <div className="rounded-xl flex items-center gap-2" style={{ background: 'rgba(110,231,183,0.10)', border: '1px solid rgba(110,231,183,0.22)', padding: '12px 14px', marginBottom: '12px', color: '#6ee7b7' }}>
          <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span className="font-medium" style={{ fontSize: '14px' }}>No bills to pay</span>
        </div>
      ) : (
        <div className="rounded-xl" style={{ background: 'rgba(255,255,255,0.07)', padding: '12px 14px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.10)' }}>
          <p className="font-extrabold text-white" style={{ fontSize: '26px', lineHeight: 1 }}>
            ${Math.round(dueTotal).toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
            {openCount} {openCount === 1 ? 'bill' : 'bills'} to pay
            {nextBill && nextBill.dueDate && (
              <>{'  ·  next '}{shortDate(nextBill.dueDate)}</>
            )}
          </p>
        </div>
      )}

      {/* Maintenance line — real data from maintenance_systems */}
      {maintLine && (
        <div className="flex items-center gap-1.5" style={{ marginBottom: '12px' }}>
          <Wrench style={{ width: '12px', height: '12px', color: maintLine.color, flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: maintLine.color }}>{maintLine.text}</span>
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

// ── Portfolio summary strip: one calm all-properties readout ──────────────
const PortfolioStrip = ({ stats }) => {
  const toneColor = { plain: '#1f2733', amber: '#b45309', red: '#dc2626', green: '#059669' };
  const cells = [
    { label: 'Due across all homes', value: `$${Math.round(stats.dueTotal).toLocaleString()}`, tone: 'plain' },
    { label: 'Due this week', value: `$${Math.round(stats.dueThisWeek).toLocaleString()}`, tone: stats.dueThisWeek > 0 ? 'amber' : 'green' },
    { label: 'Overdue', value: stats.overdueCount, tone: stats.overdueCount > 0 ? 'red' : 'green' },
    { label: 'To review', value: stats.pendingCount, tone: stats.pendingCount > 0 ? 'amber' : 'plain' },
  ];

  return (
    <div className="grid bg-white" style={{ border: '1px solid #e9e4db', borderRadius: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', overflow: 'hidden', marginBottom: '28px' }}>
      {cells.map((c, i) => (
        <div key={c.label} style={{ padding: '16px 18px', borderLeft: i === 0 ? 'none' : '1px solid #f0ece4' }}>
          <p style={{ fontSize: '11px', color: '#95a0ae', fontWeight: 600, letterSpacing: '0.02em', marginBottom: '6px' }}>{c.label}</p>
          <p className="font-bold" style={{ fontSize: '21px', color: toneColor[c.tone], lineHeight: 1 }}>{c.value}</p>
        </div>
      ))}
    </div>
  );
};

// ── "Needs your eye" row: cross-home actionable items ─────────────────────
const NeedsYourEye = ({ items, homesById, onGoBill }) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 bg-white" style={{ border: '1px solid #e9e4db', borderRadius: '14px', padding: '16px 18px', marginBottom: '28px' }}>
        <CheckCircle2 style={{ width: '16px', height: '16px', color: '#059669', flexShrink: 0 }} />
        <span style={{ fontSize: '14px', color: '#5b6472' }}>Nothing needs you right now — everything&rsquo;s handled.</span>
      </div>
    );
  }

  return (
    <div className="bg-white" style={{ border: '1px solid #e9e4db', borderRadius: '14px', padding: '8px 6px', marginBottom: '28px' }}>
      {items.map((it, i) => {
        const homeName = homesById[it.homeId]?.name || homesById[it.homeId]?.address || 'Other bills';
        const isOverdue = it.kind === 'overdue';
        return (
          <button
            key={it.id}
            onClick={() => onGoBill(it.homeId)}
            className="w-full flex items-center gap-3 text-left transition-colors hover:bg-[#faf8f4]"
            style={{ padding: '11px 12px', borderTop: i === 0 ? 'none' : '1px solid #f3efe8', borderRadius: '10px' }}
          >
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: '32px', height: '32px', borderRadius: '9px', background: isOverdue ? '#fef2f2' : '#fffbeb' }}>
              {isOverdue
                ? <AlertCircle style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                : <Inbox style={{ width: '16px', height: '16px', color: '#d97706' }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" style={{ fontSize: '13.5px', color: '#1f2733' }}>
                {it.companyName || 'Bill'}
                {it.amount ? <span style={{ color: '#5b6472', fontWeight: 400 }}>{'  ·  $'}{parseFloat(it.amount).toFixed(2)}</span> : null}
              </p>
              <p className="truncate" style={{ fontSize: '11.5px', color: '#95a0ae' }}>
                {isOverdue ? 'Overdue' : 'Needs review'} · {homeName}
              </p>
            </div>
            <ArrowRight style={{ width: '14px', height: '14px', color: '#cbd5e1', flexShrink: 0 }} />
          </button>
        );
      })}
    </div>
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
  const [systems, setSystems] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!currentUser?.id) { setLoadingBills(false); return; }
      try {
        // Bills (invoices) — owner-scoped. Maintenance (maintenance_systems) is
        // fetched in parallel with its own catch so a failure there never
        // blanks the bills view (fail open) — falls back to empty.
        const billsReq = pb.collection('invoices').getFullList({
          batch: 500,
          filter: `ownerId="${currentUser.id}"`,
          sort: 'companyName',
          $autoCancel: false,
        });
        const systemsReq = pb.collection('maintenance_systems').getFullList({
          batch: 500,
          filter: `ownerId="${currentUser.id}"`,
          $autoCancel: false,
        }).catch(() => []);

        const [billRecords, systemRecords] = await Promise.all([billsReq, systemsReq]);
        if (!cancelled) {
          setBills(billRecords || []);
          setSystems(systemRecords || []);
        }
      } catch {
        if (!cancelled) { setBills([]); setSystems([]); }
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

  // Enter a specific home, then land on its bill list (used by the eye row).
  const goHomeBills = (homeId) => {
    const home = homes.find((h) => h.id === homeId);
    if (home) switchHome(home);
    else if (viewAllProperties) viewAllProperties();
    navigate('/bill-pay');
  };

  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const homesById = React.useMemo(() => {
    const m = {};
    homes.forEach((h) => { m[h.id] = h; });
    return m;
  }, [homes]);

  // Portfolio-wide stats across every open bill the user owns.
  const portfolio = React.useMemo(() => {
    const now = new Date();
    const weekOut = new Date();
    weekOut.setDate(weekOut.getDate() + 7);
    const open = bills.filter(isOpen);
    const dueTotal = open.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
    const dueThisWeek = open
      .filter((c) => c.dueDate && new Date(c.dueDate) >= now && new Date(c.dueDate) <= weekOut)
      .reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
    const overdueCount = open.filter((c) => c.dueDate && new Date(c.dueDate) < now).length;
    const pendingCount = bills.filter(isPending).length;
    return { dueTotal, dueThisWeek, overdueCount, pendingCount };
  }, [bills]);

  // "Needs your eye" items: overdue bills first, then pending review.
  // Capped so the row stays a glance, not a list.
  const eyeItems = React.useMemo(() => {
    const now = new Date();
    const overdue = bills
      .filter((c) => isOpen(c) && c.dueDate && new Date(c.dueDate) < now)
      .map((c) => ({ ...c, kind: 'overdue' }));
    const pending = bills
      .filter(isPending)
      .map((c) => ({ ...c, kind: 'review' }));
    return [...overdue, ...pending].slice(0, 4);
  }, [bills]);

  const emptySummary = { dueTotal: 0, openCount: 0, overdueCount: 0, pendingCount: 0, nextBill: null, mOverdue: 0, mSoon: 0, mTotal: 0 };

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
            {homes.length} {homes.length === 1 ? 'property' : 'properties'} · pick one, or jump to a function across all
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

      {/* Portfolio summary strip — the all-properties answer, made visible */}
      {!loadingBills && <PortfolioStrip stats={portfolio} />}

      {/* Property tiles — equal-width grid columns so tiles render the same
          size, items stretched to equal height. Grid is width-capped and
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
            summary={loadingBills ? emptySummary : summarize(bills, systems, home.id)}
            onEnter={() => handleEnter(home)}
          />
        ))}
      </div>

      {/* Needs your eye — cross-home actionable items, or a calm all-clear */}
      <p className="font-semibold uppercase tracking-wide" style={{ fontSize: '11px', color: GOLD, marginBottom: '12px' }}>
        Needs your eye
      </p>
      {!loadingBills && (
        <NeedsYourEye items={eyeItems} homesById={homesById} onGoBill={goHomeBills} />
      )}

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
