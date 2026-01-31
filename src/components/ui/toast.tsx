"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

interface ToastProps {
    message: string;
    type?: "success" | "error";
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className="fixed top-20 right-4 z-[9999] animate-slide-in-right"
            style={{
                animation: "slideInRight 0.3s ease-out"
            }}
        >
            <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-sm ${type === "success"
                        ? "bg-accent/95 border-accent text-dark"
                        : "bg-danger/95 border-danger text-white"
                    }`}
            >
                {type === "success" ? (
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <p className="font-bold text-sm">{message}</p>
                <button
                    onClick={onClose}
                    className="ml-2 hover:opacity-70 transition-opacity"
                    aria-label="Close notification"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// Hook for managing toast state
export function useToast() {
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    return { toast, showToast, hideToast };
}
