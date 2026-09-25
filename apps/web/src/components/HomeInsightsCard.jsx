import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import pb from '@/lib/horizonsBackend.js';

// ═══════════════════════════════════════════════════════════════════════
// HOME INSIGHTS — a small AI-generated read on this home's own bill history.
//
// Calls /api/home-insights (Claude Haiku) with the CALLER's own PocketBase
// token — same one pb already uses — so the server only ever sees what this
// user is already allowed to see. No elevated credentials involved.
//
// Pure SEE, not DO: these are observations about spending patterns, never a
// recommendation to cancel, switch, or act on anything. Same thesis as the
// weather-triggered maintenance strip and the maintenance-tracking cycle
// described in MaintenanceHelpPanel.jsx.
//
// Results are cached in sessionStorage per home for a few hours so idle
// dashboard visits don't re-trigger a Claude call every time — a manual
// "Refresh" always goes to the network.
//
// Replaces the old QuickAlerts slot in the Dashboard's supporting-context
// row (removed 9.20 for being mock data) with something that reads real
// data, or says plainly that there isn't enough of it yet.
// ═══════════════════════════════════════════════════════════════════════

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const cacheKey = (homeId) => `casaceo:homeInsights:${homeId}`;

const readCache = (homeId) => {
  try {
    const raw = sessionStorage.getItem(cacheKey(homeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return parsed.insights;
  } catch {
    return null; // private browsing, storage disabled, etc. — just skip the cache.
  }
};

const writeCache = (homeId, insights) => {
  try {
    sessionStorage.setItem(cacheKey(homeId), JSON.stringify({ at: Date.now(), insights }));
  } catch {
    // no-op — caching is a nice-to-have, never load-bearing.
  }
};

const sevDot = (sev) => (sev === 'medium' ? '#f59e0b' : '#94a3b8');

const HomeInsightsCard = ({ selectedHome }) => {
  const [insights, setInsights] = useState(null); // null = not loaded yet
  const [loading, setLoading] = useState(false);
  const [settled, setSettled] = useState(false);

  const load = useCallback(async (force) => {
    const homeId = selectedHome?.id;
    if (!homeId) return;

    if (!force) {
      const cached = readCache(homeId);
      if (cached) {
        setInsights(cached);
        setSettled(true);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/home-insights', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: pb.authStore.token },
        body: JSON.stringify({ homeId }),
      });
      const data = await res.json();
      const list = Array.isArray(data.insights) ? data.insights : [];
      setInsights(list);
      writeCache(homeId, list);
    } catch {
      setInsights([]);
    } finally {
      setLoading(false);
      setSettled(true);
    }
  }, [selectedHome?.id]);

  useEffect(() => {
    setInsights(null);
    setSettled(false);
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHome?.id]);

  if (!selectedHome?.id) return null;

  const hasInsights = Array.isArray(insights) && insights.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Lightbulb className="w-4 h-4" style={{ color: '#c9a96e' }} />
          Home insights
        </h2>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
          style={{ color: '#5b6472' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && insights === null && (
        <p className="text-sm" style={{ color: '#95a0ae' }}>Looking at your bill history…</p>
      )}

      {!loading && settled && !hasInsights && (
        <p className="text-sm" style={{ color: '#95a0ae' }}>
          Not enough bill history yet to spot a pattern — check back after a few more bills come in.
        </p>
      )}

      {hasInsights && (
        <div className="space-y-3">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: sevDot(ins.severity) }}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#1f2733' }}>{ins.title}</p>
                <p className="text-sm mt-0.5" style={{ color: '#5b6472' }}>{ins.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs mt-4 pt-3 border-t" style={{ color: '#95a0ae', borderColor: '#f1f0ec' }}>
        Based on your own bill history — observations, not advice. Always worth a second look before acting.
      </p>
    </div>
  );
};

export default HomeInsightsCard;
