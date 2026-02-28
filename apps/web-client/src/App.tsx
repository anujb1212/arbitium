import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import TradePage from './pages/TradePage'
import { isLoggedIn } from './lib/auth'

function RequireAuth({ children }: { children: React.JSX.Element }): React.JSX.Element {
    if (!isLoggedIn()) return children

    return children
}

export default function App(): React.JSX.Element {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/trade/:market"
                    element={
                        <RequireAuth>
                            <TradePage />
                        </RequireAuth>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
