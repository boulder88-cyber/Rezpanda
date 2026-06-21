import React, { useState, useEffect } from 'react';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/horizonsBackend.js';
import { Home, MapPin, ArrowRight, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════════
// PROPERTIES AT A GLANCE
//
// The multi-home landing surface. Instead of dropping a user into one
// property's dashboard by default, we show every property as a tile with a
// real, forward-looking readout — what's due and what needs attention — so
// the user chooses where to go from a position of information, not a guess.
//
// Tapping a tile selects that property (switchHome) and enters its dashboard
// (onEnter, handled by the parent). Single-home users never see this screen.
//
// Data: one fetch of the user's service_companies (bills), then aggregated
// per homeId in the browser. Same fields the real Bill Pay page uses:
//   amount, dueDate, status (pending_review|confirmed|paid), paymentType, homeId
// Money rule (locked): per-property "due" totals are aggregates → whole dollars.
// ═══════════════════════════════════════════════════════════════════════

const isPaid = (c) => c.status === 'paid';
const isPending = (c) => c.status === 'pending_review';
// "Open" = a real, actionable bill: confirmed and not yet paid.
const isOpen = (c) => !isPaid(c) && !isPending(c);

// Build a per-home summary from the full bill list.
const summarize = (bills, homeId) => {
  const now = new Date();
  const mine = bills.filter((c) => c.homeId === homeId);
  const open = mine.filter(isOpen);

  const dueTotal = open.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const overdue = open.filter((c) => c.dueDate && new Date(c.dueDate) < now);
  const pendingCount = mine.filter(isPending).length;

  return {
    dueTotal,
    openCount: open.length,
    overdueCount: overdue.length,
    pendingCount,
  };
};

const PropertyGlanceTile = ({ home, summary, onEnter }) => {
  const { dueTotal, openCount, overdueCount, pendingCount } = summary;
  const allClear = openCount === 0 && overdueCount === 0;

  // Accent + headline reflect the most urgent state, calmly.
  const accent = overdueCount > 0 ? '#dc2626' : openCount > 0 ? '#f59e0b' : '#059669';

  return (
    <button
      onClick={onEnter}
      className="bg-white text-left hover:shadow-lg hover:-translate-y-0.5 transition-all group flex flex-col w-full"
      style={{ borderRadius: '16px', border: '1px solid #e9e4db', borderLeft: `4px solid ${accent}`, padding: '20px' }}
    >
      {/* Header */}
      <div className="flex items-start gap-3" style={{ marginBottom: '16px' }}>
        <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eef2f8' }}>
          <Home style={{ width: '22px', height: '22px', color: '#1e3a5f' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ fontSize: '17px', color: '#1f2733' }}>
            {home.name || home.address || 'Unnamed home'}
          </p>
          {home.address && (
            <p className="flex items-center gap-1 truncate" style={{ fontSize: '12px', color: '#95a0ae', marginTop: '2px' }}>
              <MapPin style={{ width: '11px', height: '11px', flexShrink: 0 }} /> {home.address}
            </p>
          )}
        </div>
      </div>

      {/* The glance: what's due / needs attention */}
      {allClear ? (
        <div className="flex items-center gap-2" style={{ color: '#059669', marginBottom: '16px' }}>
          <CheckCircle2 style={{ width: '16px', height: '16px' }} />
          <span className="font-medium" style={{ fontSize: '14px' }}>All caught up</span>
        </div>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          <p className="font-extrabold" style={{ fontSize: '26px', lineHeight: 1, color: '#1f2733' }}>
            ${Math.round(dueTotal).toLocaleString()}
          </p>
          <p style={{ fontSize: '12px', color: '#5b6472', marginTop: '4px' }}>
            {openCount} {openCount === 1 ? 'bill' : 'bills'} to pay
          </p>
        </div>
      )}

      {/* Attention chips */}
      <div className="flex flex-wrap items-center gap-2" style={{ minHeight: '24px', marginBottom: '16px' }}>
        {overdueCount > 0 && (
          <span className="flex items-center gap-1 font-medium rounded-full" style={{ fontSize: '11px', color: '#dc2626', background: '#fef2f2', padding: '3px 9px' }}>
            <AlertCircle style={{ width: '11px', height: '11px' }} /> {overdueCount} overdue
          </span>
        )}
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 font-medium rounded-full" style={{ fontSize: '11px', color: '#b45309', background: '#fffbeb', padding: '3px 9px' }}>
            {pendingCount} to review
          </span>
        )}
      </div>

      {/* Enter affordance */}
      <div className="flex items-center gap-1.5 font-semibold mt-auto" style={{ fontSize: '13px', color: '#1e3a5f' }}>
        Open
        <ArrowRight style={{ width: '15px', height: '15px' }} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

const PropertiesAtAGlance = ({ onEnter }) => {
  const { homes, switchHome } = useHome();
  const { currentUser } = useAuth();
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
        if (!cancelled) setBills([]); // glance degrades gracefully to "no data yet"
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

  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-5xl mx-auto" style={{ padding: '8px 0 80px' }}>
      {/* Calm header */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '14px', color: '#5b6472' }}>{greeting}, {firstName}</p>
        <h1 className="font-semibold" style={{ fontSize: '26px', color: '#1f2733', marginTop: '2px' }}>
          Your properties
        </h1>
        <p style={{ fontSize: '13px', color: '#95a0ae', marginTop: '4px' }}>
          {homes.length} properties · pick one to open its dashboard
        </p>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '16px' }}>
        {homes.map((home) => (
          <PropertyGlanceTile
            key={home.id}
            home={home}
            summary={loadingBills ? { dueTotal: 0, openCount: 0, overdueCount: 0, pendingCount: 0 } : summarize(bills, home.id)}
            onEnter={() => handleEnter(home)}
          />
        ))}

        {/* Add a property */}
        <Link
          to="/manage-homes"
          className="flex flex-col items-center justify-center transition-all group"
          style={{ borderRadius: '16px', border: '2px dashed #e9e4db', minHeight: '180px', color: '#95a0ae' }}
        >
          <div className="flex items-center justify-center" style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f1f5f9', marginBottom: '10px' }}>
            <Plus style={{ width: '20px', height: '20px' }} />
          </div>
          <p className="font-semibold" style={{ fontSize: '14px', color: '#5b6472' }}>Add a property</p>
        </Link>
      </div>
    </div>
  );
};

export default PropertiesAtAGlance;
