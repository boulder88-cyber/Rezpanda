import pb from '@/lib/horizonsBackend.js';

// ─── lib/maintenanceLink.js ─────────────────────────────────────────────
// Shared logic for linking a bill to maintenance. Two entry points call
// this: PendingReviewSection.jsx (quick-pick at confirm time) and
// ServiceCompanyCard.jsx (editable later, same pattern as the payment-link
// finder). Centralizing here avoids the schedE.js duplication mistake —
// this file is now the ONE place cadence/category lists and the
// create-or-log write logic live. If a future maintenance rebuild wants
// its own icon-mapped category list, it should import the NAMES from here
// rather than re-declaring them.
//
// Boundary: this only ever WRITES a record of service that already
// happened (a bill arrived) — it never schedules, books, or contacts
// anyone. See, don't do, same as everywhere else.

// ── Shared constants (single source — see comment above) ──────────────
export const MAINTENANCE_CATEGORIES = [
  'HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Landscaping',
  'Pest Control', 'Gutters', 'Insulation', 'Windows', 'Doors',
  'Pool/Spa', 'Security', 'General',
];

export const CADENCE_LIST = ['Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annually', 'Custom'];
export const CADENCE_DAYS = {
  Weekly: 7, Monthly: 30, Quarterly: 90, 'Semi-Annual': 180, Annually: 365,
};

const addDays = (dateStr, days) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setDate(d.getDate() + (days || 365));
  return d.toISOString().split('T')[0];
};

// ── Fetch existing systems for the "log to existing" picker ────────────
// Scoped to home; the picker shows these plus a "+ New system" option.
export async function fetchHomeMaintenanceSystems(homeId) {
  if (!homeId) return [];
  try {
    return await pb.collection('maintenance_systems').getFullList({
      filter: `homeId="${homeId}"`,
      sort: 'systemName',
      $autoCancel: false,
    });
  } catch (err) {
    console.error('fetchHomeMaintenanceSystems failed:', err);
    return []; // fail open — picker just shows "+ New system" only
  }
}

// ── Unlink (used before re-linking, and for an explicit "remove link") ─
// Deletes the maintenanceEvents row and clears invoices.maintenanceEventId.
// Known limitation, documented not urgent: does NOT roll back the
// system's lastServiceDate/nextServiceDate — a mis-link corrected later
// leaves the system's dates as they were set. Re-logging a correct event
// afterward fixes it forward. Acceptable because mis-links should be rare
// and a perfect rollback isn't worth the complexity for v1.
export async function unlinkBillFromMaintenance(invoice) {
  if (!invoice?.maintenanceEventId) return { ok: true };
  try {
    await pb.collection('maintenanceEvents').delete(invoice.maintenanceEventId, { $autoCancel: false });
  } catch (err) {
    // Fail open on the delete (event may already be gone) — still clear the pointer.
    console.warn('unlinkBillFromMaintenance: event delete failed, clearing pointer anyway:', err);
  }
  try {
    await pb.collection('invoices').update(invoice.id, { maintenanceEventId: '' }, { $autoCancel: false });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.response?.message || err?.message || String(err) };
  }
}

// ── The main entry point ────────────────────────────────────────────────
// choice.mode = 'new'      → create a system + its first event
// choice.mode = 'existing' → log an event against an existing system
//
// If the invoice already has a maintenanceEventId (re-linking / editing
// from the card), the old event is deleted first so there's never more
// than one active link per invoice — the double-log guard.
//
// choice shape:
//   { mode: 'new', systemName, systemType, cadence, customDays,
//     vendorId, homeId, ownerId, serviceDate, amount, notes }
//   { mode: 'existing', systemId, vendorId, homeId, ownerId,
//     serviceDate, amount, notes }
export async function attachBillToMaintenance(invoice, choice) {
  if (!invoice?.id) return { ok: false, error: 'Missing invoice.' };

  // Double-log guard: clear any prior link before writing a new one.
  if (invoice.maintenanceEventId) {
    const undo = await unlinkBillFromMaintenance(invoice);
    if (!undo.ok) return undo;
  }

  try {
    let systemId = choice.systemId;

    if (choice.mode === 'new') {
      const cadenceDays = choice.cadence === 'Custom'
        ? (parseInt(choice.customDays, 10) || 365)
        : (CADENCE_DAYS[choice.cadence] || 365);

      const system = await pb.collection('maintenance_systems').create({
        systemName: choice.systemName || '',
        systemType: choice.systemType || 'General',
        vendorId: choice.vendorId || '',
        reminderFrequencyDays: cadenceDays,
        recurringReminder: true,
        lastServiceDate: choice.serviceDate || '',
        nextServiceDate: addDays(choice.serviceDate, cadenceDays),
        homeId: choice.homeId,
        ownerId: choice.ownerId,
      }, { $autoCancel: false });
      systemId = system.id;
    } else if (choice.mode === 'existing') {
      if (!systemId) return { ok: false, error: 'No system selected.' };
      // Advance the existing system's schedule from this service date.
      let cadenceDays = 365;
      try {
        const existing = await pb.collection('maintenance_systems').getOne(systemId, { $autoCancel: false });
        cadenceDays = existing.reminderFrequencyDays || 365;
      } catch (err) {
        console.warn('attachBillToMaintenance: could not read existing system for cadence, defaulting to 365d:', err);
      }
      await pb.collection('maintenance_systems').update(systemId, {
        lastServiceDate: choice.serviceDate || '',
        nextServiceDate: addDays(choice.serviceDate, cadenceDays),
        vendorId: choice.vendorId || '',
      }, { $autoCancel: false });
    } else {
      return { ok: false, error: 'Unknown mode: ' + choice.mode };
    }

    const event = await pb.collection('maintenanceEvents').create({
      ownerId: choice.ownerId,
      homeId: choice.homeId,
      systemId,
      invoiceId: invoice.id,
      vendorId: choice.vendorId || '',
      serviceDate: choice.serviceDate || '',
      amount: choice.amount ?? null,
      notes: choice.notes || '',
      source: 'bill',
    }, { $autoCancel: false });

    await pb.collection('invoices').update(invoice.id, {
      maintenanceEventId: event.id,
    }, { $autoCancel: false });

    return { ok: true, systemId, eventId: event.id };
  } catch (err) {
    // Surface the real backend error — same discipline as
    // ServiceCompanyCard's assign-verification (it's what caught the
    // placement bug). Never swallow silently.
    return { ok: false, error: err?.response?.message || err?.message || String(err) };
  }
}
