import React, { createContext, useContext, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info'

type ToastMessage = {
    id: string
    type: ToastType
    title: string
    message?: string
}

type ToastContextValue = {
    addToast: (type: ToastType, title: string, message?: string) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const addToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = crypto.randomUUID()
        setToasts((prev) => [...prev, { id, type, title, message }])
        setTimeout(() => removeToast(id), 4000)
    }, [removeToast])

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto w-[320px] p-4 rounded-xl shadow-2xl border bg-panel transition-all transform animate-in fade-in slide-in-from-bottom-5
                            ${toast.type === 'error' ? 'border-bear/30' : toast.type === 'success' ? 'border-bull/30' : 'border-line'}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h4 className={`text-[13px] font-bold tracking-tight
                                    ${toast.type === 'error' ? 'text-bear' : toast.type === 'success' ? 'text-bull' : 'text-hi'}`}>
                                    {toast.title}
                                </h4>
                                {toast.message && (
                                    <p className="mt-1 text-[12px] text-mid break-words leading-snug">
                                        {toast.message}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-lo hover:text-hi transition-colors text-[16px] leading-none"
                            >
                                x
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
