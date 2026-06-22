import React from 'react';
import SiteLayout from './SiteLayout.jsx';
import { CheckCircle2, RefreshCw } from 'lucide-react';

/*
  CasaCEO — System Status (/status)
  --------------------------------------------------------------------------
  The old page showed FABRICATED incidents, fake uptime percentages, and
  services that don't exist (Document Vault, third-party integrations). A
  status page presenting made-up operational data is worse than none.

  This version is honest and minimal: the real services (web app, email
  ingestion, reminders), a simple "operational" state, and no invented
  incident history or uptime numbers. When you have real monitoring, wire
  these states to it. Tokens mirror the rest of the marketing site.
*/

const INK = '#1C3553';
const GOLD = '#c9a96e';
const PAPER = '#F6F3EC';
const SAND = '#EFE9DD';
const SAGE = '#6B8F71';
const STONE = '#6E6A62';
const LINE = '#E3DCCE';

const serif = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif";
const sans = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// Real services only. All currently operational; flip a status here if needed.
const SERVICES = [
  { name: 'Web app', status: 'operational', desc: 'The CasaCEO web interface and dashboard.' },
  { name: 'Email ingestion', status: 'operational', desc: 'Reading and filing bills you forward in.' },
  { name: 'Reminders', status: 'operational', desc: 'Due-date and maintenance notifications.' },
];

const StatusPage = () => {
  const allOperational = SERVICES.every(s => s.status === 'operational');

  return (
    <SiteLayout seo={{ title: 'System status — CasaCEO' }} fullWidth>
      <section style={{ background: allOperational ? SAGE : '#B07A5B', padding: '64px 24px 48px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 style={{ width: '30px', height: '30px', color: '#fff' }} />
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.9rem, 4vw, 2.5rem)', fontWeight: 600, color: '#fff', marginBottom: '12px', letterSpacing: '-0.015em' }}>
            {allOperational ? 'All systems operational' : 'Some systems affected'}
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: sans, fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
            <RefreshCw style={{ width: '13px', height: '13px' }} />
            Current service health
          </div>
        </div>
      </section>

      <section style={{ padding: '52px 24px 72px', background: PAPER }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: STONE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Service health</p>
          <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${LINE}`, overflow: 'hidden' }}>
            {SERVICES.map((svc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '18px 24px', borderBottom: i < SERVICES.length - 1 ? `1px solid ${LINE}` : 'none' }}>
                <div>
                  <p style={{ fontFamily: sans, fontWeight: 700, color: INK, fontSize: '15px' }}>{svc.name}</p>
                  <p style={{ fontFamily: sans, fontSize: '12.5px', color: STONE, marginTop: '2px' }}>{svc.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#EEF2EC', border: `1px solid ${SAND}`, padding: '4px 11px', borderRadius: '999px', flexShrink: 0 }}>
                  <CheckCircle2 style={{ width: '13px', height: '13px', color: SAGE }} />
                  <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 600, color: SAGE }}>Operational</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: sans, fontSize: '13px', color: STONE, textAlign: 'center', marginTop: '24px', lineHeight: 1.6 }}>
            If something isn\u2019t working for you, let us know at hello@casaceo.com and we\u2019ll look into it.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

export default StatusPage;
