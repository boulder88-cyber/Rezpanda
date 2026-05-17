import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Bed, Bath, Square, MapPin, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import pb from '@/lib/horizonsBackend.js';

const PropertyDetailModal = ({ property, isOpen, onClose, onNext, onPrev }) => {
  if (!property) return null;

  const imageUrl = property.photo 
    ? pb.files.getUrl(property, property.photo) 
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white rounded-2xl">
        <div className="relative h-64 sm:h-80 w-full">
          <img src={imageUrl} alt={property.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
            <div>
              <Badge className="mb-2 bg-primary text-primary-foreground border-none">
                {property.propertyType || 'Property'}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                {property.name || 'Unnamed Property'}
              </h2>
            </div>
            {property.rentPrice && (
              <div className="text-right">
                <p className="text-white/80 text-sm font-medium">Rent Price</p>
                <p className="text-2xl font-bold text-white">${property.rentPrice}/mo</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-3 text-slate-600 mb-8">
            <MapPin className="w-5 h-5 mt-0.5 text-primary shrink-0" />
            <p className="text-lg">{property.address || 'No address provided'}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Bed className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-2xl font-bold text-slate-900">{property.bedrooms || 0}</span>
              <span className="text-sm text-slate-500">Bedrooms</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Bath className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-2xl font-bold text-slate-900">{property.bathrooms || 0}</span>
              <span className="text-sm text-slate-500">Bathrooms</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Square className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-2xl font-bold text-slate-900">{property.squareFootage || 0}</span>
              <span className="text-sm text-slate-500">Square Feet</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Home className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-lg font-bold text-slate-900 capitalize">{property.status || 'Available'}</span>
              <span className="text-sm text-slate-500">Status</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-100">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onPrev} disabled={!onPrev}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={onNext} disabled={!onNext}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <Button onClick={onClose}>Close Details</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailModal;