import React, { useState } from 'react';
import { useHome } from '@/contexts/HomeContext.jsx';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import { Home, Plus, ChevronDown, Building, Layers, Pencil, Settings, Package } from 'lucide-react';
import PropertyFormModal from '@/components/PropertyFormModal.jsx';

const HomeSwitcher = () => {
  const { homes, selectedHome, allProperties, otherScope, switchHome, viewAllProperties, viewOther, refreshHomes } = useHome();

  // One modal, two modes. `editingHome` null → add mode; a home → edit mode.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHome, setEditingHome] = useState(null);

  const openAdd = () => { setEditingHome(null); setIsModalOpen(true); };
  const openEdit = (home) => { setEditingHome(home); setIsModalOpen(true); };

  const handleSaved = async (record) => {
    await refreshHomes();
    // After adding a new home, jump to it. After an edit, stay where we are.
    if (!editingHome && record) switchHome(record);
  };

  // What the trigger button shows.
  const triggerLabel = otherScope
    ? 'Other & unassigned'
    : allProperties
      ? 'All Properties'
      : (selectedHome ? (selectedHome.name || selectedHome.address) : 'Select a Property');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-between bg-white border-slate-200">
            <div className="flex items-center gap-2 truncate">
              {otherScope
                ? <Package className="w-4 h-4" style={{ color: '#1e3a5f' }} />
                : allProperties
                  ? <Layers className="w-4 h-4" style={{ color: '#1e3a5f' }} />
                  : <Home className="w-4 h-4" style={{ color: '#1e3a5f' }} />}
              <span className="truncate font-medium">{triggerLabel}</span>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[260px]">
          <DropdownMenuLabel>Your Portfolio</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* All Properties — only meaningful with more than one home */}
          {homes.length > 1 && (
            <>
              <DropdownMenuItem
                onClick={() => viewAllProperties()}
                className="cursor-pointer"
                style={allProperties ? { background: '#eef2f8', color: '#1e3a5f' } : undefined}
              >
                <Layers className="w-4 h-4 mr-2 opacity-70" />
                <div className="flex flex-col">
                  <span>All Properties</span>
                  <span className="text-xs opacity-70">See every property at once</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {homes.map((home) => {
            const isActive = !allProperties && !otherScope && selectedHome?.id === home.id;
            return (
              <div
                key={home.id}
                className="flex items-center"
                style={isActive ? { background: '#eef2f8', borderRadius: '6px' } : undefined}
              >
                <DropdownMenuItem
                  onClick={() => switchHome(home)}
                  className="cursor-pointer flex-1"
                  style={isActive ? { color: '#1e3a5f', background: 'transparent' } : undefined}
                >
                  <Building className="w-4 h-4 mr-2 opacity-70" />
                  <div className="flex flex-col">
                    <span>{home.name || home.address || 'Unnamed Property'}</span>
                    <span className="text-xs opacity-70 capitalize">{home.propertyType || 'Property'}</span>
                  </div>
                </DropdownMenuItem>
                {/* Edit this home — opens the modal in edit mode. */}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEdit(home); }}
                  className="p-2 mr-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  title="Edit this home"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          <DropdownMenuSeparator />
          {/* Other & unassigned — a scope, not a home. Bills not tied to any
              property (car, phone, subscriptions) plus anything still needing
              placement. Selectable like a destination; sets the global flag so
              Bill Pay filters to exactly these bills and the label reflects it. */}
          <DropdownMenuItem
            onClick={() => viewOther()}
            className="cursor-pointer"
            style={otherScope ? { background: '#eef2f8', color: '#1e3a5f' } : undefined}
          >
            <Package className="w-4 h-4 mr-2 opacity-70" />
            <div className="flex flex-col">
              <span>Other &amp; unassigned</span>
              <span className="text-xs opacity-70">Bills not tied to a property</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openAdd} className="cursor-pointer" style={{ color: '#1e3a5f' }}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Home
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer text-slate-500">
            <Link to="/manage-homes">
              <Settings className="w-4 h-4 mr-2" />
              Manage homes
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PropertyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSaved}
        initialData={editingHome}
      />
    </>
  );
};

export default HomeSwitcher;
