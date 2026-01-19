"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";

export function CartDrawer() {
    const { items, removeItem, updateQuantity, closeCart, isOpen, itemCount, total } = useCart();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50 transition-opacity"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-dark border-l border-primary/20 z-50 flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-primary/20">
                    <h2 className="font-heading text-xl uppercase text-white flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-accent" /> Your Cart
                        <span className="text-accent">({itemCount})</span>
                    </h2>
                    <button onClick={closeCart} className="text-text-secondary hover:text-white transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag className="h-16 w-16 mx-auto text-primary/50 mb-4" />
                            <p className="text-text-secondary">Your cart is empty</p>
                            <Button variant="outline" className="mt-4" onClick={closeCart}>
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex gap-4 bg-white/5 p-3 border border-white/10 rounded-lg">
                                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                                    <NextImage src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-accent uppercase font-bold">{item.brand}</p>
                                    <h4 className="text-white text-sm font-heading line-clamp-2">{item.name}</h4>
                                    {item.size && (
                                        <div className="mt-1 inline-block bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-white">
                                            SIZE: {item.size}
                                        </div>
                                    )}
                                    <p className="text-white font-numeric font-bold mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
                                </div>
                                <div className="flex flex-col items-end justify-between">
                                    <button onClick={() => removeItem(item.id, item.size)} className="text-danger hover:text-danger/80">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <div className="flex items-center gap-2 border border-white/20 rounded">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)} className="p-1 text-text-secondary hover:text-white">
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="text-white text-sm font-numeric w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)} className="p-1 text-text-secondary hover:text-white">
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-primary/20 space-y-4">
                        <div className="flex justify-between text-lg">
                            <span className="text-text-secondary font-heading uppercase">Total</span>
                            <span className="text-white font-numeric font-bold">Rp {total.toLocaleString("id-ID")}</span>
                        </div>
                        <Link href="/checkout" onClick={closeCart}>
                            <Button variant="neon" className="w-full text-lg">Checkout Now</Button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
