"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Heart, CreditCard } from "lucide-react";
import { Product } from "@/components/ui/product-card";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Toast } from "@/components/ui/toast";

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
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [isCartAnimating, setIsCartAnimating] = useState(false);
    const [isFavAnimating, setIsFavAnimating] = useState(false);
    const cartButtonRef = useRef<HTMLButtonElement>(null);
    const favButtonRef = useRef<HTMLButtonElement>(null);

    const createFlyingProduct = (targetSelector: string) => {
        const productImage = document.querySelector('img[alt="' + product.name + '"]');
        const targetElement = document.querySelector(targetSelector);

        if (!productImage || !targetElement) return;

        const imageRect = productImage.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        const flyingElement = document.createElement('div');
        flyingElement.style.position = 'fixed';
        flyingElement.style.left = `${imageRect.left}px`;
        flyingElement.style.top = `${imageRect.top}px`;
        flyingElement.style.width = `${imageRect.width}px`;
        flyingElement.style.height = `${imageRect.height}px`;
        flyingElement.style.zIndex = '9999';
        flyingElement.style.pointerEvents = 'none';
        flyingElement.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        const img = document.createElement('img');
        img.src = product.image;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        img.style.opacity = '0.9';

        flyingElement.appendChild(img);
        document.body.appendChild(flyingElement);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                flyingElement.style.left = `${targetRect.left}px`;
                flyingElement.style.top = `${targetRect.top}px`;
                flyingElement.style.width = '40px';
                flyingElement.style.height = '40px';
                flyingElement.style.opacity = '0';
            });
        });

        setTimeout(() => {
            flyingElement.remove();
        }, 800);
    };

    const handleAddToCart = () => {
        if (!isLoggedIn) {
            openAuthPopup();
            return;
        }
        if (!selectedSize) {
            setToast({ message: "Please select a size first!", type: "error" });
            return;
        }

        // Button animation
        setIsCartAnimating(true);
        setTimeout(() => setIsCartAnimating(false), 600);

        // Add to cart
        addToCart(product, selectedSize);

        // Show toast
        setToast({ message: "Added to Cart!", type: "success" });

        // Flying animation
        createFlyingProduct('[data-cart-icon]');

        // Open cart after animation
        setTimeout(() => {
            openCart();
        }, 400);
    };

    const handleCheckoutNow = () => {
        if (!isLoggedIn) {
            openAuthPopup();
            return;
        }
        if (!selectedSize) {
            setToast({ message: "Please select a size first!", type: "error" });
            return;
        }
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

        // Button animation
        setIsFavAnimating(true);
        setTimeout(() => setIsFavAnimating(false), 600);

        // Toggle favorite
        const wasAdded = !isFav;
        toggleItem(product);

        // Show toast
        if (wasAdded) {
            setToast({ message: "Added to Favorites!", type: "success" });
            // Flying animation
            createFlyingProduct('[data-favorites-icon]');
        } else {
            setToast({ message: "Removed from Favorites", type: "success" });
        }
    };

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="space-y-6">
                {/* Size Selector */}
                <div>
                    <h3 className="text-white font-bold mb-3 uppercase text-sm tracking-wider">Select Size (EU)</h3>
                    <div className="flex flex-wrap gap-2">
                        {SIZES.map((size) => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`w-12 h-12 flex items-center justify-center font-numeric font-bold border transition-all duration-200 ${selectedSize === size
                                        ? "bg-accent border-accent text-dark scale-110"
                                        : "bg-transparent border-white/20 text-white hover:border-white hover:scale-105"
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button
                        ref={cartButtonRef}
                        variant="neon"
                        size="lg"
                        className={`flex-1 text-base md:text-lg transition-transform ${isCartAnimating ? "animate-pulse-scale" : ""
                            }`}
                        onClick={handleAddToCart}
                    >
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
                        ref={favButtonRef}
                        variant="ghost"
                        size="lg"
                        className={`border transition-all ${isFav ? "border-danger text-danger" : "border-white/20 text-text-secondary hover:text-danger hover:border-danger"
                            } ${isFavAnimating ? "animate-pulse-scale" : ""}`}
                        onClick={handleToggleFavorite}
                    >
                        <Heart className={`h-5 w-5 ${isFav ? "fill-danger" : ""}`} />
                    </Button>
                </div>
            </div>
        </>
    );
}
