import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import TradePage from './pages/TradePage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import { ToastProvider, useToast } from './components/ToastProvider'
import { initConnectListener } from './lib/auth'

function ConnectListenerSetup(): null {
    const { addToast } = useToast();
    useEffect(() => {
        initConnectListener(addToast);
    }, [addToast]);
    return null;
}

export default function App(): React.JSX.Element {
    return (
        <ToastProvider>
            <BrowserRouter>
                <ConnectListenerSetup />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/trade/:market" element={<TradePage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </ToastProvider>
    )
}
