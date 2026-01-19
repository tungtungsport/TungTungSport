"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Heart, CreditCard } from "lucide-react";
import { Product } from "@/components/ui/product-card";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductDetailActionsProps {
    product: Product;
}

const SIZES = ["38", "39", "40", "41", "42", "43", "44", "45"];

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
    const router = useRouter();
    const { addItem: addToCart, openCart } = useCart();
    const { toggleItem, isFavorite } = useFavorites();
    const { isLoggedIn, openAuthPopup } = useAuth();
    const isFav = isFavorite(product.id);
    const [selectedSize, setSelectedSize] = useState<string>("");

    const handleAddToCart = () => {
        if (!isLoggedIn) {
            openAuthPopup();
            return;
        }
        if (!selectedSize) {
            alert("Please select a size first.");
            return;
        }
        addToCart(product, selectedSize);
        openCart();
    };

    const handleCheckoutNow = () => {
        if (!isLoggedIn) {
            openAuthPopup();
            return;
        }
        if (!selectedSize) {
            alert("Please select a size first.");
            return;
        }
        // Direct checkout - pass product info via URL params (not adding to cart)
        const params = new URLSearchParams({
            direct: 'true',
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            productPrice: product.price.toString(),
            productBrand: product.brand,
            size: selectedSize,
            quantity: '1'
        });
        router.push(`/checkout?${params.toString()}`);
    };

    const handleToggleFavorite = () => {
        if (!isLoggedIn) {
            openAuthPopup();
            return;
        }
        toggleItem(product);
    };

    return (
        <div className="space-y-6">
            {/* Size Selector */}
            <div>
                <h3 className="text-white font-bold mb-3 uppercase text-sm tracking-wider">Select Size (EU)</h3>
                <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                        <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`w-12 h-12 flex items-center justify-center font-numeric font-bold border transition-colors ${selectedSize === size
                                ? "bg-accent border-accent text-dark"
                                : "bg-transparent border-white/20 text-white hover:border-white"
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button variant="neon" size="lg" className="flex-1 text-base md:text-lg" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-dark"
                    onClick={handleCheckoutNow}
                >
                    <CreditCard className="mr-2 h-5 w-5" /> Checkout Now
                </Button>
                <Button
                    variant="ghost"
                    size="lg"
                    className={`border ${isFav ? "border-danger text-danger" : "border-white/20 text-text-secondary hover:text-danger hover:border-danger"}`}
                    onClick={handleToggleFavorite}
                >
                    <Heart className={`h-5 w-5 ${isFav ? "fill-danger" : ""}`} />
                </Button>
            </div>
        </div>
    );
}
