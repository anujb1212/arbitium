import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { storeToken } from "../lib/auth";

export default function AuthCallbackPage(): React.JSX.Element {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("Completing connection...");

    useEffect(() => {
        const token = params.get("arbitium_token");
        const state = params.get("state");
        const error = params.get("error");

        if (window.opener) {
            if (token) {
                window.opener.postMessage(
                    { type: "arbitium:connected", token, state: state ?? "" },
                    window.location.origin
                );
            } else {
                window.opener.postMessage(
                    { type: "arbitium:connect_error", error: error ?? "unknown", state: state ?? "" },
                    window.location.origin
                );
            }

            if (token) {
                setMessage("Connected — you can close this window.");
            } else {
                setMessage("Connection cancelled — you can close this window.");
            }

            const timer = setTimeout(() => window.close(), 2000);
            return () => clearTimeout(timer);
        }

        if (token) {
            const storedState = sessionStorage.getItem("vaultly_connect_state");
            if (storedState && state && state !== storedState) {
                sessionStorage.removeItem("vaultly_connect_state");
                navigate("/", { replace: true });
                return;
            }
            sessionStorage.removeItem("vaultly_connect_state");
            storeToken(token);
            navigate("/", { replace: true });
        } else {
            setMessage("Connection cancelled — redirecting...");
            const timer = setTimeout(() => navigate("/", { replace: true }), 1500);
            return () => clearTimeout(timer);
        }
    }, [params, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-base">
            <div className="bg-panel border border-line rounded-xl p-8 text-center max-w-sm">
                <p className="text-[15px] font-medium text-mid">{message}</p>
            </div>
        </div>
    );
}
