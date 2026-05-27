import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Hammer, Plus, ChevronRight, DollarSign, CheckCircle2,
  Clock, AlertCircle, Camera, Download, TrendingUp,
  MoreHorizontal, X, Edit2
} from 'lucide-react';

const PROJECTS = [
  {
    id: 1, name: 'Kitchen Remodel', status: 'in-progress', budget: 45000, spent: 28500,
    startDate: '2026-05-01', targetDate: '2026-07-15', roiEstimate: 72,
    tasks: [
      { id: 1, name: 'Demo existing cabinets', status: 'done' },
      { id: 2, name: 'Install new plumbing rough-in', status: 'done' },
      { id: 3, name: 'Cabinet installation', status: 'in-progress' },
      { id: 4, name: 'Countertop installation', status: 'todo' },
      { id: 5, name: 'Appliance installation', status: 'todo' },
      { id: 6, name: 'Final painting & trim', status: 'todo' },
    ],
    contractor: 'Golden Isles Renovation',
    photos: 3,
  },
  {
    id: 2, name: 'Master Bath Update', status: 'planned', budget: 28000, spent: 0,
    startDate: '2026-09-01', targetDate: '2026-10-30', roiEstimate: 71,
    tasks: [
      { id: 7, name: 'Design & material selection', status: 'todo' },
      { id: 8, name: 'Contractor bids', status: 'todo' },
      { id: 9, name: 'Demolition', status: 'todo' },
      { id: 10, name: 'Tile & fixtures', status: 'todo' },
    ],
    contractor: null, photos: 0,
  },
];

const STATUS_CONFIG = {
  'in-progress': { label: 'In Progress', color: '#2563eb', bg: '#eff6ff' },
  'planned': { label: 'Planned', color: '#7c3aed', bg: '#f5f3ff' },
  'completed': { label: 'Completed', color: '#059669', bg: '#ecfdf5' },
  'on-hold': { label: 'On Hold', color: '#94a3b8', bg: '#f8fafc' },
};

const TASK_CONFIG = {
  done: { label: 'Done', color: '#059669', icon: CheckCircle2 },
  'in-progress': { label: 'In Progress', color: '#2563eb', icon: Clock },
  todo: { label: 'To Do', color: '#94a3b8', icon: MoreHorizontal },
};

const ProjectCard = ({ project, onSelect, selected }) => {
  const status = STATUS_CONFIG[project.status];
  const doneTasks = project.tasks.filter(t => t.status === 'done').length;
  const progress = (doneTasks / project.tasks.length) * 100;
  const budgetPct = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;

  return (
    <button onClick={() => onSelect(project)} className="w-full text-left hover:shadow-md transition-all bg-white"
      style={{ borderRadius: '12px', border: `2px solid ${selected ? '#1e3a5f' : '#e2e8f0'}`, padding: '18px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="flex items-start justify-between" style={{ marginBottom: '10px' }}>
        <p className="font-semibold text-slate-900" style={{ fontSize: '15px' }}>{project.name}</p>
        <span style={{ fontSize: '11px', fontWeight: 700, color: status.color, background: status.bg, padding: '2px 8px', borderRadius: '999px' }}>{status.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '10px' }}>
        <div style={{ padding: '7px 10px', background: '#f8fafc', borderRadius: '8px' }}>
          <p style={{ fontSize: '10px', color: '#94a3b8' }}>Budget</p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>${(project.budget / 1000).toFixed(0)}K</p>
        </div>
        <div style={{ padding: '7px 10px', background: '#f8fafc', borderRadius: '8px' }}>
          <p style={{ fontSize: '10px', color: '#94a3b8' }}>Est. ROI</p>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>{project.roiEstimate}%</p>
        </div>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <div className="flex justify-between" style={{ marginBottom: '3px' }}>
          <p style={{ fontSize: '11px', color: '#94a3b8' }}>Tasks</p>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>{doneTasks}/{project.tasks.length}</p>
        </div>
        <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#1e3a5f', borderRadius: '999px' }} />
        </div>
      </div>
    </button>
  );
};

const RenovationPlannerPage = () => {
  const [projects] = useState(PROJECTS);
  const [selected, setSelected] = useState(PROJECTS[0]);

  const doneTasks = selected.tasks.filter(t => t.status === 'done').length;
  const progress = (doneTasks / selected.tasks.length) * 100;
  const budgetRemaining = selected.budget - selected.spent;

  return (
    <>
      <Helmet><title>Renovation Planner — HomeOS</title></Helmet>
      <div className="max-w-7xl mx-auto pb-20">
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ padding: '24px 32px', marginBottom: '28px' }}>
          <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: '13px', marginBottom: '10px' }}>
            <Link to="/home-profile" className="hover:text-slate-600">Home Profile</Link>
            <ChevronRight style={{ width: '13px', height: '13px' }} />
            <span className="text-slate-700 font-medium">Renovation Planner</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fdf0ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Hammer style={{ width: '24px', height: '24px', color: '#e8604c' }} />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900" style={{ fontSize: '26px' }}>Renovation Planner</h1>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>Budget · ROI · Tasks · Photos · Contractor coordination</p>
              </div>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', background: '#e8604c', color: 'white', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              <Plus style={{ width: '15px', height: '15px' }} /> New Project
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{projects.length} Projects</p>
            {projects.map(p => <ProjectCard key={p.id} project={p} onSelect={setSelected} selected={selected?.id === p.id} />)}
          </div>

          {/* Project detail */}
          {selected && (
            <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Budget tracker */}
              <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <p className="font-semibold text-slate-700" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Budget Tracker</p>
                <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '14px' }}>
                  {[
                    { label: 'Total Budget', value: `$${selected.budget.toLocaleString()}`, color: '#1e3a5f', bg: '#eef2f8' },
                    { label: 'Spent', value: `$${selected.spent.toLocaleString()}`, color: '#e8604c', bg: '#fdf0ee' },
                    { label: 'Remaining', value: `$${budgetRemaining.toLocaleString()}`, color: budgetRemaining > 0 ? '#059669' : '#dc2626', bg: budgetRemaining > 0 ? '#ecfdf5' : '#fef2f2' },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '12px', borderRadius: '10px', background: s.bg, textAlign: 'center' }}>
                      <p style={{ fontSize: '18px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(selected.spent / selected.budget) * 100}%`, background: '#e8604c', borderRadius: '999px' }} />
                </div>
                <div className="flex justify-between" style={{ marginTop: '4px' }}>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>${selected.spent.toLocaleString()} spent</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>${selected.budget.toLocaleString()} budget</p>
                </div>
              </div>

              {/* Task checklist */}
              <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
                  <p className="font-semibold text-slate-700" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Tasks — {doneTasks}/{selected.tasks.length} complete
                  </p>
                  <div style={{ height: '5px', width: '80px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: '#1e3a5f', borderRadius: '999px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selected.tasks.map(task => {
                    const tc = TASK_CONFIG[task.status];
                    const Icon = tc.icon;
                    return (
                      <div key={task.id} className="flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-colors" style={{ padding: '8px 12px' }}>
                        <Icon style={{ width: '16px', height: '16px', color: tc.color, flexShrink: 0 }} />
                        <p style={{ fontSize: '14px', color: task.status === 'done' ? '#94a3b8' : '#334155', textDecoration: task.status === 'done' ? 'line-through' : 'none', flex: 1 }}>
                          {task.name}
                        </p>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: tc.color }}>{tc.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ROI + Photos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', textAlign: 'center' }}>
                  <TrendingUp style={{ width: '24px', height: '24px', color: '#059669', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '28px', fontWeight: 800, color: '#059669', lineHeight: 1 }}>{selected.roiEstimate}%</p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Estimated ROI</p>
                </div>
                <div className="bg-white" style={{ borderRadius: '12px', border: '2px dashed #e2e8f0', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
                  <Camera style={{ width: '24px', height: '24px', color: '#94a3b8', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>{selected.photos} Photos</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Add before/after</p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RenovationPlannerPage;
