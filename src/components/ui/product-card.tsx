"use client";

import Link from "next/link";
import NextImage from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";

export interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    image: string;
    isNew?: boolean;
    category?: string;
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem: addToCart } = useCart();
    const { toggleItem, isFavorite } = useFavorites();
    const { isLoggedIn, openAuthPopup } = useAuth();
    const isFav = isFavorite(product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) {
            openAuthPopup();
            return;
        }
        addToCart(product);
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) {
            openAuthPopup();
            return;
        }
        toggleItem(product);
    };

    return (
        <Link href={`/products/${product.id}`} className="group block relative">
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-900 border border-primary/20 group-hover:border-accent/50 transition-colors duration-300">
                {/* Image */}
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />

                <div className="absolute inset-4 flex items-center justify-center">
                    <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-500">
                        <NextImage
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover rounded-sm"
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                    </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {product.isNew && (
                        <span className="bg-accent text-dark text-[10px] font-bold px-2 py-1 uppercase tracking-wider">New Drop</span>
                    )}
                    {product.originalPrice && (
                        <span className="bg-danger text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Sale</span>
                    )}
                </div>

                {/* Favorite Button */}
                <button
                    onClick={handleToggleFavorite}
                    className="absolute top-2 right-2 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
                >
                    <Heart className={`h-5 w-5 transition-colors ${isFav ? "text-danger fill-danger" : "text-white hover:text-danger"}`} />
                </button>

                {/* Quick Add Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 bg-gradient-to-t from-black/90 to-transparent">
                    <Button variant="neon" size="sm" className="w-full" onClick={handleAddToCart}>
                        <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                </div>
            </div>

            {/* Info */}
            <div className="mt-3">
                <p className="text-text-secondary text-xs uppercase tracking-wider font-bold mb-1">{product.brand}</p>
                <h3 className="text-white font-heading text-sm sm:text-base md:text-lg leading-tight group-hover:text-accent transition-colors line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">{product.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2 font-numeric text-sm sm:text-lg">
                    <span className="text-white font-bold">Rp {product.price.toLocaleString('id-ID')}</span>
                    {product.originalPrice && (
                        <span className="text-gray-500 text-xs sm:text-sm line-through">Rp {product.originalPrice.toLocaleString('id-ID')}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
