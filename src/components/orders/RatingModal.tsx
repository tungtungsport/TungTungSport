"use client";

import { useState } from "react";
import { Star, X, Loader2, Camera, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
    onSuccess: () => void;
}

export function RatingModal({ isOpen, onClose, order, onSuccess }: RatingModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [ratings, setRatings] = useState<Record<string, { rating: number, comment: string }>>({});

    if (!isOpen || !order) return null;

    const handleRatingChange = (productId: string, rating: number) => {
        setRatings(prev => ({
            ...prev,
            [productId]: { ...prev[productId], rating }
        }));
    };

    const handleCommentChange = (productId: string, comment: string) => {
        setRatings(prev => ({
            ...prev,
            [productId]: { ...prev[productId], comment }
        }));
    };

    const handleSubmit = async () => {
        // Validate that all items have a rating
        const unanswered = order.order_items.filter((item: any) => !ratings[item.product_id]?.rating);
        if (unanswered.length > 0) {
            alert("Mohon berikan rating (bintang) untuk semua produk.");
            return;
        }

        setSubmitting(true);
        try {
            const ratingData = order.order_items.map((item: any) => ({
                product_id: item.product_id,
                customer_id: order.customer_id,
                order_id: order.id,
                rating: ratings[item.product_id].rating,
                review_text: ratings[item.product_id].comment || ""
            }));

            console.log("Submitting ratingData:", ratingData);

            const { error } = await supabase
                .from('ratings')
                .insert(ratingData);

            if (error) {
                console.error("Supabase rating insert error:", error);
                throw error;
            }

            alert("Terima kasih! Rating Anda telah berhasil disimpan.");
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Error submitting ratings:", err);
            const errorMessage = err.message || (typeof err === 'string' ? err : "Terjadi kesalahan");
            alert(`Gagal mengirim rating: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-dark/90 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#0F2A1E] border border-[#1A4D35] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-lg shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-[#1A4D35] flex justify-between items-center">
                    <div>
                        <h2 className="text-white font-heading text-xl uppercase italic">Beri Rating & Review</h2>
                        <p className="text-[#BFD3C6] text-xs">Pesanan #{order.order_number}</p>
                    </div>
                    <button onClick={onClose} className="text-[#BFD3C6] hover:text-white transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {order.order_items.map((item: any) => (
                        <div key={item.id} className="bg-white/5 border border-white/10 p-4 rounded-lg">
                            <div className="flex gap-4 mb-4">
                                <div className="h-16 w-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                    {item.product_image ? (
                                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">IMG</div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm line-clamp-1">{item.product_name}</h4>
                                    {item.size && <p className="text-[#BFD3C6] text-xs">Size: {item.size}</p>}
                                </div>
                            </div>

                            {/* Stars */}
                            <div className="flex flex-col items-center mb-4">
                                <p className="text-accent text-xs font-bold uppercase mb-2">Pilih Rating</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRatingChange(item.product_id, star)}
                                            className="transition-transform active:scale-95"
                                        >
                                            <Star
                                                className={cn(
                                                    "h-8 w-8 transition-colors",
                                                    (ratings[item.product_id]?.rating || 0) >= star
                                                        ? "text-yellow-400 fill-yellow-400"
                                                        : "text-white/20"
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <textarea
                                placeholder="Bagaimana kesan Anda terhadap produk ini? (Opsional)"
                                value={ratings[item.product_id]?.comment || ""}
                                onChange={(e) => handleCommentChange(item.product_id, e.target.value)}
                                className="w-full bg-dark/50 border border-white/10 rounded p-3 text-white text-sm focus:outline-none focus:border-accent min-h-[80px] resize-none"
                            />
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#1A4D35] bg-[#0A1A13]">
                    <Button
                        variant="neon"
                        className="w-full h-12 text-base font-bold uppercase italic"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Mengirim...</>
                        ) : (
                            <><Send className="h-5 w-5 mr-2" /> Kirim Rating</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
