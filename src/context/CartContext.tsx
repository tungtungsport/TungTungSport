"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Product } from "@/components/ui/product-card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

interface CartItem extends Product {
    quantity: number;
    size?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, size?: string) => void;
    removeItem: (productId: string, size?: string) => void;
    updateQuantity: (productId: string, quantity: number, size?: string) => void;
    clearCart: () => void;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    itemCount: number;
    total: number;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoggedIn } = useAuth();

    // Fetch cart from Supabase when user logs in
    const fetchCart = useCallback(async () => {
        if (!user) {
            setItems([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const { data, error } = await supabase
            .from('cart_items')
            .select(`
                id,
                quantity,
                size,
                product_id,
                products (
                    id,
                    name,
                    brand,
                    price,
                    original_price,
                    images,
                    is_new
                )
            `)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching cart:', error.message || error);
            setIsLoading(false);
            return;
        }

        // Transform to CartItem format
        const cartItems: CartItem[] = (data || []).map((item: any) => ({
            id: item.products.id,
            name: item.products.name,
            brand: item.products.brand,
            price: item.products.price,
            originalPrice: item.products.original_price,
            image: item.products.images?.[0] || '/products/default.png',
            isNew: item.products.is_new,
            quantity: item.quantity,
            size: item.size
        }));

        setItems(cartItems);
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        if (isLoggedIn && user) {
            fetchCart();
        } else {
            // Load from localStorage for guests
            const stored = localStorage.getItem("cart");
            if (stored) {
                try {
                    setItems(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse cart from localStorage", e);
                }
            }
            setIsLoading(false);
        }
    }, [isLoggedIn, user, fetchCart]);

    // Save to localStorage for guests
    useEffect(() => {
        if (!isLoggedIn && !isLoading) {
            localStorage.setItem("cart", JSON.stringify(items));
        }
    }, [items, isLoggedIn, isLoading]);

    const addItem = async (product: Product, size?: string) => {
        // Find item with same ID AND same size
        const existing = items.find((item) => item.id === product.id && item.size === size);

        if (isLoggedIn && user) {
            if (existing) {
                // Update quantity in Supabase
                // We need to identify the specific row. Since Supabase doesn't support composite key update easily via .update().eq().eq(), 
                // we'll rely on user_id + product_id + size uniqueness or just use Rpc/raw query if strict, but simple update works if we assume constraint.
                // Actually constraint is likely (user_id, product_id, size - if nullable, careful).
                // Ideally we'd have a unique constraint. For now, let's try strict matching.

                let query = supabase
                    .from('cart_items')
                    .update({ quantity: existing.quantity + 1 })
                    .eq('user_id', user.id)
                    .eq('product_id', product.id);

                if (size) {
                    query = query.eq('size', size);
                } else {
                    query = query.is('size', null);
                }

                await query;
            } else {
                // Insert new item
                await supabase
                    .from('cart_items')
                    .insert({
                        user_id: user.id,
                        product_id: product.id,
                        quantity: 1,
                        size: size || null
                    });
            }
        }

        // Update local state
        setItems((prev) => {
            if (existing) {
                return prev.map((item) =>
                    (item.id === product.id && item.size === size)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1, size }];
        });
    };

    const removeItem = async (productId: string, size?: string) => {
        if (isLoggedIn && user) {
            let query = supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', productId);

            if (size) {
                query = query.eq('size', size);
            } else {
                query = query.is('size', null);
            }

            await query;
        }

        setItems((prev) => prev.filter((item) => !(item.id === productId && item.size === size)));
    };

    const updateQuantity = async (productId: string, quantity: number, size?: string) => {
        if (quantity <= 0) {
            removeItem(productId, size);
            return;
        }

        if (isLoggedIn && user) {
            let query = supabase
                .from('cart_items')
                .update({ quantity })
                .eq('user_id', user.id)
                .eq('product_id', productId);

            if (size) {
                query = query.eq('size', size);
            } else {
                query = query.is('size', null);
            }

            await query;
        }

        setItems((prev) =>
            prev.map((item) => ((item.id === productId && item.size === size) ? { ...item, quantity } : item))
        );
    };

    const clearCart = async () => {
        if (isLoggedIn && user) {
            await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);
        }
        setItems([]);
    };

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ items, addItem, removeItem, updateQuantity, clearCart, isOpen, openCart, closeCart, itemCount, total, isLoading }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
