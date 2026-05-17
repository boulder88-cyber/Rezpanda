import React from 'react';

export const RezPandaLogo = ({ className, imageClassName }) => {
  return (
    <div className={`relative flex items-center justify-center group ${className || ''}`}>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.6)_0%,rgba(15,23,62,0.8)_60%,transparent_100%)] opacity-80 blur-2xl group-hover:opacity-100 transition-all duration-700 scale-125"></div>

      {/* Try CDN image first, fall back to SVG text logo */}
      <img
        src="https://horizons-cdn.hostinger.com/a255ec38-7902-457a-a9a3-5cc50d925142/922bbea3904b532bd6348d598d228621.png"
        alt="RezPanda"
        className={`relative z-10 w-[120px] md:w-[160px] lg:w-[200px] h-auto object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl mix-blend-screen ${imageClassName || ''}`}
        style={{
          WebkitMaskImage: 'radial-gradient(circle at center, black 25%, rgba(0,0,0,0.6) 55%, transparent 85%)',
          maskImage: 'radial-gradient(circle at center, black 25%, rgba(0,0,0,0.6) 55%, transparent 85%)'
        }}
        onError={(e) => {
          // Fallback: hide broken image, show SVG text logo
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />

      {/* SVG Fallback Logo — hidden by default, shown if image fails */}
      <div
        className="relative z-10 hidden items-center gap-2"
        style={{ display: 'none' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="10" fill="#2563EB"/>
          <path d="M10 28V12h8c2.2 0 4 .8 5.2 2.2 1.2 1.4 1.8 3 1.8 4.8 0 1.4-.4 2.7-1.1 3.8L28 28h-5l-3.5-4.5H15V28h-5zm5-8.5h2.8c.9 0 1.6-.3 2.1-.8.5-.5.8-1.2.8-2s-.3-1.5-.8-2c-.5-.5-1.2-.8-2.1-.8H15v5.6z" fill="white"/>
        </svg>
        <span className="text-white font-extrabold text-2xl tracking-tight">
          Rez<span className="text-blue-400">Panda</span>
        </span>
      </div>

      {/* Edge blend overlay */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,transparent_40%,rgba(15,23,62,0.5)_85%)] pointer-events-none mix-blend-overlay z-20"></div>
    </div>
  );
};

export default RezPandaLogo;
