import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Users, Plus, X, ChevronRight, Shield, Eye, Edit2, Crown, Send, CheckCircle2, Clock } from 'lucide-react';

const ROLES = [
  { key: 'owner', label: 'Owner', icon: Crown, color: '#d97706', bg: '#fffbeb', desc: 'Full access — edit, invite, delete' },
  { key: 'editor', label: 'Editor', icon: Edit2, color: '#2563eb', bg: '#eff6ff', desc: 'Can edit data, upload documents' },
  { key: 'viewer', label: 'Viewer', icon: Eye, color: '#7c3aed', bg: '#f5f3ff', desc: 'Read-only access to home data' },
];

const USERS = [
  { id: 1, name: 'Dan (You)', email: 'dan@casaceo.com', role: 'owner', avatar: 'D', joinedDate: '2024-01-15', lastActive: 'Just now' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'editor', avatar: 'SJ', joinedDate: '2025-03-20', lastActive: '2 days ago' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@email.com', role: 'viewer', avatar: 'MJ', joinedDate: '2025-03-20', lastActive: '1 week ago' },
];

const ACTIVITY_LOG = [
  { user: 'Sarah Johnson', action: 'Uploaded insurance policy document', time: '2 hours ago' },
  { user: 'Dan (You)', action: 'Updated maintenance task — HVAC service', time: '1 day ago' },
  { user: 'Mike Johnson', action: 'Viewed home valuation dashboard', time: '1 week ago' },
  { user: 'Sarah Johnson', action: 'Added utility provider — Georgia Power', time: '2 weeks ago' },
];

const SharedAccessPage = () => {
  const [users] = useState(USERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'editor' });
  const [sent, setSent] = useState(false);

  return (
    <>
      <Helmet><title>Shared Access — HomeOS</title></Helmet>
      <div className="max-w-5xl mx-auto pb-20">
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '28px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '10px' }}>
            <Link to="/home-profile" className="hover:text-slate-600">Home Profile</Link>
            <ChevronRight style={{ width: '13px', height: '13px' }} />
            <span className="text-slate-700 font-medium">Shared Access</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users style={{ width: '24px', height: '24px', color: '#059669' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '26px' }}>Shared Access</h1>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>Invite collaborators and manage permissions</p>
              </div>
            </div>
            <button onClick={() => setShowInvite(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', background: '#1e3a5f', color: 'white', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              <Plus style={{ width: '15px', height: '15px' }} /> Invite User
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Role definitions */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Permission Levels</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {ROLES.map(role => {
                const Icon = role.icon;
                return (
                  <div key={role.key} className="bg-white flex items-start gap-3" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: role.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ width: '17px', height: '17px', color: role.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900" style={{ fontSize: '14px' }}>{role.label}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{role.desc}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, color: role.color, background: role.bg, padding: '2px 8px', borderRadius: '999px', flexShrink: 0 }}>{role.key}</span>
                  </div>
                );
              })}
            </div>

            {/* User list */}
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Active Users ({users.length})</p>
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {users.map((user, i) => {
                const roleInfo = ROLES.find(r => r.key === user.role);
                const RoleIcon = roleInfo?.icon || Shield;
                return (
                  <div key={user.id} className="flex items-center gap-3" style={{ padding: '14px 16px', borderBottom: i < users.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div className="flex items-center justify-center font-bold text-white flex-shrink-0" style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1e3a5f', fontSize: '13px' }}>
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800" style={{ fontSize: '14px' }}>{user.name}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span style={{ fontSize: '11px', fontWeight: 700, color: roleInfo?.color, background: roleInfo?.bg, padding: '2px 8px', borderRadius: '999px', display: 'block', marginBottom: '3px' }}>{user.role}</span>
                      <p style={{ fontSize: '11px', color: '#94a3b8' }}>{user.lastActive}</p>
                    </div>
                    {user.role !== 'owner' && (
                      <button style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#fef2f2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}>
                        <X style={{ width: '12px', height: '12px', color: '#f87171' }} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity log */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Activity Log</p>
            <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {ACTIVITY_LOG.map((entry, i) => (
                <div key={i} className="flex items-start gap-3" style={{ padding: '14px 16px', borderBottom: i < ACTIVITY_LOG.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e3a5f', flexShrink: 0, marginTop: '5px' }} />
                  <div>
                    <p style={{ fontSize: '13px', color: '#334155' }}>
                      <span style={{ fontWeight: 600 }}>{entry.user}</span> {entry.action}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invite modal */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowInvite(false)}>
            <div className="bg-white w-full max-w-sm" style={{ borderRadius: '16px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
              <div style={{ background: '#1e3a5f', borderRadius: '16px 16px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p className="font-semibold text-white" style={{ fontSize: '15px' }}>Invite a Collaborator</p>
                <button onClick={() => { setShowInvite(false); setSent(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X style={{ width: '15px', height: '15px', color: 'rgba(255,255,255,0.6)' }} />
                </button>
              </div>
              <div style={{ padding: '20px' }}>
                {sent ? (
                  <div className="text-center" style={{ padding: '20px 0' }}>
                    <CheckCircle2 style={{ width: '36px', height: '36px', color: '#059669', margin: '0 auto 10px' }} />
                    <p className="font-semibold text-slate-900" style={{ fontSize: '16px' }}>Invite sent!</p>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>They'll receive an email with access instructions.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '5px' }}>Email Address</label>
                      <input value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} placeholder="name@email.com"
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>Permission Level</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {ROLES.filter(r => r.key !== 'owner').map(role => (
                          <button key={role.key} onClick={() => setInviteForm(p => ({ ...p, role: role.key }))}
                            style={{ flex: 1, padding: '8px', borderRadius: '9px', border: `2px solid ${inviteForm.role === role.key ? role.color : '#e2e8f0'}`, background: inviteForm.role === role.key ? role.bg : 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: role.color }}>
                            {role.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => inviteForm.email && setSent(true)} style={{ width: '100%', height: '40px', borderRadius: '10px', background: '#1e3a5f', color: 'white', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Send style={{ width: '14px', height: '14px' }} /> Send Invite
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SharedAccessPage;
