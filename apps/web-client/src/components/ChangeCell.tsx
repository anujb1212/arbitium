import React from 'react'

const ChangeCell = React.memo(function ChangeCell({ pct }: { pct: string | undefined }): React.JSX.Element {
    if (!pct) return <span className="text-lo font-mono text-[13px]">-</span>
    const numeric = parseFloat(pct)
    const color = numeric > 0 ? 'text-bull' : numeric < 0 ? 'text-bear' : 'text-mid'
    const prefix = numeric > 0 ? '+' : ''
    return (
        <span className={`font-mono text-[13px] font-bold flex items-center justify-end gap-1 ${color}`}>
            {prefix}{pct}%
            {numeric > 0 ? <span className="text-[10px]">▲</span> : numeric < 0 ? <span className="text-[10px]">▼</span> : ''}
        </span>
    )
})

export { ChangeCell }
