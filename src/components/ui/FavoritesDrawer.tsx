"use client";

import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { X, Heart, ShoppingCart } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";

export function FavoritesDrawer() {
    const { items, removeItem, closeFavorites, isOpen, itemCount } = useFavorites();
    const { addItem: addToCart, openCart } = useCart();

    if (!isOpen) return null;

    const handleAddToCart = (product: typeof items[0]) => {
        addToCart(product);
        removeItem(product.id);
        openCart();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50 transition-opacity"
                onClick={closeFavorites}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-dark border-l border-primary/20 z-50 flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-primary/20">
                    <h2 className="font-heading text-xl uppercase text-white flex items-center gap-2">
                        <Heart className="h-5 w-5 text-danger fill-danger" /> Favorites
                        <span className="text-accent">({itemCount})</span>
                    </h2>
                    <button onClick={closeFavorites} className="text-text-secondary hover:text-white transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <Heart className="h-16 w-16 mx-auto text-primary/50 mb-4" />
                            <p className="text-text-secondary">No favorites yet</p>
                            <Button variant="outline" className="mt-4" onClick={closeFavorites}>
                                Browse Products
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-white/5 p-3 border border-white/10 rounded-lg">
                                <Link href={`/products/${item.id}`} onClick={closeFavorites} className="relative w-20 h-20 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                                    <NextImage src={item.image} alt={item.name} fill className="object-cover" />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-accent uppercase font-bold">{item.brand}</p>
                                    <Link href={`/products/${item.id}`} onClick={closeFavorites}>
                                        <h4 className="text-white text-sm font-heading line-clamp-2 hover:text-accent transition-colors">{item.name}</h4>
                                    </Link>
                                    <p className="text-white font-numeric font-bold mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
                                </div>
                                <div className="flex flex-col items-end justify-start">
                                    <button onClick={() => removeItem(item.id)} className="text-danger hover:text-danger/80">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
