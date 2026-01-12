
import React from 'react';

interface ElixirBarProps {
  amount: number;
}

export const ElixirBar: React.FC<ElixirBarProps> = ({ amount }) => {
  // Clamp values for safety
  const safeAmount = Math.max(0, Math.min(10, amount));
  const current = Math.floor(safeAmount);
  const percentage = (safeAmount / 10) * 100;
  const isMax = safeAmount >= 10;

  return (
    <div className="w-full h-10 relative z-30 pointer-events-none flex items-end">
      {/* Background Bar */}
      <div className="absolute bottom-0 left-0 w-full h-8 bg-[#1a1a1a] border-t-2 border-[#3a3a3a] shadow-lg flex items-center px-2">
          {/* Spacer for the Drop Icon which floats */}
          <div className="w-10 shrink-0"></div>

          {/* Liquid Bar Container */}
          <div className="flex-1 h-4 bg-black/60 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
              
              {/* Liquid Fill */}
              <div 
                className={`h-full bg-gradient-to-b from-[#d946ef] to-[#9333ea] relative overflow-hidden ${isMax ? 'animate-pulse brightness-110' : ''}`}
                style={{ width: `${percentage}%` }}
              >
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full blur-[1px]"></div>
                  {/* Bubbles Pattern */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSI+PHBhdGggZD0iTTAgMTBMNDAgMTAiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] opacity-30 animate-[slide_1s_linear_infinite]"></div>
              </div>

              {/* Grid Lines (10 segments) */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-black/20 last:border-0"></div>
                ))}
              </div>
          </div>
          
          <div className="w-2"></div>
      </div>

      {/* Floating Elixir Drop Icon */}
      <div className="absolute left-2 bottom-0 w-12 h-16 z-40 flex items-center justify-center filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
         <svg viewBox="0 0 24 30" className="absolute w-full h-full fill-[#d946ef] stroke-[#581c87] stroke-[1.5]">
             <path d="M12 1 C12 1 2 13 2 20 C2 26 6 30 12 30 C18 30 22 26 22 20 C22 13 12 1 12 1 Z" />
         </svg>
         {/* Highlight */}
         <div className="absolute top-3 left-2.5 w-3 h-5 bg-white/30 rounded-full -rotate-12 blur-[1px]"></div>
         
         {/* Number Display */}
         <span className={`relative mt-4 font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] stroke-black ${isMax ? 'text-sm' : 'text-2xl'}`}>
            {isMax ? 'MAX' : current}
         </span>
      </div>
    </div>
  );
};
