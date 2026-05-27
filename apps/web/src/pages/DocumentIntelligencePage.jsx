import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  FileText, Upload, Sparkles, Tag, Calendar, AlertTriangle,
  CheckCircle2, ChevronRight, Eye, Shield, Wrench, DollarSign,
  Clock, X, Activity, Home, Star
} from 'lucide-react';

const DOC_TYPES = [
  { key: 'warranty', label: 'Warranty', color: '#2563eb', bg: '#eff6ff', icon: Shield },
  { key: 'insurance', label: 'Insurance', color: '#e8604c', bg: '#fdf0ee', icon: Shield },
  { key: 'receipt', label: 'Receipt', color: '#059669', bg: '#ecfdf5', icon: DollarSign },
  { key: 'invoice', label: 'Invoice', color: '#d97706', bg: '#fffbeb', icon: FileText },
  { key: 'manual', label: 'Manual', color: '#7c3aed', bg: '#f5f3ff', icon: FileText },
  { key: 'closing', label: 'Closing Doc', color: '#1e3a5f', bg: '#eef2f8', icon: Home },
];

const SCANNED_DOCS = [
  {
    id: 1, name: 'HVAC_Warranty_2022.pdf', type: 'warranty',
    status: 'complete', confidence: 96,
    extracted: {
      type: 'Warranty', provider: 'Carrier Corporation',
      item: 'HVAC System (Model 24ACC636A003)', expires: '2032-03-10', coverage: '10 years parts, 5 years labor',
    },
    tags: ['HVAC', 'Warranty', 'Appliance'],
    timelineEvent: { title: 'HVAC Warranty', date: '2022-03-10' },
    alerts: [],
  },
  {
    id: 2, name: 'StateFarm_HO3_Policy_2026.pdf', type: 'insurance',
    status: 'complete', confidence: 91,
    extracted: {
      type: 'Insurance Policy', provider: 'State Farm',
      item: 'Homeowners HO-3 Policy', expires: '2026-09-01', coverage: '$1,200,000 dwelling',
    },
    tags: ['Insurance', 'Homeowners', 'Annual'],
    timelineEvent: { title: 'Insurance Renewal', date: '2026-09-01' },
    alerts: [{ severity: 'medium', msg: 'No flood coverage detected in policy.' }],
  },
  {
    id: 3, name: 'Kitchen_Remodel_Invoice_2023.pdf', type: 'invoice',
    status: 'complete', confidence: 88,
    extracted: {
      type: 'Invoice', provider: 'Golden Isles Renovation',
      item: 'Kitchen Remodel — Full', expires: null, coverage: 'Total: $47,200',
    },
    tags: ['Renovation', 'Kitchen', 'Receipt'],
    timelineEvent: { title: 'Kitchen Remodel', date: '2023-08-22' },
    alerts: [],
  },
  {
    id: 4, name: 'LG_Washer_Manual.pdf', type: 'manual',
    status: 'processing', confidence: null,
    extracted: null, tags: [], timelineEvent: null, alerts: [],
  },
];

const CONFIDENCE_COLOR = (score) => {
  if (score >= 90) return '#059669';
  if (score >= 75) return '#d97706';
  return '#dc2626';
};

const DocumentIntelligencePage = () => {
  const [selected, setSelected] = useState(SCANNED_DOCS[0]);
  const [dragOver, setDragOver] = useState(false);

  const typeInfo = selected ? DOC_TYPES.find(t => t.key === selected.type) : null;

  return (
    <>
      <Helmet><title>Document Intelligence Engine — HomeOS</title></Helmet>
      <div className="max-w-7xl mx-auto pb-20">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '28px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '10px' }}>
            <Link to="/documents" className="hover:text-slate-600">Documents</Link>
            <ChevronRight style={{ width: '13px', height: '13px' }} />
            <span className="text-slate-700 font-medium">Intelligence Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles style={{ width: '24px', height: '24px', color: '#7c3aed' }} />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900" style={{ fontSize: '26px' }}>Document Intelligence Engine</h1>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Auto-classify · Extract key fields · Detect expirations · Suggest tags</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Upload + Doc list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Upload zone */}
            <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={() => setDragOver(false)}
              style={{ borderRadius: '12px', border: `2px dashed ${dragOver ? '#7c3aed' : '#e2e8f0'}`, background: dragOver ? '#f5f3ff' : 'white', padding: '24px', textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer' }}>
              <Upload style={{ width: '28px', height: '28px', color: '#7c3aed', margin: '0 auto 8px' }} />
              <p className="font-semibold text-slate-700" style={{ fontSize: '14px', marginBottom: '4px' }}>Drop documents here</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>PDF, JPG, PNG · Auto-classified instantly</p>
              <button style={{ marginTop: '12px', padding: '7px 16px', borderRadius: '8px', background: '#7c3aed', color: 'white', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                Browse Files
              </button>
            </div>

            {/* Document list */}
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <p className="font-semibold text-slate-700" style={{ fontSize: '13px' }}>Scanned Documents ({SCANNED_DOCS.length})</p>
              </div>
              {SCANNED_DOCS.map(doc => {
                const dt = DOC_TYPES.find(t => t.key === doc.type);
                const Icon = dt?.icon || FileText;
                return (
                  <button key={doc.id} onClick={() => setSelected(doc)} className="w-full flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
                    style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', background: selected?.id === doc.id ? '#f8fafc' : 'white', border: 'none', cursor: 'pointer' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: dt?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ width: '16px', height: '16px', color: dt?.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate" style={{ fontSize: '13px' }}>{doc.name}</p>
                      <div className="flex items-center gap-2">
                        {doc.status === 'processing' ? (
                          <span style={{ fontSize: '11px', color: '#d97706' }}>Processing…</span>
                        ) : (
                          <>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{dt?.label}</span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: CONFIDENCE_COLOR(doc.confidence) }}>{doc.confidence}%</span>
                          </>
                        )}
                      </div>
                    </div>
                    {selected?.id === doc.id && <ChevronRight style={{ width: '14px', height: '14px', color: '#94a3b8', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Extraction summary */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selected && (
              <>
                {/* Document header */}
                <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: typeInfo?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText style={{ width: '20px', height: '20px', color: typeInfo?.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>{selected.name}</p>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '12px', fontWeight: 600, color: typeInfo?.color, background: typeInfo?.bg, padding: '1px 7px', borderRadius: '999px' }}>{typeInfo?.label}</span>
                          {selected.confidence && (
                            <span style={{ fontSize: '12px', fontWeight: 600, color: CONFIDENCE_COLOR(selected.confidence) }}>{selected.confidence}% confidence</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button style={{ width: '34px', height: '34px', borderRadius: '9px', border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Eye style={{ width: '15px', height: '15px', color: '#64748b' }} />
                      </button>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  {selected.confidence && (
                    <div>
                      <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Extraction Confidence</p>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: CONFIDENCE_COLOR(selected.confidence) }}>{selected.confidence}%</p>
                      </div>
                      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${selected.confidence}%`, background: CONFIDENCE_COLOR(selected.confidence), borderRadius: '999px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Processing state */}
                {selected.status === 'processing' && (
                  <div className="bg-white text-center" style={{ borderRadius: '12px', border: '1px solid #fde68a', background: '#fffbeb', padding: '32px' }}>
                    <div className="flex items-center justify-center gap-2" style={{ marginBottom: '8px' }}>
                      <Sparkles style={{ width: '20px', height: '20px', color: '#d97706' }} />
                      <p className="font-semibold text-amber-700" style={{ fontSize: '16px' }}>Analyzing document…</p>
                    </div>
                    <p style={{ fontSize: '13px', color: '#d97706' }}>Classifying type, extracting key fields, detecting expiration dates.</p>
                  </div>
                )}

                {/* Extracted fields */}
                {selected.extracted && (
                  <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                    <p className="font-semibold text-slate-700" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Extracted Information</p>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selected.extracted).filter(([k, v]) => v).map(([key, value]) => (
                        <div key={key} style={{ padding: '10px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="font-semibold text-slate-800" style={{ fontSize: '13px' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {selected.alerts?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selected.alerts.map((alert, i) => (
                      <div key={i} className="flex items-start gap-3" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 14px' }}>
                        <AlertTriangle style={{ width: '15px', height: '15px', color: '#d97706', flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ fontSize: '13px', color: '#92400e' }}>{alert.msg}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested tags */}
                {selected.tags?.length > 0 && (
                  <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px' }}>
                    <p className="font-semibold text-slate-700" style={{ fontSize: '13px', marginBottom: '10px' }}>Suggested Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.tags.map((tag, i) => (
                        <span key={i} style={{ fontSize: '12px', fontWeight: 600, color: '#1e3a5f', background: '#eef2f8', padding: '4px 10px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Tag style={{ width: '11px', height: '11px' }} /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Auto timeline event */}
                {selected.timelineEvent && (
                  <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #a7f3d0', padding: '14px 18px', background: '#ecfdf5' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity style={{ width: '15px', height: '15px', color: '#059669' }} />
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#065f46' }}>Timeline event auto-detected</p>
                      </div>
                      <button style={{ fontSize: '12px', fontWeight: 600, color: '#059669', background: 'none', border: 'none', cursor: 'pointer' }}>Add to Timeline →</button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#064e3b', marginTop: '4px', marginLeft: '22px' }}>
                      "{selected.timelineEvent.title}" — {selected.timelineEvent.date}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default DocumentIntelligencePage;
