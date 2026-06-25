import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Mail, Copy, Check, Search } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// BILLER CONNECT CHECKLIST
//
// Lists the user's own billers (derived from their bills) and shows which
// are "connected" — i.e. the utility now emails bills STRAIGHT to CasaCEO
// because the user changed their billing email at the provider's site.
//
// "Connected" is DETECTED, not manually marked: we look at senderAddress on
// each bill (the raw "from" of the inbound email, stored by the hook).
//   • from a business domain (comcast.com)      → arrived direct → CONNECTED
//   • from a consumer domain (gmail, yahoo, …)   → forwarded by user → NOT YET
//   • empty (manual entry / old record)          → unknown → NOT YET
// A biller counts as connected if ANY of its bills arrived direct — once you
// point the utility at CasaCEO, every future bill comes direct.
//
// No new data, no manual checkboxes. Honors the security boundary: the user
// does the connecting at the provider's own site; CasaCEO just detects it.
// ═══════════════════════════════════════════════════════════════════════

// Consumer/free email domains — a bill from one of these was forwarded by
// the user, not sent directly by the biller. Everything else is treated as
// a business/biller domain.
const CONSUMER_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'outlook.com',
  'hotmail.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'protonmail.com', 'proton.me', 'gmx.com', 'zoho.com',
  'comcast.net', 'att.net', 'verizon.net', 'sbcglobal.net', 'cox.net',
  'bellsouth.net', 'charter.net', 'earthlink.net', 'frontier.com',
]);

// Pull the lowercase domain out of a raw "from" value, which may look like
// "Billing <billing@comcast.com>" or just "billing@comcast.com".
const domainOf = (raw) => {
  if (!raw) return '';
  const m = String(raw).match(/@([^>\s]+)/);
  return m ? m[1].toLowerCase().trim() : '';
};

const arrivedDirect = (bill) => {
  const d = domainOf(bill.senderAddress);
  if (!d) return false;
  return !CONSUMER_DOMAINS.has(d);
};

const BillerConnectChecklist = ({ companies = [], forwardAddress = '' }) => {
  const [expanded, setExpanded] = useState(null); // biller name being shown
  const [copied, setCopied] = useState(false);

  // Group bills by biller (companyName). For each, decide connected + remember
  // the direct sender domain if we saw one (nice to show the user).
  const billers = (() => {
    const map = {};
    for (const c of companies) {
      const name = (c.companyName || 'Unknown').trim();
      if (!map[name]) map[name] = { name, connected: false, domain: '', count: 0 };
      map[name].count += 1;
      if (arrivedDirect(c)) {
        map[name].connected = true;
        if (!map[name].domain) map[name].domain = domainOf(c.senderAddress);
      }
    }
    return Object.values(map).sort((a, b) => {
      // not-yet first (they're the actionable ones), then alphabetical
      if (a.connected !== b.connected) return a.connected ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  })();

  if (billers.length === 0) return null;

  const connectedCount = billers.filter(b => b.connected).length;

  const handleCopy = () => {
    if (!forwardAddress) return;
    try {
      navigator.clipboard.writeText(forwardAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* no-op */ }
  };

  const cardStyle = { background: '#fff', border: '1px solid #e9e4db', borderRadius: '12px', boxShadow: '0 1px 3px rgba(31,39,51,0.06)' };

  return (
    <div style={{ ...cardStyle, padding: '20px', marginBottom: '24px' }}>
      <div className="flex items-baseline justify-between" style={{ marginBottom: '4px' }}>
        <h2 className="font-semibold text-slate-900" style={{ fontSize: '18px' }}>Your billers</h2>
        <span style={{ fontSize: '13px', color: '#95a0ae' }}>{connectedCount} of {billers.length} sending straight to CasaCEO</span>
      </div>
      <p className="text-slate-500" style={{ fontSize: '13px', marginBottom: '16px' }}>
        When a biller sends bills directly to your CasaCEO address, they show as connected — no forwarding needed.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {billers.map(b => {
          const isOpen = expanded === b.name;
          return (
            <div key={b.name} style={{ border: '1px solid #e9e4db', borderRadius: '10px', overflow: 'hidden' }}>
              <div className="flex items-center justify-between"
                style={{ padding: '12px 14px', background: b.connected ? '#f6fcf9' : '#fff' }}>
                <div className="flex items-center gap-3 min-w-0">
                  {b.connected
                    ? <CheckCircle2 style={{ width: '18px', height: '18px', color: '#059669', flexShrink: 0 }} />
                    : <Circle style={{ width: '18px', height: '18px', color: '#cbd5e1', flexShrink: 0 }} />}
                  <div className="min-w-0">
                    <span className="font-medium truncate" style={{ fontSize: '14px', color: '#1f2733' }}>{b.name}</span>
                    <div style={{ fontSize: '12px', color: b.connected ? '#059669' : '#95a0ae' }}>
                      {b.connected
                        ? `Connected${b.domain ? ` · sends from ${b.domain}` : ''}`
                        : 'Forwarded — not connected yet'}
                    </div>
                  </div>
                </div>
                {!b.connected && (
                  <button onClick={() => setExpanded(isOpen ? null : b.name)}
                    className="flex items-center gap-1 font-medium flex-shrink-0 transition-colors"
                    style={{ fontSize: '12px', color: '#1e3a5f', border: '1px solid #c7d7eb', borderRadius: '8px', padding: '6px 10px', background: '#fff' }}>
                    {isOpen ? <>Hide <ChevronDown style={{ width: '13px', height: '13px' }} /></> : <>Connect <ChevronRight style={{ width: '13px', height: '13px' }} /></>}
                  </button>
                )}
              </div>

              {/* connect steps */}
              {!b.connected && isOpen && (
                <div style={{ padding: '14px', borderTop: '1px solid #e9e4db', background: '#faf8f4' }}>
                  <p style={{ fontSize: '13px', color: '#5b6472', marginBottom: '12px' }}>
                    Log into {b.name}'s website and change your billing/paperless email to your CasaCEO address. Their next bill will arrive here automatically.
                  </p>

                  {forwardAddress && (
                    <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                      <code className="flex-1 truncate" style={{ background: '#f1f5f9', border: '1px solid #e9e4db', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', color: '#1e3a5f' }} title={forwardAddress}>
                        {forwardAddress}
                      </code>
                      <button onClick={handleCopy}
                        className="flex items-center gap-1 font-semibold text-white rounded-lg flex-shrink-0"
                        style={{ background: copied ? '#059669' : '#1e3a5f', padding: '8px 12px', fontSize: '12px' }}>
                        {copied ? <><Check style={{ width: '13px', height: '13px' }} /> Copied</> : <><Copy style={{ width: '13px', height: '13px' }} /> Copy</>}
                      </button>
                    </div>
                  )}

                  {/* Finder helper: a pre-filled web search to the biller's
                      login/account page, so the user doesn't have to hunt for
                      where billing settings live. A real button (not fine print)
                      since this panel has room and the user asked for an
                      affordance, not a link. */}
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(`${b.name} login account billing settings`.trim())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-semibold transition-colors"
                    style={{ fontSize: '14px', color: '#1e3a5f', border: '1px solid #cdddef', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', background: '#eef4fb', width: 'fit-content', textDecoration: 'none' }}
                  >
                    <Search style={{ width: '15px', height: '15px' }} />
                    Find {b.name}'s login page
                  </a>

                  <ol style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, padding: 0, listStyle: 'none' }}>
                    {[
                      `Log into ${b.name}'s website.`,
                      'Find billing, paperless, or account settings.',
                      'Set the billing email to the address above.',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2" style={{ fontSize: '13px', color: '#334155' }}>
                        <span className="flex items-center justify-center flex-shrink-0 font-bold text-white" style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#1e3a5f', fontSize: '11px' }}>{i + 1}</span>
                        <span style={{ paddingTop: '1px' }}>{step}</span>
                      </li>
                    ))}
                  </ol>

                  <p style={{ fontSize: '11px', color: '#95a0ae', marginTop: '12px' }}>
                    Most providers only allow one billing email, so this replaces the one on file. You can still see past bills anytime on {b.name}'s site.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BillerConnectChecklist;
