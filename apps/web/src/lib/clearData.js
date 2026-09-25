import pb from '@/lib/horizonsBackend.js';

// ═══════════════════════════════════════════════════════════════════════
// CLEAR DATA — property-level and full-account data wipes.
//
// Scope: the CURRENT live data model only — the collections every real page
// in the app actually reads from today (Bill Pay, Payment Log, Maintenance
// Management, Document Vault, Rentals). Field names are NOT consistent
// across these collections — most link to a property via `homeId`, but
// `property_documents` uses `propertyId`. Both are handled below.
//
// Deliberately NOT touched:
//   - `vendors` — a per-account service-company directory, not scoped to
//     any one property. Doesn't fit "clear this property's data", and
//     wiping someone's contractor list isn't obviously part of "my home
//     data" for a full account wipe either. Left alone on purpose.
//   - The older `properties` / `expenses` / `tenants` / `leases` / `plants`
//     / `utilities` / `rental_properties` collections — a separate,
//     pre-CasaCEO-pivot data model with no live create path and no nav
//     link anywhere in the current app. An account with leftover data
//     there from before the pivot won't have it touched by this.
//
// Every call passes `$autoCancel: false` — this codebase fires many
// concurrent requests at the same collection endpoint elsewhere, and
// PocketBase's client auto-cancels an earlier in-flight request to the same
// endpoint by default, which would silently drop deletes here otherwise.
//
// IMPORTANT: deletes are tracked individually. A partial failure (a rule
// misconfigured on one collection, a dropped request) does NOT get
// swallowed into a false "all clear" — it comes back in `failed` so the
// caller can tell the user the truth instead of a comforting checkmark.
// ═══════════════════════════════════════════════════════════════════════

// Collections that link to a specific home, and which field they use to do it.
const HOME_SCOPED_COLLECTIONS = [
  { name: 'invoices', homeField: 'homeId' },
  { name: 'payment_history', homeField: 'homeId' },
  { name: 'maintenance_systems', homeField: 'homeId' },
  { name: 'property_documents', homeField: 'propertyId' },
  { name: 'rentalExpenses', homeField: 'homeId' },
  { name: 'rentReceipts', homeField: 'homeId' },
];

// Delete every record a filtered list returns, a handful at a time so this
// doesn't fire hundreds of simultaneous requests for a big account. Returns
// { deleted, failed } — failed is the count that threw (permission error,
// dropped request, etc.), never silently dropped.
const deleteAll = async (collection, filter) => {
  const records = await pb.collection(collection).getFullList({ filter, $autoCancel: false });
  let deleted = 0;
  let failed = 0;
  const CHUNK = 20;
  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK);
    const results = await Promise.allSettled(
      chunk.map((r) => pb.collection(collection).delete(r.id, { $autoCancel: false }))
    );
    for (const r of results) {
      if (r.status === 'fulfilled') deleted += 1;
      else failed += 1;
    }
  }
  if (failed > 0) {
    console.error(`clearData: ${failed} record(s) in "${collection}" could not be deleted (filter: ${filter})`);
  }
  return { deleted, failed };
};

// Runs deleteAll across a list of collections and rolls the results into
// one summary: per-collection counts, plus totals so callers can give an
// honest answer instead of assuming everything worked.
const runSweep = async (jobs) => {
  const counts = {};
  let totalFailed = 0;
  for (const { name, filter } of jobs) {
    const result = await deleteAll(name, filter);
    counts[name] = result;
    totalFailed += result.failed;
  }
  return { counts, allSucceeded: totalFailed === 0, totalFailed };
};

// Wipe everything tied to ONE property. The property (home) record itself
// is left in place — it comes back looking freshly added, empty.
export const clearPropertyData = async (ownerId, homeId) => {
  const jobs = HOME_SCOPED_COLLECTIONS.map(({ name, homeField }) => ({
    name,
    filter: `ownerId="${ownerId}" && ${homeField}="${homeId}"`,
  }));
  return runSweep(jobs);
};

// Wipe EVERYTHING for an account: every home-scoped record across every
// property (including "Other & unassigned" bills that aren't tied to any
// home), then every home itself. The login stays intact — this is a full
// data reset, not an account deletion.
export const clearAccountData = async (ownerId) => {
  const jobs = HOME_SCOPED_COLLECTIONS.map(({ name }) => ({
    name,
    filter: `ownerId="${ownerId}"`,
  }));
  const result = await runSweep(jobs);

  const homesResult = await deleteAll('homes', `ownerId="${ownerId}"`);
  result.counts.homes = homesResult;
  result.totalFailed += homesResult.failed;
  result.allSucceeded = result.totalFailed === 0;

  // Clear cached home-selection state so nothing in the UI keeps pointing
  // at a home that no longer exists.
  localStorage.removeItem('selectedHomeId');
  localStorage.removeItem('allProperties');
  localStorage.removeItem('otherScope');

  return result;
};
