import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHome } from '@/contexts/HomeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/horizonsBackend.js';
import { Check, Plus, Mail, ClipboardCheck, Copy, ArrowRight } from 'lucide-react';

// ─── Getting started (onboarding) ─────────────────────────────────────
// A calm, self-completing setup checklist. On-thesis with the rest of the
// app: it SHOWS what a complete setup looks like and the user DOES the
// actions; each step's "done" is DERIVED FROM REAL DATA, never a clicked
// "I did it" flag — so the list can't lie about where you are.
//
// Lifecycle:
//   • Shows on the dashboard, above the tiles, only while setup is unfinished.
//   • A step is done because the THING EXISTS (a home, a bill, a confirmed
//     bill), not because anything was dismissed.
//   • Once all steps tie out — OR the user taps the quiet "Dismiss" link —
//     we write `onboardingDismissed: true` on the user record and the card
//     never returns. Self-healing while live, permanent once done.
//
// Schema dependency (PocketBase admin, add by hand before relying on it):
//   users.onboardingDismissed — Bool, optional / Nonempty OFF.
//   If the field doesn't exist, the write is a no-op and the card simply
//   keeps showing until setup completes (then tries to write again) — it
//   degrades to "data-derived only," which is still correct, just not sticky.
//
// Design system: navy #1e3a5f / gold #c9a96e (sparingly), warm bg #faf8f4,
// white surface, warm border #e9e4db, ink #1f2733 / #5b6472 / #95a0ae,
// 12px radius, inline tokens. No Tailwind palette, no shadcn, no emoji.

const FORWARD_DOMAIN = 'bills.casaceo.com';
const buildForwardAddress = (userId) => userId ? `ceo+${userId}@${FORWARD_DOMAIN}` : '';

const C = {
  navy: '#1e3a5f',
  gold: '#c9a96e',
  bg: '#faf8f4',
  surface: '#ffffff',
  border: '#e9e4db',
  ink: '#1f2733',
  ink2: '#5b6472',
  ink3: '#95a0ae',
  green: '#059669',
  greenTint: '#e8f3ee',
};

const GettingStartedCard = () => {
  const { homes, loading: homesLoading } = useHome();
  const { currentUser } = useAuth();

  const [billCount, setBillCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Local hide so the card disappears immediately on dismiss/complete,
  // without waiting on a refetch of currentUser.
  const [hidden, setHidden] = useState(false);

  const forwardAddress = buildForwardAddress(currentUser?.id);
  const alreadyDismissed = !!currentUser?.onboardingDismissed;

  // ── Derive bill/confirmed counts from real data ──
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!currentUser?.id) { setLoading(false); return; }
      try {
        const records = await pb.collection('invoices').getFullList({
          batch: 500,
          filter: `ownerId="${currentUser.id}"`,
          $autoCancel: false,
        });
        if (!active) return;
        setBillCount(records.length);
        setConfirmedCount(
          records.filter((r) => r.status === 'confirmed' || r.status === 'paid').length
        );
      } catch {
        // Fail quiet — a fetch error just means the bill steps read as
        // not-yet-done. Never block the dashboard on this.
        if (active) { setBillCount(0); setConfirmedCount(0); }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [currentUser?.id]);

  const steps = [
    {
      key: 'home',
      done: homes.length > 0,
      icon: Plus,
      title: 'Add your first home',
      hint: 'Everything in CasaCEO attaches to a property.',
      cta: { kind: 'link', label: 'Add a home', to: '/manage-homes' },
    },
    {
      key: 'forward',
      done: billCount > 0,
      icon: Mail,
      title: 'Forward your first bill',
      hint: 'Send any bill to your private address — we read it for you.',
      cta: { kind: 'forward', label: 'Show my address' },
    },
    {
      key: 'confirm',
      done: confirmedCount > 0,
      icon: ClipboardCheck,
      title: 'Confirm a bill',
      hint: 'You always get the last word before a bill counts.',
      cta: { kind: 'link', label: 'Go to Bills', to: '/bill-pay' },
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allComplete = doneCount === steps.length;

  // ── Persist the dismiss/complete flag once ──
  const writeFlag = async () => {
    if (!currentUser?.id || alreadyDismissed) return;
    try {
      await pb.collection('users').update(
        currentUser.id,
        { onboardingDismissed: true },
        { $autoCancel: false }
      );
    } catch {
      // No-op if the field doesn't exist yet — card just degrades to
      // data-derived (reappears until setup completes). Not a crash.
    }
  };

  // When the user finishes the last step, retire the card and remember it.
  useEffect(() => {
    if (!loading && !homesLoading && allComplete && !alreadyDismissed) {
      writeFlag();
      setHidden(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allComplete, loading, homesLoading, alreadyDismissed]);

  const handleDismiss = () => {
    setHidden(true);
    writeFlag();
  };

  const handleCopy = () => {
    if (!forwardAddress) return;
    try {
      navigator.clipboard.writeText(forwardAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — address is visible to copy by hand */
    }
  };

  // ── Visibility gate ──
  // Don't render until we know the real state (avoids a flash of the card
  // for a fully-set-up returning user). Hide if dismissed, already complete,
  // or locally hidden this session.
  if (loading || homesLoading) return null;
  if (alreadyDismissed || hidden || allComplete) return null;

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: '12px',
        padding: '22px 24px',
        boxShadow: '0 3px 10px rgba(31, 39, 51, 0.04)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: C.ink, margin: 0 }}>
            Getting set up
          </h2>
          <p style={{ fontSize: '13px', color: C.ink2, margin: '4px 0 0' }}>
            Three quick things and your home is running itself.
          </p>
        </div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: C.ink3,
            whiteSpace: 'nowrap',
            paddingTop: '3px',
          }}
        >
          {doneCount} of {steps.length}
        </span>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: `1px solid ${step.done ? 'transparent' : C.border}`,
                background: step.done ? C.greenTint : C.bg,
              }}
            >
              {/* Status / icon disc */}
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: step.done ? C.green : C.surface,
                  border: step.done ? 'none' : `1px solid ${C.border}`,
                  color: step.done ? '#ffffff' : C.navy,
                }}
              >
                {step.done ? <Check size={18} /> : <Icon size={17} />}
              </div>

              {/* Label */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    margin: 0,
                    color: step.done ? C.green : C.ink,
                    textDecoration: step.done ? 'line-through' : 'none',
                    textDecorationColor: 'rgba(5, 150, 105, 0.4)',
                  }}
                >
                  {step.title}
                </p>
                {!step.done && (
                  <p style={{ fontSize: '12.5px', color: C.ink2, margin: '2px 0 0' }}>
                    {step.hint}
                  </p>
                )}
              </div>

              {/* Action (only on not-yet steps) */}
              {!step.done && (
                step.cta.kind === 'link' ? (
                  <Link
                    to={step.cta.to}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                      background: C.navy,
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '8px 14px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                    }}
                  >
                    {step.cta.label}
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <button
                    onClick={() => setForwardOpen((v) => !v)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                      background: C.navy,
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {step.cta.label}
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Forward-by-email expander — reuses the same address + steps as Add Bill */}
      {forwardOpen && (
        <div
          style={{
            marginTop: '12px',
            padding: '16px 18px',
            borderRadius: '12px',
            background: C.bg,
            border: `1px solid ${C.border}`,
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: C.ink2,
              margin: '0 0 6px',
            }}
          >
            Your private bills address
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
            <code
              title={forwardAddress}
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '13px',
                color: C.navy,
              }}
            >
              {forwardAddress || 'Sign in to see your address'}
            </code>
            <button
              onClick={handleCopy}
              disabled={!forwardAddress}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: copied ? C.green : C.navy,
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: forwardAddress ? 'pointer' : 'default',
                opacity: forwardAddress ? 1 : 0.5,
                flexShrink: 0,
              }}
            >
              {copied
                ? <><Check size={14} /> Copied</>
                : <><Copy size={14} /> Copy</>}
            </button>
          </div>

          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: C.ink2,
              margin: '0 0 8px',
            }}
          >
            Three steps
          </p>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0, listStyle: 'none' }}>
            {[
              'Open a bill in your email.',
              'Tap Forward (not Reply).',
              'Send it to the address above.',
            ].map((s, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: C.ink }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    color: C.navy,
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ paddingTop: '1px' }}>{s}</span>
              </li>
            ))}
          </ol>
          <p style={{ fontSize: '12px', color: C.ink3, margin: '14px 0 0', lineHeight: 1.5 }}>
            It lands in “Bills to review” — nothing is paid for you, ever.
          </p>
        </div>
      )}

      {/* Quiet dismiss — for the power user who wants it gone early */}
      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: C.ink3,
            fontSize: '12.5px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default GettingStartedCard;
