import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

const PropertyPhotosGallery = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!currentUser) return;
      try {
        const records = await pb.collection('properties').getList(1, 50, {
          filter: `ownerId = "${currentUser.id}" && photo != ""`,
          $autoCancel: false
        });
        setPhotos(records.items);
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [currentUser]);

  const handleUpload = () => {
    toast({ title: "Upload Photos", description: "🚧 This feature isn't implemented yet!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Property Gallery</h3>
        <Button onClick={handleUpload}>
          <Upload className="w-4 h-4 mr-2" /> Upload Photos
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : photos.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-slate-50 rounded-xl border border-dashed">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No photos available.</p>
          </div>
        ) : (
          photos.map(prop => (
            <div key={prop.id} className="relative group rounded-xl overflow-hidden h-48 bg-slate-100">
              <img 
                src={pb.files.getUrl(prop, prop.photo)} 
                alt={prop.address} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-white text-sm font-medium truncate">{prop.address}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertyPhotosGallery;