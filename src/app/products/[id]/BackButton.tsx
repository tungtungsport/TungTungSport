"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
    const router = useRouter();

    const handleBack = () => {
        // Check if there's history to go back to
        if (window.history.length > 1) {
            router.back();
        } else {
            // Fallback to products page if no history
            router.push("/products");
        }
    };

    return (
        <button
            onClick={handleBack}
            className="inline-flex items-center text-text-secondary hover:text-white mb-4 md:mb-6 transition-colors text-sm md:text-base"
        >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </button>
    );
}
