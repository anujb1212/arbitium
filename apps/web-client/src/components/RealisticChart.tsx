import React from 'react'

const CANDLE_DATA = Array.from({ length: 32 }).map((_, i) => {
    // Generate deterministic chart data resembling a sleek upward wave
    const x = i / 32;
    const trend = x * 40; // Upward slope
    const wave = Math.sin(x * Math.PI * 3.5) * 15; // Smooth waves
    const noise = Math.sin(i * 5) * 4; 
    
    const open = 25 + trend + wave + noise;
    const close = open + (Math.sin(i * 2.2) * 12) + (Math.cos(i * 4.1) * 6); // Larger bodies
    
    const isGreen = close >= open;
    const maxBody = Math.max(open, close);
    const minBody = Math.min(open, close);
    
    // Wicks
    const wickTop = maxBody + Math.abs(Math.sin(i * 1.5) * 10);
    const wickBot = minBody - Math.abs(Math.cos(i * 2.1) * 10);
    
    // Smooth shading
    const isFaded = Math.abs(open - close) < 5 || Math.sin(i * 3) > 0.5;

    return { 
        isGreen, 
        base: minBody, 
        height: maxBody - minBody || 2, 
        wickTop, 
        wickBot,
        isFaded
    };
});

export function RealisticChart(): React.JSX.Element {
    return (
        <div className="relative w-full h-[260px] xl:h-[300px] flex items-stretch overflow-visible">
           {/* Candles - Centerpiece */}
           <div className="flex-1 relative flex items-end justify-center z-10 gap-1.5 sm:gap-2.5 lg:gap-3 px-2">
              {CANDLE_DATA.map((c, i) => (
                  <div key={i} className="relative w-full max-w-[12px] xl:max-w-[18px] flex flex-col items-center justify-end" style={{ height: '100%' }}>
                     {/* Layer 3: Large atmospheric bloom */}
                     <div className={`absolute w-[3px] ${c.isGreen ? 'bg-bull' : 'bg-bear'} blur-[30px] opacity-15`} style={{ bottom: `${c.wickBot}%`, top: `${100 - c.wickTop}%` }}></div>
                     <div className={`absolute w-full rounded-[3px] ${c.isGreen ? 'bg-bull' : 'bg-bear'} blur-[30px] opacity-15`} style={{ bottom: `${c.base}%`, height: `${c.height}%` }}></div>

                     {/* Layer 2: Soft blurred duplicate */}
                     <div className={`absolute w-[1.5px] ${c.isGreen ? 'bg-bull' : 'bg-bear'} blur-[10px] opacity-35`} style={{ bottom: `${c.wickBot}%`, top: `${100 - c.wickTop}%` }}></div>
                     <div className={`absolute w-full rounded-[3px] ${c.isGreen ? 'bg-bull' : 'bg-bear'} blur-[10px] opacity-35`} style={{ bottom: `${c.base}%`, height: `${c.height}%` }}></div>

                     {/* Layer 1: Sharp candle body and wick */}
                     <div className={`absolute w-[1px] ${c.isGreen ? 'bg-bull' : 'bg-bear'} opacity-80`} style={{ bottom: `${c.wickBot}%`, top: `${100 - c.wickTop}%` }}></div>
                     <div className={`absolute w-full rounded-[2px] ${c.isGreen ? 'bg-bull' : 'bg-bear'} ${c.isFaded ? 'opacity-50' : 'opacity-100'}`} style={{ bottom: `${c.base}%`, height: `${c.height}%` }}></div>
                  </div>
              ))}
           </div>
        </div>
    )
}
