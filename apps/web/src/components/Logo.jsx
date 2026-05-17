import React from 'react';

export const CasaCEOLogo = ({ className, imageClassName }) => {
  return (
    <div className={`relative flex items-center justify-center group ${className || ''}`}>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.6)_0%,rgba(15,23,62,0.8)_60%,transparent_100%)] opacity-80 blur-2xl group-hover:opacity-100 transition-all duration-700 scale-125"></div>
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 3L3 9v10l11 6 11-6V9L14 3z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M14 3v16M3 9l11 6 11-6" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className={`text-white font-extrabold text-2xl tracking-tight leading-none ${imageClassName || ''}`}>
            Casa<span className="text-blue-400">CEO</span>
          </span>
          <span className="text-blue-300 text-xs font-medium tracking-widest uppercase">Property Command</span>
        </div>
      </div>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,transparent_40%,rgba(15,23,62,0.5)_85%)] pointer-events-none mix-blend-overlay z-20"></div>
    </div>
  );
};

// Keep RezPandaLogo as alias for backward compatibility
export const RezPandaLogo = CasaCEOLogo;

export default CasaCEOLogo;
