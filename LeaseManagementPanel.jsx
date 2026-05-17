import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { MapPin, Home, Bed, Bath, Square, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const PropertyOverviewCards = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!currentUser) return;
      try {
        const records = await pb.collection('properties').getList(1, 50, {
          filter: `ownerId = "${currentUser.id}"`,
          sort: '-created',
          $autoCancel: false
        });
        setProperties(records.items);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [currentUser]);

  const handleAction = (action) => {
    toast({
      title: action,
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map(property => (
        <Card key={property.id} className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
          <div className="h-40 bg-slate-100 relative">
            {property.photo ? (
              <img src={pb.files.getUrl(property, property.photo)} alt={property.address} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Home size={48} />
              </div>
            )}
            <Badge className="absolute top-3 right-3 capitalize" variant={property.status === 'occupied' ? 'default' : 'secondary'}>
              {property.status}
            </Badge>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-start gap-2">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span className="line-clamp-2">{property.address}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-slate-900">${property.rentPrice?.toLocaleString()}/mo</span>
              <span className="text-sm text-slate-500 capitalize">{property.propertyType}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <div className="flex flex-col items-center"><Bed className="w-4 h-4 mb-1" /> {property.bedrooms || 0}</div>
              <div className="flex flex-col items-center border-x border-slate-200"><Bath className="w-4 h-4 mb-1" /> {property.bathrooms || 0}</div>
              <div className="flex flex-col items-center"><Square className="w-4 h-4 mb-1" /> {property.squareFootage || 0}</div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-slate-50/50 pt-4 flex justify-between gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleAction('View Details')}>
              <Eye className="w-4 h-4 mr-2" /> View
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleAction('Edit Property')}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleAction('Delete Property')}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PropertyOverviewCards;