import React, { useState, useEffect, useRef } from 'react';
import {
  Droplets, Flame, Zap, Wind, HelpCircle, MapPin, ImagePlus, Pencil, Trash2, Check, Plus, Loader2, ShieldAlert
} from 'lucide-react';
import pb from '@/lib/horizonsBackend.js';

// ═══════════════════════════════════════════════════════════════════════
// CRITICAL HOME INFO — "if something goes wrong, where do I look?"
//
// Pure SEE, not DO: this never acts on anything, it just holds the facts a
// homeowner (or anyone standing in for them — a spouse, a sitter, a
// neighbor grabbing the spare key in an emergency) would need to find fast:
// where the main water shutoff is, where the gas valve is, which breaker is
// which, where the water heater's shutoff lives. Same thesis as Quick
// Guides (which teaches the generic HOW) — this is the specific WHERE, for
// THIS actual house.
//
// "Smart" here means the pre-seeded checklist of the common critical
// points, not an AI feature — there's no LLM call in this file. The value
// is entirely in getting the homeowner to actually write these facts down
// once, in one place, before the day they're needed in a hurry.
//
// Data lives in a new PocketBase collection, `critical_home_info`, read
// and written with the CALLER'S OWN session via the pb SDK (same
// homeId/ownerId pattern already used by maintenance_systems) — no new
// backend, no elevated credentials.
//
// Design tokens match QuickGuidesSection.jsx / MaintenanceManagementPage.jsx
// exactly (this app hasn't migrated to lib/brandTokens.js yet — same hex
// values either way), so this reads as the same product.
// ═══════════════════════════════════════════════════════════════════════

const NAVY = '#1e3a5f';
const GOLD = '#c9a96e';
const INK = '#1f2733';
const INK_SOFT = '#5b6472';
const INK_MUTE = '#95a0ae';
const SURFACE = '#ffffff';
const BORDER = '#e9e4db';
const NAVY_TINT = '#eef2f7';
const PAGE = '#faf8f4';

const COLLECTION = 'critical_home_info';

// The starter checklist. `key` links a suggestion to its saved record —
// anything the homeowner adds beyond this list is saved with key: '' and
// shown under "Other".
const SUGGESTED_POINTS = [
  { key: 'water_main', category: 'water', icon: Droplets, label: 'Main water shutoff', hint: 'Where it is, and which way to turn it.' },
  { key: 'gas_shutoff', category: 'gas', icon: Flame, label: 'Gas shutoff valve', hint: 'Where it is — this is the one guide with real stakes.' },
  { key: 'electrical_panel', category: 'electrical', icon: Zap, label: 'Electrical panel / breaker box', hint: 'Where it is, and anything about how the breakers are labeled.' },
  { key: 'water_heater', category: 'water', icon: Droplets, label: 'Water heater', hint: 'Location, and its own shutoff valve if it has one.' },
  { key: 'hvac_filter', category: 'hvac', icon: Wind, label: 'HVAC filter', hint: "Location and size — the thing you can never remember when you're standing in the store." },
  { key: 'sump_pump', category: 'water', icon: Droplets, label: 'Sump pump', hint: 'Only if the home has one — where it is and what "working" looks like.' },
];

const CATEGORY_STYLE = {
  water: { tint: '#eaf2fb', ink: '#2b5a8c' },
  gas: { tint: '#fdf1ea', ink: '#a35a1f' },
  electrical: { tint: '#fdf6e0', ink: '#8a6d1f' },
  hvac: { tint: '#eef2f7', ink: NAVY },
  other: { tint: NAVY_TINT, ink: NAVY },
};

// ─── One point: either documented (shows what was saved) or a prompt to
// add it. Editing happens in place, in the same card. ─────────────────────
const PointCard = ({ point, record, onSave, onDelete, saving }) => {
  const [editing, setEditing] = useState(false);
  const [location, setLocation] = useState(record?.location || '');
  const [notes, setNotes] = useState(record?.notes || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!editing) {
      setLocation(record?.location || '');
      setNotes(record?.notes || '');
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  }, [editing, record]);

  const Icon = point.icon || HelpCircle;
  const style = CATEGORY_STYLE[point.category] || CATEGORY_STYLE.other;
  const existingPhotoUrl = record?.photo ? pb.files.getUrl(record, record.photo) : null;

  const handlePickPhoto = () => fileInputRef.current && fileInputRef.current.click();
  const handlePhotoChosen = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!location.trim()) return;
    await onSave({ location: location.trim(), notes: notes.trim(), photoFile });
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '18px', gridColumn: 'span 1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: style.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon style={{ width: '16px', height: '16px', color: style.ink }} />
          </span>
          <span style={{ fontSize: '14.5px', fontWeight: 600, color: INK }}>{point.label}</span>
        </div>

        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: INK_SOFT, marginBottom: '5px' }}>Where is it?</label>
        <input
          autoFocus
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={point.hint || 'e.g. basement, left wall near the water heater'}
          style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '9px', border: `1px solid ${BORDER}`, fontSize: '14px', color: INK, marginBottom: '10px' }}
        />

        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: INK_SOFT, marginBottom: '5px' }}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything else worth knowing — which way it turns, a code, a quirk."
          rows={2}
          style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '9px', border: `1px solid ${BORDER}`, fontSize: '14px', color: INK, marginBottom: '10px', resize: 'vertical', fontFamily: 'inherit' }}
        />

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChosen} style={{ display: 'none' }} />
        <button
          onClick={handlePickPhoto}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 500, color: INK_SOFT, background: PAGE, border: `1px solid ${BORDER}`, borderRadius: '9px', padding: '8px 12px', cursor: 'pointer', marginBottom: '14px' }}
        >
          <ImagePlus style={{ width: '14px', height: '14px' }} />
          {photoPreview ? 'Photo selected' : existingPhotoUrl ? 'Replace photo' : 'Add a photo (optional)'}
        </button>
        {(photoPreview || existingPhotoUrl) && (
          <img
            src={photoPreview || existingPhotoUrl}
            alt=""
            style={{ display: 'block', width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', marginTop: '-8px', marginBottom: '14px', border: `1px solid ${BORDER}` }}
          />
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSave}
            disabled={saving || !location.trim()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#fff', background: NAVY, border: 'none', borderRadius: '9px', padding: '8px 16px', cursor: 'pointer', opacity: saving || !location.trim() ? 0.6 : 1 }}
          >
            {saving ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" /> : <Check style={{ width: '13px', height: '13px' }} />} Save
          </button>
          <button
            onClick={() => setEditing(false)}
            style={{ fontSize: '13px', fontWeight: 500, color: INK_SOFT, background: 'transparent', border: 'none', padding: '8px 10px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (record) {
    return (
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: style.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: '16px', height: '16px', color: style.ink }} />
            </span>
            <span style={{ fontSize: '14.5px', fontWeight: 600, color: INK }}>{point.label}</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button onClick={() => setEditing(true)} title="Edit" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: INK_MUTE }}>
              <Pencil style={{ width: '14px', height: '14px' }} />
            </button>
            <button onClick={() => onDelete(record.id)} title="Remove" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: INK_MUTE }}>
              <Trash2 style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'flex-start' }}>
          {existingPhotoUrl && (
            <img src={existingPhotoUrl} alt="" style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${BORDER}`, flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '14px', color: INK_SOFT, lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
              <MapPin style={{ width: '13px', height: '13px', color: INK_MUTE, marginTop: '3px', flexShrink: 0 }} />
              {record.location}
            </p>
            {record.notes && (
              <p style={{ fontSize: '13px', color: INK_MUTE, lineHeight: 1.5, marginTop: '4px' }}>{record.notes}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', width: '100%',
        background: PAGE, border: `1px dashed ${BORDER}`, borderRadius: '14px', padding: '18px',
        cursor: 'pointer', boxSizing: 'border-box',
      }}
    >
      <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: style.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.7 }}>
        <Icon style={{ width: '16px', height: '16px', color: style.ink }} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: '14.5px', fontWeight: 600, color: INK }}>{point.label}</span>
        <span style={{ display: 'block', fontSize: '12.5px', color: INK_MUTE, marginTop: '2px' }}>Not documented yet — tap to add</span>
      </span>
    </button>
  );
};

// ─── A blank card for a custom, non-suggested point — one self-contained
// form: label, location, notes, and an optional photo, all at once. ───────
const CustomPointCard = ({ onSave, onCancel, saving }) => {
  const [label, setLabel] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handlePickPhoto = () => fileInputRef.current && fileInputRef.current.click();
  const handlePhotoChosen = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const canSave = label.trim() && location.trim();
  const handleSave = async () => {
    if (!canSave) return;
    await onSave({ label: label.trim(), location: location.trim(), notes: notes.trim(), photoFile });
  };

  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '14px', padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: CATEGORY_STYLE.other.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <HelpCircle style={{ width: '16px', height: '16px', color: CATEGORY_STYLE.other.ink }} />
        </span>
        <span style={{ fontSize: '14.5px', fontWeight: 600, color: INK }}>New critical point</span>
      </div>

      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: INK_SOFT, marginBottom: '5px' }}>What is it?</label>
      <input
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g. Septic tank access"
        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '9px', border: `1px solid ${BORDER}`, fontSize: '14px', color: INK, marginBottom: '10px' }}
      />

      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: INK_SOFT, marginBottom: '5px' }}>Where is it?</label>
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="e.g. side yard, under the deck"
        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '9px', border: `1px solid ${BORDER}`, fontSize: '14px', color: INK, marginBottom: '10px' }}
      />

      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: INK_SOFT, marginBottom: '5px' }}>Notes (optional)</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Anything else worth knowing."
        rows={2}
        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '9px', border: `1px solid ${BORDER}`, fontSize: '14px', color: INK, marginBottom: '10px', resize: 'vertical', fontFamily: 'inherit' }}
      />

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChosen} style={{ display: 'none' }} />
      <button
        onClick={handlePickPhoto}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 500, color: INK_SOFT, background: PAGE, border: `1px solid ${BORDER}`, borderRadius: '9px', padding: '8px 12px', cursor: 'pointer', marginBottom: '14px' }}
      >
        <ImagePlus style={{ width: '14px', height: '14px' }} />
        {photoPreview ? 'Photo selected' : 'Add a photo (optional)'}
      </button>
      {photoPreview && (
        <img src={photoPreview} alt="" style={{ display: 'block', width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', marginTop: '-8px', marginBottom: '14px', border: `1px solid ${BORDER}` }} />
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#fff', background: NAVY, border: 'none', borderRadius: '9px', padding: '8px 16px', cursor: 'pointer', opacity: saving || !canSave ? 0.6 : 1 }}
        >
          {saving ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" /> : <Check style={{ width: '13px', height: '13px' }} />} Save
        </button>
        <button onClick={onCancel} style={{ fontSize: '13px', fontWeight: 500, color: INK_SOFT, background: 'transparent', border: 'none', padding: '8px 10px', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const CriticalHomeInfoSection = ({ home, currentUser }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [addingCustom, setAddingCustom] = useState(false);

  const load = async () => {
    if (!home?.id) return;
    setLoading(true);
    try {
      const list = await pb.collection(COLLECTION).getFullList({
        filter: `homeId="${home.id}"`, sort: 'created', $autoCancel: false,
      });
      setRecords(list);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [home?.id]);

  const recordFor = (key) => records.find((r) => r.key === key);

  const buildFormData = (fields, extra) => {
    const fd = new FormData();
    fd.append('homeId', home.id);
    fd.append('ownerId', currentUser.id);
    fd.append('location', fields.location);
    fd.append('notes', fields.notes || '');
    if (fields.photoFile) fd.append('photo', fields.photoFile);
    Object.entries(extra || {}).forEach(([k, v]) => fd.append(k, v));
    return fd;
  };

  const handleSaveSuggested = async (point, fields) => {
    setSavingKey(point.key);
    try {
      const existing = recordFor(point.key);
      const fd = buildFormData(fields, { key: point.key, label: point.label, category: point.category });
      if (existing) {
        await pb.collection(COLLECTION).update(existing.id, fd, { $autoCancel: false });
      } else {
        await pb.collection(COLLECTION).create(fd, { $autoCancel: false });
      }
      await load();
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveCustom = async (fields) => {
    setSavingKey('__custom__');
    try {
      const fd = buildFormData(fields, { key: '', label: fields.label, category: 'other' });
      await pb.collection(COLLECTION).create(fd, { $autoCancel: false });
      setAddingCustom(false);
      await load();
    } finally {
      setSavingKey(null);
    }
  };

  const handleDelete = async (id) => {
    await pb.collection(COLLECTION).delete(id, { $autoCancel: false });
    await load();
  };

  const customRecords = records.filter((r) => !SUGGESTED_POINTS.some((p) => p.key === r.key));
  const documentedCount = SUGGESTED_POINTS.filter((p) => recordFor(p.key)).length + customRecords.length;

  if (!home?.id) return null;

  return (
    <div id="critical-home-info" style={{ background: SURFACE, borderRadius: '12px', border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: '24px' }}>
      <div style={{ padding: '20px 20px 4px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert style={{ width: '18px', height: '18px', color: GOLD }} />
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: INK }}>Critical home info</h2>
        </div>
        <p style={{ fontSize: '13px', color: INK_MUTE, marginTop: '4px' }}>
          The things you'd want to find fast — even if it's someone else doing the looking.
          {!loading && ` ${documentedCount} of ${SUGGESTED_POINTS.length}+ documented.`}
        </p>
      </div>

      <div style={{ padding: '16px 20px 20px 20px' }}>
        {loading ? (
          <p style={{ fontSize: '13px', color: INK_MUTE }}>Loading…</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {SUGGESTED_POINTS.map((point) => (
                <PointCard
                  key={point.key}
                  point={point}
                  record={recordFor(point.key)}
                  onSave={(fields) => handleSaveSuggested(point, fields)}
                  onDelete={handleDelete}
                  saving={savingKey === point.key}
                />
              ))}
              {customRecords.map((record) => (
                <PointCard
                  key={record.id}
                  point={{ key: record.key, category: record.category || 'other', icon: HelpCircle, label: record.label }}
                  record={record}
                  onSave={(fields) => handleSaveSuggested({ key: record.key, label: record.label, category: record.category || 'other' }, fields)}
                  onDelete={handleDelete}
                  saving={savingKey === record.key}
                />
              ))}
              {addingCustom && (
                <CustomPointCard onSave={handleSaveCustom} onCancel={() => setAddingCustom(false)} saving={savingKey === '__custom__'} />
              )}
            </div>

            {!addingCustom && (
              <button
                onClick={() => setAddingCustom(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 600, color: NAVY, background: 'transparent', border: 'none', padding: '14px 2px 2px', cursor: 'pointer' }}
              >
                <Plus style={{ width: '14px', height: '14px' }} /> Add another critical point
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CriticalHomeInfoSection;
