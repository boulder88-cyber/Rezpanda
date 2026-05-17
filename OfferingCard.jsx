import React, { useState, useEffect, useRef } from 'react';
import pb from '@/lib/horizonsBackend.js';
import PropertyCard from '@/components/PropertyCard.jsx';
import PropertyDetailModal from '@/components/PropertyDetailModal.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useToast } from '@/hooks/use-toast.js';
import { AlertCircle, Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

const PAGE_SIZE = 50;

const PropertyGrid = ({ 
  filterType = 'My Properties',
  filters = {}, 
  selectedPropertyId, 
  onSelectProperty,
  onCountChange
}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const loadMoreRef = useRef(null);

  const fetchProperties = async (pageNum, isLoadMore = false) => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      // Use the correct owner field name (ownerId) as confirmed by the schema
      let filterString = `ownerId="${currentUser.id}"`;
      
      if (filterType !== 'My Properties' && filterType !== 'All Properties') {
        filterString += ` && status="${filterType.toLowerCase()}"`;
      }
      
      const records = await pb.collection('properties').getList(pageNum, PAGE_SIZE, {
        filter: filterString,
        sort: '-created',
        $autoCancel: false
      });
      
      if (isLoadMore) {
        setProperties(prev => [...prev, ...records.items]);
      } else {
        setProperties(records.items);
      }
      
      setTotalPages(records.totalPages);
      
      if (onCountChange && !isLoadMore) {
        onCountChange(records.totalItems);
      }
      
      if (records.totalItems === 1 && !selectedPropertyId && onSelectProperty && !isLoadMore) {
        onSelectProperty(records.items[0].id);
      }
      
      if (isLoadMore && loadMoreRef.current) {
        setTimeout(() => {
          loadMoreRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
      
    } catch (err) {
      console.error("PropertyGrid: Error fetching properties:", err);
      setError(err.message || "Failed to load properties. Please try again.");
      toast({
        title: "Fetch Error",
        description: "Could not load properties from the database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProperties(1, false);
  }, [currentUser, filterType]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProperties(nextPage, true);
    }
  };

  const handleDelete = async (property) => {
    if (!window.confirm(`Are you sure you want to delete ${property.name || property.address || 'this property'}?`)) return;
    
    const previousProperties = [...properties];
    const newProperties = properties.filter(p => p.id !== property.id);
    
    setProperties(newProperties);
    
    try {
      await pb.collection('properties').delete(property.id, { $autoCancel: false });
      toast({
        title: "Property Deleted",
        description: "The property has been successfully removed.",
      });
      fetchProperties(1, false);
      setPage(1);
      
      if (selectedPropertyId === property.id && onSelectProperty) {
        onSelectProperty(null);
      }
    } catch (err) {
      console.error("PropertyGrid: Error deleting property:", err);
      setProperties(previousProperties);
      toast({
        title: "Error",
        description: "Failed to delete property.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (property) => {
    toast({
      title: "Edit Mode",
      description: "🚧 Edit functionality isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="space-y-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-3 gap-4 pt-4">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button 
          onClick={() => fetchProperties(1, false)} 
          variant="outline"
          className="bg-white text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800"
        >
          Retry Loading
        </Button>
      </div>
    );
  }

  if (selectedPropertyId) {
    const selectedProp = properties.find(p => p.id === selectedPropertyId);
    if (selectedProp) {
      return (
        <PropertyDetailModal 
          property={selectedProp}
          isOpen={true}
          onClose={() => onSelectProperty && onSelectProperty(null)}
        />
      );
    }
  }

  const filteredProperties = properties.filter(p => {
    if (filters.search && !((p.address || '').toLowerCase().includes(filters.search.toLowerCase()) || (p.name || '').toLowerCase().includes(filters.search.toLowerCase()))) return false;
    if (filters.type && filters.type !== 'all' && p.propertyType !== filters.type) return false;
    if (filters.bedrooms && filters.bedrooms > 0 && (p.bedrooms || 0) < filters.bedrooms) return false;
    return true;
  });

  if (filteredProperties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-xl border border-slate-200 border-dashed shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No properties found</h3>
        <p className="text-slate-500 max-w-md mb-6">
          We couldn't find any properties matching your current filter ({filterType}). Try adjusting your search criteria or adding a new property.
        </p>
        <Button onClick={() => console.log("Add property clicked")} className="bg-blue-600 hover:bg-blue-700 text-white">
          Add Your First Property
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div key={property.id}>
            <PropertyCard 
              property={property} 
              onClick={() => onSelectProperty && onSelectProperty(property.id)}
              onView={() => onSelectProperty && onSelectProperty(property.id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
      
      {page < totalPages && (
        <div className="flex justify-center mt-10" ref={loadMoreRef}>
          <Button 
            onClick={handleLoadMore} 
            disabled={loadingMore}
            size="lg"
            className="min-w-[200px] rounded-full shadow-md hover:shadow-lg transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-600" />
                Loading more...
              </>
            ) : (
              'Load More Properties'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyGrid;