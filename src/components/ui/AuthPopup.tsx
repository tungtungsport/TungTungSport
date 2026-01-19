"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { X, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

export function AuthPopup() {
    const { showAuthPopup, closeAuthPopup } = useAuth();

    if (!showAuthPopup) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 z-50"
                onClick={closeAuthPopup}
            />

            {/* Popup */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-dark border border-primary/30 rounded-xl shadow-2xl p-6">
                <button
                    onClick={closeAuthPopup}
                    className="absolute top-4 right-4 text-text-secondary hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                        <LogIn className="h-8 w-8 text-accent" />
                    </div>
                    <h2 className="font-heading text-2xl text-white uppercase italic">Masuk Dulu</h2>
                    <p className="text-text-secondary text-sm mt-2">
                        Silakan masuk atau daftar untuk menambahkan produk ke keranjang atau favorit.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link href="/login" onClick={closeAuthPopup}>
                        <Button variant="neon" className="w-full" size="lg">
                            <LogIn className="h-5 w-5 mr-2" /> Masuk
                        </Button>
                    </Link>
                    <Link href="/signup" onClick={closeAuthPopup}>
                        <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-dark" size="lg">
                            <UserPlus className="h-5 w-5 mr-2" /> Daftar
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
