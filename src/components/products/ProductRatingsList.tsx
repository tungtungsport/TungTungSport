"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star, MessageSquare, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Rating {
    id: string;
    rating: number;
    review_text: string;
    created_at: string;
    profiles: {
        name: string;
    };
}

export function ProductRatingsList({ productId }: { productId: string }) {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (productId) {
            fetchRatings();
        }
    }, [productId]);

    const fetchRatings = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('ratings')
                .select(`
                    id,
                    rating,
                    review_text,
                    created_at,
                    profiles (name)
                `)
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRatings(data as any);
        } catch (err) {
            console.error("Error fetching ratings:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
        );
    }

    return (
        <div className="mt-12 md:mt-16">
            <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="h-6 w-6 text-accent" />
                <h3 className="text-white font-heading text-xl md:text-2xl uppercase italic">Ulasan Pelanggan ({ratings.length})</h3>
            </div>

            {ratings.length === 0 ? (
                <div className="bg-white/5 border border-white/10 p-8 rounded-lg text-center">
                    <Star className="h-10 w-10 mx-auto text-white/20 mb-3" />
                    <p className="text-text-secondary">Belum ada ulasan untuk produk ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ratings.map((rating) => (
                        <div key={rating.id} className="bg-white/5 border border-white/10 p-6 rounded-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-accent/20 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">{rating.profiles.name || "Anonymous"}</p>
                                        <p className="text-[#BFD3C6] text-[10px] uppercase">{new Date(rating.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={cn(
                                                "h-4 w-4",
                                                rating.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-white/10"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                            {rating.review_text && (
                                <p className="text-[#BFD3C6] text-sm italic leading-relaxed">
                                    "{rating.review_text}"
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
