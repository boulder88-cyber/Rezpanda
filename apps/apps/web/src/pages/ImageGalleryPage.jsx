import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, AlertCircle, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

const beachImages = [
  // Beachfront homes and coastal houses
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1636775661248-1838f1c6097c',
    title: 'Beachfront Home with Ocean View',
    category: 'Beachfront & Coastal'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1587989682312-e72b1f2c300b',
    title: 'Classic Coastal House',
    category: 'Beachfront & Coastal'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1484673277797-78561dd2c1af',
    title: 'Serene Beachfront Property',
    category: 'Beachfront & Coastal'
  },
  // Modern beach villas with luxury ocean views
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1663601982929-51e28aab0444',
    title: 'Modern Beach Villa',
    category: 'Modern Villas'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1580364545803-ab1e5ca8673a',
    title: 'Luxury Beach Villa',
    category: 'Modern Villas'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1469084851673-dff81b8f4d50',
    title: 'Villa with Panoramic Ocean View',
    category: 'Modern Villas'
  },
  // Luxury beach properties and waterfront homes
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1593321706583-6a76bdbee0f1',
    title: 'Luxury Waterfront Estate',
    category: 'Luxury Properties'
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1563271978-de56ca503913',
    title: 'Exclusive Beach Property',
    category: 'Luxury Properties'
  },
  // Coastal residential architecture and beach house design
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1675096416494-3f676e913450',
    title: 'Coastal Architecture',
    category: 'Architecture & Design'
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1651024954895-8662577bf5ae',
    title: 'Contemporary Beach House Design',
    category: 'Architecture & Design'
  },
  // Beach house interiors and modern coastal living spaces
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1582722702410-36bc2101a501',
    title: 'Bright Beach House Interior',
    category: 'Interiors'
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1684501986794-5f9494557ba9',
    title: 'Modern Coastal Living Space',
    category: 'Interiors'
  },
  // Waterfront properties and seaside homes
  {
    id: 13,
    url: 'https://images.unsplash.com/photo-1691300412959-50eb5fc17870',
    title: 'Tranquil Waterfront Property',
    category: 'Waterfront & Seaside'
  },
  {
    id: 14,
    url: 'https://images.unsplash.com/photo-1606030689001-3ee5ac74e3bf',
    title: 'Charming Seaside Home',
    category: 'Waterfront & Seaside'
  },
  // Contemporary coastal homes and modern beach architecture
  {
    id: 15,
    url: 'https://images.unsplash.com/photo-1688899862813-3e039c407714',
    title: 'Contemporary Coastal Home',
    category: 'Contemporary'
  },
  // Beach community resort-style properties
  {
    id: 16,
    url: 'https://images.unsplash.com/photo-1642545135253-e494f0e5de47',
    title: 'Resort-Style Beach Community',
    category: 'Resort Style'
  }
];

// Helper to add Unsplash optimization params
const getOptimizedUrl = (url, width = 800, quality = 80) => {
  return `${url}?auto=format&fit=crop&w=${width}&q=${quality}`;
};

const ImageCard = ({ image, index, onClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col h-full"
      onClick={() => !hasError && onClick(index)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 z-10">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
        
        {hasError ? (
          <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center w-full h-full bg-slate-50 dark:bg-slate-800/50">
            <AlertCircle className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-600" />
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Image failed to load</span>
          </div>
        ) : (
          <>
            <img 
              src={getOptimizedUrl(image.url, 600, 75)} 
              alt={image.title} 
              className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-end p-4">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="inline-block px-2 py-1 bg-primary/90 text-white text-xs font-medium rounded mb-2 backdrop-blur-sm">
                  {image.category}
                </span>
                <h3 className="text-white font-medium text-sm line-clamp-2 drop-shadow-md">
                  {image.title}
                </h3>
              </div>
            </div>
            <div className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 text-white">
              <Maximize2 className="w-4 h-4" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Lightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  const [isLoading, setIsLoading] = useState(true);
  const image = images[currentIndex];

  // Reset loading state when image changes
  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (currentIndex === null) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center opacity-100 transition-opacity duration-300">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        aria-label="Close gallery"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Buttons */}
      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        aria-label="Next image"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Image Container */}
      <div 
        className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12"
        onClick={onClose} // Close when clicking outside image
      >
        <div 
          className="relative max-w-6xl w-full max-h-[80vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          <img 
            src={getOptimizedUrl(image.url, 1920, 90)} 
            alt={image.title}
            className={`max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Caption */}
        <div 
          className="absolute bottom-8 left-0 right-0 text-center px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="inline-block bg-black/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
            <span className="text-primary-300 text-sm font-medium tracking-wider uppercase mb-1 block text-blue-300">
              {image.category}
            </span>
            <h2 className="text-white text-xl md:text-2xl font-semibold">
              {image.title}
            </h2>
            <p className="text-white/60 text-sm mt-2">
              Image {currentIndex + 1} of {images.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageGalleryPage = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedIndex]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === beachImages.length - 1 ? 0 : prev + 1));
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? beachImages.length - 1 : prev - 1));
  }, []);

  return (
    <>
      <Helmet>
        <title>Coastal Properties Gallery - RezPanda</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 mb-8 transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <ImageIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Coastal Collection
                  </h1>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Explore our curated gallery of stunning beach homes, luxury waterfront villas, and contemporary coastal architecture. Click any image to view in full detail.
                </p>
              </div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                {beachImages.length} Properties
              </div>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {beachImages.map((image, index) => (
              <ImageCard 
                key={image.id} 
                image={image} 
                index={index}
                onClick={setSelectedIndex} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <Lightbox 
          images={beachImages}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </>
  );
};

export default ImageGalleryPage;