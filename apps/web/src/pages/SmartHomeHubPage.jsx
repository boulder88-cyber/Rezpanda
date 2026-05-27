import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Wifi, Thermometer, Shield, Zap, Droplets, Bell, Settings, ChevronRight, Plus, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const DEVICES = [
  { id: 1, name: 'Nest Thermostat', brand: 'Google Nest', type: 'thermostat', icon: Thermometer, connected: true, color: '#059669', bg: '#ecfdf5', status: 'Online', value: '74°F', sub: 'Cooling · Target 72°F' },
  { id: 2, name: 'Ring Doorbell Pro', brand: 'Ring', type: 'security', icon: Shield, connected: true, color: '#1e3a5f', bg: '#eef2f8', status: 'Online', value: 'Active', sub: 'Motion: 2 events today' },
  { id: 3, name: 'Ecobee Smart Sensor', brand: 'Ecobee', type: 'sensor', icon: Thermometer, connected: true, color: '#7c3aed', bg: '#f5f3ff', status: 'Online', value: '71°F', sub: 'Bedroom · Humidity: 48%' },
  { id: 4, name: 'Smart Meter', brand: 'Georgia Power', type: 'energy', icon: Zap, connected: true, color: '#d97706', bg: '#fffbeb', status: 'Online', value: '42 kWh', sub: 'Today · 12% below avg' },
  { id: 5, name: 'Leak Detector (Kitchen)', brand: 'Moen Flo', type: 'leak', icon: Droplets, connected: true, color: '#0891b2', bg: '#ecfeff', status: 'Online', value: 'No Leak', sub: 'Last check: 2 min ago' },
  { id: 6, name: 'Garage Door Sensor', brand: 'Chamberlain', type: 'security', icon: Shield, connected: false, color: '#94a3b8', bg: '#f8fafc', status: 'Offline', value: '—', sub: 'Check connection' },
];

const ALERTS = [
  { id: 1, device: 'Ring Doorbell Pro', msg: 'Motion detected at front door', time: '10 min ago', severity: 'info' },
  { id: 2, device: 'Smart Meter', msg: 'Energy usage below average — great job!', time: '1 hour ago', severity: 'success' },
  { id: 3, device: 'Garage Door Sensor', msg: 'Device offline — check Wi-Fi connection', time: '2 hours ago', severity: 'warning' },
];

const SmartHomeHubPage = () => {
  const online = DEVICES.filter(d => d.connected).length;

  return (
    <>
      <Helmet><title>Smart Home Hub — HomeOS</title></Helmet>
      <div className="max-w-6xl mx-auto pb-20">
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '28px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '10px' }}>
            <Link to="/dashboard" className="hover:text-slate-600">Dashboard</Link>
            <ChevronRight style={{ width: '13px', height: '13px' }} />
            <span className="text-slate-700 font-medium">Smart Home Hub</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wifi style={{ width: '24px', height: '24px', color: '#0891b2' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '26px' }}>Smart Home Hub</h1>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>{online}/{DEVICES.length} devices online · Auto-syncing</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '13px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                <RefreshCw style={{ width: '14px', height: '14px' }} /> Sync
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', background: '#1e3a5f', color: 'white', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                <Plus style={{ width: '15px', height: '15px' }} /> Add Device
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '24px' }}>
          {[
            { label: 'Online', value: online, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
            { label: 'Offline', value: DEVICES.length - online, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
            { label: 'Alerts Today', value: ALERTS.length, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          ].map((s, i) => (
            <div key={i} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${s.border}`, padding: '14px 16px' }}>
              <p style={{ fontSize: '24px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', marginTop: '4px' }}>Devices {s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device tiles */}
          <div className="lg:col-span-2">
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Connected Devices</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEVICES.map(device => {
                const Icon = device.icon;
                return (
                  <div key={device.id} className="bg-white" style={{ borderRadius: '12px', border: `1px solid ${device.connected ? '#e2e8f0' : '#fecaca'}`, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-start justify-between" style={{ marginBottom: '10px' }}>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: device.connected ? device.bg : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon style={{ width: '18px', height: '18px', color: device.connected ? device.color : '#ef4444' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{device.name}</p>
                          <p style={{ fontSize: '11px', color: '#94a3b8' }}>{device.brand}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: device.connected ? '#059669' : '#ef4444' }} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: device.connected ? '#059669' : '#ef4444' }}>{device.status}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', lineHeight: 1, marginBottom: '3px' }}>{device.value}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>{device.sub}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alert feed */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Alert Feed</p>
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {ALERTS.map((alert, i) => {
                const colors = { info: ['#eef2f8', '#1e3a5f'], success: ['#ecfdf5', '#059669'], warning: ['#fffbeb', '#d97706'] };
                const [bg, color] = colors[alert.severity];
                return (
                  <div key={alert.id} style={{ padding: '14px 16px', borderBottom: i < ALERTS.length - 1 ? '1px solid #f8fafc' : 'none', background: bg }}>
                    <div className="flex items-start gap-2">
                      <Bell style={{ width: '14px', height: '14px', color, flexShrink: 0, marginTop: '1px' }} />
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{alert.device}</p>
                        <p style={{ fontSize: '12px', color: '#475569', marginTop: '1px' }}>{alert.msg}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{alert.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '16px', padding: '14px 16px', borderRadius: '12px', background: '#eef2f8', border: '1px solid #c7d7eb' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e3a5f', marginBottom: '4px' }}>Integration Settings</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Connect Nest, Ring, Ecobee, and smart meters through your HomeOS settings.</p>
              <button style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#1e3a5f', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Settings style={{ width: '13px', height: '13px' }} /> Open Integration Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SmartHomeHubPage;
