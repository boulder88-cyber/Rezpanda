import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Bed, Bath, Square, MapPin, Edit, Trash2, Eye, DollarSign } from 'lucide-react';
import pb from '@/lib/horizonsBackend.js';

const PropertyCard = ({ property, onView, onEdit, onDelete, onClick }) => {
  // Fallback values if schema fields are missing
  const imageUrl = property.photo 
    ? pb.files.getUrl(property, property.photo) 
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
  
  const status = property.status || 'available';
  const statusColors = {
    available: 'bg-green-100 text-green-800 hover:bg-green-200',
    occupied: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    vacant: 'bg-green-100 text-green-800 hover:bg-green-200',
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    sold: 'bg-red-100 text-red-800 hover:bg-red-200',
    maintenance: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
  };

  return (
    <Card 
      className="overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full border border-slate-200 hover:border-blue-300 cursor-pointer bg-white relative"
      onClick={() => onClick && onClick(property)}
    >
      <div className="relative h-52 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={property.name || property.address || 'Property'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-white/95 text-slate-900 hover:bg-white backdrop-blur-sm font-semibold shadow-sm capitalize">
            {property.propertyType || 'Property'}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={`${statusColors[status] || statusColors.available} font-bold shadow-sm border-none capitalize px-3 py-1`}>
            {status}
          </Badge>
        </div>
        
        {property.rentPrice && (
          <div className="absolute bottom-3 left-3 flex items-center text-white font-bold text-xl drop-shadow-md">
            <DollarSign className="w-5 h-5 mr-0.5" />
            {property.rentPrice.toLocaleString()}<span className="text-sm font-normal text-white/80 ml-1">/mo</span>
          </div>
        )}
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {property.name || 'Unnamed Property'}
        </h3>
        
        <div className="flex items-start gap-2 text-slate-500 mb-5">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
          <p className="text-sm line-clamp-2 leading-snug">{property.address || 'No address provided'}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 p-5">
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100 text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-transform">
              <Bed className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{property.bedrooms || 0} Beds</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100 text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-transform">
              <Bath className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{property.bathrooms || 0} Baths</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100 text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-transform">
              <Square className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{property.squareFootage || 0} sqft</span>
          </div>
        </div>
      </CardContent>

      <CardFooter 
        className="p-3 bg-white border-t border-slate-100 flex justify-between gap-2 z-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="ghost" size="sm" className="flex-1 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium" onClick={() => onView(property)}>
          <Eye className="w-4 h-4 mr-2" /> View Details
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="hover:bg-slate-100 text-slate-500 hover:text-slate-900 h-9 w-9" onClick={() => onEdit(property)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-red-50 text-slate-500 hover:text-red-600 h-9 w-9" onClick={() => onDelete(property)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;