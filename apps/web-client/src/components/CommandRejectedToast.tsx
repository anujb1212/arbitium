import React, { useEffect } from "react";

type Props = {
    message: string;
    onClose: () => void;
};

export function CommandRejectedToast(props: Props): React.JSX.Element {
    const { message, onClose } = props;

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="absolute bottom-3 right-3 w-[360px] pointer-events-auto">
            <div className="bg-raised border border-bear/40 shadow-lg rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-[11px] font-semibold text-bear uppercase tracking-wider">
                            Command rejected
                        </div>
                        <div className="mt-1 text-[12px] text-hi break-words">{message}</div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-2 py-1 rounded border border-line bg-panel text-[11px] text-mid hover:text-hi"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}