import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/horizonsBackend.js';
import { X, Mail, ClipboardCheck, Plus, Copy, Check, Eye, EyeOff, ShieldCheck,
  Inbox, CheckCircle2, Wallet, Landmark, CreditCard, Circle } from 'lucide-react';

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
  amber: '#f59e0b',
  amberTint: '#fdf6e9',
  purple: '#7c5cbf',
};

const FORWARD_DOMAIN = 'bills.casaceo.com';
const buildForwardAddress = (userId) => userId ? `ceo+${userId}@${FORWARD_DOMAIN}` : '';

// Small reusable section heading
const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ink3, margin: '0 0 12px' }}>
    {children}
  </h3>
);

// One stage in the bill's life. Icon disc + title + plain body. The connector
// line between stages is drawn by the parent so the column reads as a path.
const CycleStep = ({ icon: Icon, tint, title, body, last }) => (
  <div style={{ display: 'flex', gap: '12px' }}>
    {/* rail: disc + connecting line */}
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: tint || C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.navy }}>
        <Icon size={16} />
      </div>
      {!last && <div style={{ width: '2px', flex: 1, minHeight: '14px', background: C.border, margin: '2px 0' }} />}
    </div>
    <div style={{ paddingBottom: last ? 0 : '16px', minWidth: 0 }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>{title}</div>
      <div style={{ fontSize: '13px', color: C.ink2, marginTop: '2px', lineHeight: 1.45 }}>{body}</div>
    </div>
  </div>
);

// One way a bill gets paid + how it closes. The accent bar echoes the app's
// left-bar status language (green bank / purple card / navy manual).
const PayType = ({ icon: Icon, accent, title, closes, body }) => (
  <div style={{ display: 'flex', gap: '0', marginBottom: '10px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
    <div style={{ width: '4px', background: accent, flexShrink: 0 }} />
    <div style={{ padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={15} style={{ color: accent, flexShrink: 0 }} />
        <span style={{ fontSize: '14px', fontWeight: 600, color: C.ink }}>{title}</span>
      </div>
      <div style={{ fontSize: '13px', color: C.ink2, marginTop: '5px', lineHeight: 1.45 }}>{body}</div>
      <div style={{ fontSize: '12px', fontWeight: 600, color: accent, marginTop: '6px' }}>
        Closes when: {closes}
      </div>
    </div>
  </div>
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

          {/* 3 — The full cycle of a bill */}
          <SectionTitle>The full cycle of a bill</SectionTitle>
          <p style={{ fontSize: '13px', color: C.ink2, lineHeight: 1.5, margin: '0 0 16px' }}>
            Every bill follows the same path — from the moment it arrives to the
            moment it’s fully closed. You’re in control at each step.
          </p>
          <div style={{ marginBottom: '4px' }}>
            <CycleStep
              icon={Inbox}
              title="1 · It arrives"
              body="You forward or upload a bill. CasaCEO reads the amount, due date, and biller, and drops it into “Bills to review.”"
            />
            <CycleStep
              icon={ClipboardCheck}
              title="2 · You review it"
              body="You check what we read — fix anything, set which home it belongs to — then confirm. Nothing counts until you say so."
            />
            <CycleStep
              icon={CheckCircle2}
              tint="#e8f3ee"
              title="3 · It’s open and counting"
              body="Now it’s a real obligation. It shows up on your dashboard, in My Bills, and in Cash Needs — so what you owe is always in front of you."
            />
            <CycleStep
              icon={Wallet}
              title="4 · You pay it your way"
              body="Manual, bank autopay, or a card on autopay — you pay however you already do. CasaCEO never pays for you."
            />
            <CycleStep
              icon={Circle}
              tint="#f0eef7"
              title="5 · You close it out"
              body="Mark it paid, reviewed, or cleared — and it leaves your open list. That’s the loop closed."
              last
            />
          </div>

          <div style={{ height: '1px', background: C.border, margin: '24px 0' }} />

          {/* 4 — How bills get paid (the three close paths) */}
          <SectionTitle>How bills get paid</SectionTitle>
          <p style={{ fontSize: '13px', color: C.ink2, lineHeight: 1.5, margin: '0 0 14px' }}>
            A bill closes in the way it’s actually paid. You tell CasaCEO which,
            and it tracks each one honestly.
          </p>

          <PayType
            icon={Wallet}
            accent={C.navy}
            title="You pay it yourself"
            body="You pay the biller directly — from your bank’s site, a check, however you like. When it’s done, you mark it Paid."
            closes="you mark it Paid"
          />
          <PayType
            icon={Landmark}
            accent={C.green}
            title="Bank autopay"
            body="Your bank drafts it automatically. There’s nothing to do — you just mark it Reviewed so you know you’ve seen it."
            closes="you mark it Reviewed"
          />
          <PayType
            icon={CreditCard}
            accent={C.purple}
            title="Card autopay"
            body="It’s charged to a credit card automatically. You mark it Cleared once you’ve paid that card statement."
            closes="you mark it Cleared"
          />

          {/* The key idea — why a card bill stays open. This is the one
              non-obvious thing about the app; explaining it plainly is what
              makes a still-showing card bill read as honest, not broken. */}
          <div style={{ marginTop: '4px', padding: '14px 16px', background: C.amberTint, border: `1px solid #f2e2c0`, borderRadius: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#8a6d1f', marginBottom: '5px' }}>
              Why a card bill still shows after it’s “paid”
            </div>
            <p style={{ fontSize: '13px', color: C.ink2, lineHeight: 1.5, margin: 0 }}>
              When autopay charges your credit card, the money hasn’t really left
              your accounts yet — it’s now sitting on a card statement you’ll pay
              later. So CasaCEO keeps a card bill <strong style={{ fontWeight: 600, color: C.ink }}>open</strong> and
              counted until you <strong style={{ fontWeight: 600, color: C.ink }}>Clear</strong> it.
              Paid isn’t the same as gone — clearing is what truly closes the loop,
              so the money you still owe is never hidden from you.
            </p>
          </div>

          <div style={{ height: '1px', background: C.border, margin: '24px 0' }} />

          {/* 5 — What CasaCEO does / doesn't do */}
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

          {/* The objective — the one-line "why," so the whole cycle has a point. */}
          <div style={{ marginTop: '22px', padding: '16px 18px', background: C.navy, borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              The whole point
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.86)', lineHeight: 1.55, margin: 0 }}>
              One honest, always-reconciling picture of what your home costs and
              what you still owe. You see the full cycle of every bill — and you
              keep every decision. That’s it. A calm place that’s yours.
            </p>
          </div>

          <div style={{ height: '24px' }} />
        </div>
      </aside>
    </>
  );
};

export default HelpPanel;
