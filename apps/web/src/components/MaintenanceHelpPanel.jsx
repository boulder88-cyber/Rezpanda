import React, { useState } from 'react';
import { X, Wrench, Calendar, Bell, Phone, CheckCircle2, HelpCircle } from 'lucide-react';

// ─── Maintenance help panel ────────────────────────────────────────────
// A quick "how this works" reference, scoped to the Maintenance page only —
// deliberately NOT folded into the global Help panel (that one covers Bill
// Pay and is locked at a 5-section ceiling; Maintenance gets its own,
// smaller version instead, same as Rentals or Cash Needs would if they
// ever needed one). One fact, one place: this content lives here and only
// here.
//
// Self-contained: manages its own open/close state, so integration is a
// one-line drop-in — <MaintenanceHelpPanel /> — wherever the rebuilt
// Maintenance page wants the trigger (page header is the natural spot,
// same idea as the sidebar's "How it works" row for the rest of the app).
//
// Visual language matches HelpPanel.jsx on purpose: same slide-in-from-
// right shell, same CycleStep rail, same boundary-callout treatment, same
// plain tone. Content is maintenance-specific and doesn't repeat bill
// content, so if a caretaker view or global search ever needs "how does
// the whole app work," pull from both rather than merging them.
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
  amberTint: '#fdf6e9',
};

const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.ink3, margin: '0 0 12px' }}>
    {children}
  </h3>
);

// One stage in the maintenance cycle. Icon disc + title + plain body, with
// a connecting rail line — identical shape to HelpPanel's CycleStep so the
// two "how it works" reads feel like the same product.
const CycleStep = ({ icon: Icon, tint, title, body, last }) => (
  <div style={{ display: 'flex', gap: '12px' }}>
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

// Dual mode: if `open`/`onClose` props are passed, the panel is CONTROLLED
// from outside (no trigger button rendered — e.g. the sidebar's "How it
// works" row swaps between this and the global HelpPanel based on route).
// If no props are passed, it manages its own state and renders its own
// trigger button — for dropping straight into the rebuilt Maintenance page
// header later without any wiring.
const MaintenanceHelpPanel = ({ open: openProp, onClose }) => {
  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;
  const close = () => (isControlled ? onClose && onClose() : setInternalOpen(false));

  return (
    <>
      {!isControlled && (
        <button
          onClick={() => setInternalOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.navy, fontSize: '13px', fontWeight: 600,
            padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
          }}
        >
          <HelpCircle size={15} />
          How maintenance works
        </button>
      )}

      {open && (
        <>
          <div
            onClick={close}
            style={{ position: 'fixed', inset: 0, background: 'rgba(31,39,51,0.45)', zIndex: 60 }}
          />
          <aside
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '380px', maxWidth: '92vw', background: C.surface,
              borderLeft: `1px solid ${C.border}`, zIndex: 61,
              display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 28px rgba(31,39,51,0.10)',
            }}
          >
            <div style={{ height: '64px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: C.ink }}>How maintenance works</div>
                <div style={{ fontSize: '12px', color: C.ink3, marginTop: '1px' }}>A quick reference, anytime</div>
              </div>
              <button
                onClick={close}
                aria-label="Close"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.ink2, padding: '6px', borderRadius: '8px' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '22px 20px' }}>
              <SectionTitle>The cycle</SectionTitle>
              <p style={{ fontSize: '13px', color: C.ink2, lineHeight: 1.5, margin: '0 0 16px' }}>
                Same idea as bills — track it once, and CasaCEO keeps a quiet
                eye on the rest.
              </p>

              <div style={{ marginBottom: '4px' }}>
                <CycleStep
                  icon={Wrench}
                  title="1 · You record what you have"
                  body="Add a system — HVAC, water heater, gutters — and how often it needs attention. A minute now, years of not wondering later."
                />
                <CycleStep
                  icon={Calendar}
                  title="2 · CasaCEO tracks the schedule"
                  body="It knows when something's due next, and keeps watch for weather that matters — a freeze warning means “check your pipes,” not a surprise."
                />
                <CycleStep
                  icon={Bell}
                  tint="#e8f3ee"
                  title="3 · It surfaces when it's time"
                  body="Due and overdue items show up on the Maintenance tab. Nothing hides, and nothing nags you before it's time."
                />
                <CycleStep
                  icon={Phone}
                  title="4 · You handle it your way"
                  body="Call your usual person, do it yourself, whatever you already do. CasaCEO doesn't book anyone or send anyone to your door."
                />
                <CycleStep
                  icon={CheckCircle2}
                  tint="#f0eef7"
                  title="5 · You mark it done"
                  body="It logs to history and the next due date resets on its own. That's the loop closed."
                  last
                />
              </div>

              <div style={{ height: '1px', background: C.border, margin: '24px 0' }} />

              <SectionTitle>What maintenance doesn’t do</SectionTitle>
              <div style={{ padding: '14px 16px', background: C.amberTint, border: '1px solid #f2e2c0', borderRadius: '10px' }}>
                <p style={{ fontSize: '13px', color: C.ink2, lineHeight: 1.5, margin: 0 }}>
                  CasaCEO tracks and reminds — it never contacts a contractor,
                  orders parts, or schedules anyone on your behalf. If
                  something needs a call, that call is still yours to make.
                  Same promise as bills: it helps you{' '}
                  <strong style={{ fontWeight: 600, color: C.ink }}>see</strong>{' '}
                  what your home needs, never{' '}
                  <strong style={{ fontWeight: 600, color: C.ink }}>does</strong>{' '}
                  it for you.
                </p>
              </div>

              <div style={{ height: '24px' }} />
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default MaintenanceHelpPanel;
