import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Building2, Loader2, MapPin } from 'lucide-react';

const PropertySelector = ({ selectedPropertyId, onSelectProperty }) => {
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!currentUser) return;
      try {
        setIsLoading(true);
        const records = await pb.collection('properties').getFullList({
          filter: `ownerId="${currentUser.id}"`,
          sort: '-created',
          $autoCancel: false
        });
        setProperties(records);
        
        if (records.length > 0 && !selectedPropertyId) {
          onSelectProperty(records[0].id);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [currentUser, selectedPropertyId, onSelectProperty]);

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-interactive hover:shadow-md">
      <div className="bg-primary/10 p-2.5 rounded-xl">
        <Building2 className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-[220px]">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wider">Active Property</p>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading properties...
          </div>
        ) : (
          <Select value={selectedPropertyId || ''} onValueChange={onSelectProperty}>
            <SelectTrigger className="h-7 border-0 p-0 focus:ring-0 shadow-none font-bold text-slate-900 dark:text-slate-100 bg-transparent text-base">
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-xl border-slate-200 dark:border-slate-800">
              {properties.length === 0 ? (
                <SelectItem value="none" disabled>No properties found</SelectItem>
              ) : (
                properties.map((prop) => (
                  <SelectItem key={prop.id} value={prop.id} className="cursor-pointer rounded-lg my-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{prop.address}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default PropertySelector;