import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/horizonsBackend.js';
import { X, Mail, ClipboardCheck, Plus, Copy, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react';

// ─── Help panel ────────────────────────────────────────────────────────
// The always-there reference, opened from the quiet "How it works" row in
// the sidebar footer. A short, plain explainer — NOT a knowledge base.
// Three sections: getting started, forwarding bills, and what CasaCEO does
// and doesn't do (the "see, don't do" promise, stated plainly so the user
// trusts the thing).
//
// Re-show checklist: writes onboardingDismissed: false on the user record,
// the inverse of how GettingStartedCard dismisses itself — so "show the
// setup steps again" reuses the same one flag, no new mechanism.
//
// Design system: navy/gold, warm tokens, inline styles, no Tailwind palette.

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
};

const FORWARD_DOMAIN = 'bills.casaceo.com';
const buildForwardAddress = (userId) => userId ? `ceo+${userId}@${FORWARD_DOMAIN}` : '';

// Small reusable section heading
const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ink3, margin: '0 0 12px' }}>
    {children}
  </h3>
);

const HelpPanel = ({ open, onClose }) => {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [reshown, setReshown] = useState(false);

  const forwardAddress = buildForwardAddress(currentUser?.id);

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

  const handleReshowChecklist = async () => {
    if (!currentUser?.id) return;
    try {
      await pb.collection('users').update(
        currentUser.id,
        { onboardingDismissed: false },
        { $autoCancel: false }
      );
      setReshown(true);
    } catch {
      // Field may not exist yet — harmless; the card is data-derived anyway.
      setReshown(true);
    }
  };

  if (!open) return null;

  const steps = [
    { icon: Plus, title: 'Add your first home', body: 'Everything in CasaCEO attaches to a property. Start with one.' },
    { icon: Mail, title: 'Forward your first bill', body: 'Send any bill to your private address — we read the amount, due date, and biller for you.' },
    { icon: ClipboardCheck, title: 'Confirm a bill', body: 'It lands in “Bills to review.” You check it and confirm — you always get the last word.' },
  ];

  return (
    <>
      {/* Dim backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(31,39,51,0.45)', zIndex: 60 }}
      />

      {/* Slide-in panel */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '380px',
          maxWidth: '92vw',
          background: C.surface,
          borderLeft: `1px solid ${C.border}`,
          zIndex: 61,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 28px rgba(31,39,51,0.10)',
        }}
      >
        {/* Header */}
        <div style={{ height: '64px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: C.ink }}>How CasaCEO works</div>
            <div style={{ fontSize: '12px', color: C.ink3, marginTop: '1px' }}>A quick reference, anytime</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.ink2, padding: '6px', borderRadius: '8px' }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 20px' }}>

          {/* 1 — Getting started */}
          <SectionTitle>Getting started</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '9px', flexShrink: 0, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.navy }}>
                    <Icon size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>{s.title}</div>
                    <div style={{ fontSize: '13px', color: C.ink2, marginTop: '2px', lineHeight: 1.45 }}>{s.body}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Re-show the setup checklist */}
          <button
            onClick={handleReshowChecklist}
            disabled={reshown}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'transparent', border: `1px solid ${C.border}`,
              color: reshown ? C.green : C.navy, fontSize: '13px', fontWeight: 600,
              padding: '8px 14px', borderRadius: '8px', cursor: reshown ? 'default' : 'pointer',
            }}
          >
            {reshown
              ? <><Check size={14} /> Checklist back on your dashboard</>
              : <>Show the setup checklist again</>}
          </button>

          <div style={{ height: '1px', background: C.border, margin: '24px 0' }} />

          {/* 2 — Forwarding bills */}
          <SectionTitle>Forwarding bills</SectionTitle>
          <p style={{ fontSize: '13px', color: C.ink2, lineHeight: 1.5, margin: '0 0 12px' }}>
            Every home gets a private email address. Forward a bill to it — from your
            inbox, or set it as your billing email at the provider — and CasaCEO reads
            it and drops it into “Bills to review.”
          </p>

          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: C.ink2, margin: '0 0 6px' }}>
            Your private bills address
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
            <code
              title={forwardAddress}
              style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: C.navy }}
            >
              {forwardAddress || 'Sign in to see your address'}
            </code>
            <button
              onClick={handleCopy}
              disabled={!forwardAddress}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: copied ? C.green : C.navy, color: '#fff', fontSize: '13px', fontWeight: 600, padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: forwardAddress ? 'pointer' : 'default', opacity: forwardAddress ? 1 : 0.5, flexShrink: 0 }}
            >
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>

          <ol style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0, listStyle: 'none' }}>
            {['Open a bill in your email.', 'Tap Forward (not Reply).', 'Send it to the address above.'].map((s, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: C.ink }}>
                <span style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '6px', background: C.bg, border: `1px solid ${C.border}`, color: C.navy, fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <span style={{ paddingTop: '1px' }}>{s}</span>
              </li>
            ))}
          </ol>

          <div style={{ height: '1px', background: C.border, margin: '24px 0' }} />

          {/* 3 — What CasaCEO does / doesn't do */}
          <SectionTitle>What CasaCEO does — and doesn’t</SectionTitle>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Eye size={16} style={{ color: C.green, flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '13px', color: C.ink, lineHeight: 1.45 }}>
                <strong style={{ fontWeight: 600 }}>It shows you everything.</strong>{' '}
                <span style={{ color: C.ink2 }}>What’s due, what’s past due, what each home costs over the year — all in one calm place.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <EyeOff size={16} style={{ color: C.ink3, flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '13px', color: C.ink, lineHeight: 1.45 }}>
                <strong style={{ fontWeight: 600 }}>It never moves your money.</strong>{' '}
                <span style={{ color: C.ink2 }}>No bank connection, no stored card or password, no auto-paying. You pay your bills the way you always have — CasaCEO just keeps the picture clear.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <ShieldCheck size={16} style={{ color: C.navy, flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '13px', color: C.ink, lineHeight: 1.45 }}>
                <strong style={{ fontWeight: 600 }}>It keeps only what it needs.</strong>{' '}
                <span style={{ color: C.ink2 }}>Bills become tidy records — amount, date, biller. The original email or PDF isn’t kept.</span>
              </div>
            </div>
          </div>

          <div style={{ height: '24px' }} />
        </div>
      </aside>
    </>
  );
};

export default HelpPanel;
