import React from 'react'
import { Wallet, Zap, Clock, ShieldCheck } from 'lucide-react'

export function MetricsRow(): React.JSX.Element {
    return (
        <div className="w-full flex flex-col md:flex-row items-center justify-between border-y border-line bg-panel py-8 px-8 md:px-12 mb-20 rounded-xl gap-8 md:gap-4 shadow-xl">
            <div className="flex items-center gap-5 w-full md:w-1/4">
                <div className="w-11 h-11 rounded-full border border-accent/20 flex items-center justify-center bg-accent/5 text-accent"><Wallet size={18} strokeWidth={2.5} /></div>
                <div className="flex flex-col gap-0.5"><div className="text-hi font-bold text-[18px] tracking-tight">$38.24B+</div><div className="text-mid text-[11px] font-medium tracking-wide">24H Volume</div></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-line"></div>
            <div className="flex items-center gap-5 w-full md:w-1/4">
                <div className="w-11 h-11 rounded-full border border-accent/20 flex items-center justify-center bg-accent/5 text-accent"><Zap size={18} strokeWidth={2.5} /></div>
                <div className="flex flex-col gap-0.5"><div className="text-hi font-bold text-[18px] tracking-tight">1.2M+</div><div className="text-mid text-[11px] font-medium tracking-wide">Trades Executed</div></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-line"></div>
            <div className="flex items-center gap-5 w-full md:w-1/4">
                <div className="w-11 h-11 rounded-full border border-accent/20 flex items-center justify-center bg-accent/5 text-accent"><Clock size={18} strokeWidth={2.5} /></div>
                <div className="flex flex-col gap-0.5"><div className="text-hi font-bold text-[18px] tracking-tight">0.15ms</div><div className="text-mid text-[11px] font-medium tracking-wide">Avg. Matching Time</div></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-line"></div>
            <div className="flex items-center gap-5 w-full md:w-1/4">
                <div className="w-11 h-11 rounded-full border border-accent/20 flex items-center justify-center bg-accent/5 text-accent"><ShieldCheck size={18} strokeWidth={2.5} /></div>
                <div className="flex flex-col gap-0.5"><div className="text-hi font-bold text-[18px] tracking-tight">99.99%</div><div className="text-mid text-[11px] font-medium tracking-wide">System Uptime</div></div>
            </div>
        </div>
    )
}
