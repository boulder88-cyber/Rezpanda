import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { CheckCircle2, AlertCircle, XCircle, RefreshCw, Clock, Server } from 'lucide-react';

const useFadeIn = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.06 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
};

const FadeIn = ({ children, delay = 0 }) => {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(14px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

// ── Static data ──────────────────────────────────────────────────────

const OVERALL_STATUS = 'operational'; // 'operational' | 'partial' | 'outage'

const SERVICES = [
  { name: 'Web Application', status: 'operational', lastUpdated: '2 minutes ago', desc: 'Main HomeOS web interface and dashboard.' },
  { name: 'API', status: 'operational', lastUpdated: '2 minutes ago', desc: 'Platform API endpoints and data services.' },
  { name: 'Document Vault', status: 'operational', lastUpdated: '5 minutes ago', desc: 'Encrypted document storage and retrieval.' },
  { name: 'Notifications', status: 'operational', lastUpdated: '2 minutes ago', desc: 'Email alerts, reminders, and push notifications.' },
  { name: 'Integrations', status: 'operational', lastUpdated: '10 minutes ago', desc: 'Third-party service connections and data syncs.' },
];

const INCIDENTS = [
  {
    date: 'May 15, 2026',
    title: 'Document Vault Slow Response',
    status: 'Resolved',
    description: 'Some users experienced slow document upload and retrieval times.',
    resolution: 'Root cause identified as a storage node rebalancing operation. Performance restored to normal after 23 minutes.',
    duration: '23 minutes',
  },
  {
    date: 'April 3, 2026',
    title: 'Scheduled Maintenance — API Updates',
    status: 'Completed',
    description: 'Planned maintenance window for API infrastructure upgrades.',
    resolution: 'Maintenance completed successfully. All services restored ahead of schedule.',
    duration: '45 minutes',
  },
  {
    date: 'March 18, 2026',
    title: 'Notification Delivery Delay',
    status: 'Resolved',
    description: 'Email notifications were delayed by 15–45 minutes for some users.',
    resolution: 'Queue backlog cleared. Delivery returned to normal. No notifications were lost.',
    duration: '31 minutes',
  },
];

const UPTIME = [
  { label: '24 Hours', value: '100.0%', color: '#059669' },
  { label: '7 Days', value: '99.97%', color: '#059669' },
  { label: '30 Days', value: '99.94%', color: '#059669' },
];

const STATUS_CONFIG = {
  operational: { icon: CheckCircle2, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: 'Operational' },
  partial: { icon: AlertCircle, color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Partial Outage' },
  outage: { icon: XCircle, color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Major Outage' },
};

const OVERALL_CONFIG = {
  operational: { bg: '#059669', label: 'All Systems Operational', icon: CheckCircle2 },
  partial: { bg: '#d97706', label: 'Partial Outage', icon: AlertCircle },
  outage: { bg: '#dc2626', label: 'Major Outage', icon: XCircle },
};

const StatusPage = () => {
  const overall = OVERALL_CONFIG[OVERALL_STATUS];
  const OverallIcon = overall.icon;

  return (
    <>
      <Helmet><title>System Status — HomeOS</title></Helmet>
      <div className="min-h-screen bg-white overflow-x-hidden">

        {/* Hero */}
        <section style={{ background: overall.bg, padding: '64px 32px 48px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="flex items-center justify-center" style={{ marginBottom: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <OverallIcon style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
            </div>
            <h1 className="font-semibold text-white" style={{ fontSize: '40px', lineHeight: '1.15', marginBottom: '12px' }}>
              {overall.label}
            </h1>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.75)', marginBottom: '16px' }}>
              Real-time uptime and service health for HomeOS.
            </p>
            <div className="flex items-center justify-center gap-2" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
              <RefreshCw style={{ width: '13px', height: '13px' }} />
              Last updated: just now · Auto-refreshes every 60 seconds
            </div>
          </div>
        </section>

        <section style={{ padding: '48px 32px', background: '#f8fafc' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Uptime metrics */}
            <FadeIn>
              <div className="grid grid-cols-3 gap-4">
                {UPTIME.map((u, i) => (
                  <div key={i} className="bg-white text-center" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <p className="font-extrabold" style={{ fontSize: '28px', lineHeight: 1, color: u.color }}>{u.value}</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>{u.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Service list */}
            <FadeIn delay={80}>
              <div>
                <p className="font-semibold text-slate-500 uppercase tracking-widest" style={{ fontSize: '12px', marginBottom: '14px', letterSpacing: '0.12em' }}>Service Health</p>
                <div className="bg-white" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  {SERVICES.map((svc, i) => {
                    const cfg = STATUS_CONFIG[svc.status];
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className="flex items-center justify-between" style={{ padding: '16px 24px', borderBottom: i < SERVICES.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <div className="flex items-start gap-3">
                          <Server style={{ width: '16px', height: '16px', color: '#94a3b8', flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <p className="font-semibold text-slate-800" style={{ fontSize: '15px' }}>{svc.name}</p>
                            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{svc.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center gap-1.5" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '4px 10px', borderRadius: '999px' }}>
                            <Icon style={{ width: '13px', height: '13px', color: cfg.color }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400" style={{ fontSize: '11px' }}>
                            <Clock style={{ width: '11px', height: '11px' }} />
                            {svc.lastUpdated}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>

            {/* Incident history */}
            <FadeIn delay={160}>
              <div>
                <p className="font-semibold text-slate-500 uppercase tracking-widest" style={{ fontSize: '12px', marginBottom: '14px', letterSpacing: '0.12em' }}>Incident History</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {INCIDENTS.map((inc, i) => (
                    <div key={i} className="bg-white" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                      <div className="flex items-start justify-between gap-4 flex-wrap" style={{ marginBottom: '10px' }}>
                        <div>
                          <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{inc.date}</span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '1px 7px', borderRadius: '999px' }}>{inc.status}</span>
                          </div>
                          <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{inc.title}</p>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 flex-shrink-0" style={{ fontSize: '12px' }}>
                          <Clock style={{ width: '12px', height: '12px' }} />
                          {inc.duration}
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '8px' }}>{inc.description}</p>
                      <p style={{ fontSize: '13px', color: '#059669', lineHeight: '1.6' }}>
                        <span style={{ fontWeight: 600 }}>Resolution: </span>{inc.resolution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

          </div>
        </section>

      </div>
    </>
  );
};

export default StatusPage;
