"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Product } from "@/components/ui/product-card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

interface CartItem extends Product {
    quantity: number;
    size?: string;
}

// Unique key for each cart item (product id + size)
const getItemKey = (productId: string, size?: string) => `${productId}-${size || 'default'}`;

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, size?: string) => void;
    removeItem: (productId: string, size?: string) => void;
    updateQuantity: (productId: string, quantity: number, size?: string) => void;
    updateSize: (productId: string, oldSize: string | undefined, newSize: string) => void;
    clearCart: () => void;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    itemCount: number;
    total: number;
    isLoading: boolean;
    // Selection features
    selectedItems: Set<string>;
    toggleItemSelection: (productId: string, size?: string) => void;
    selectAllItems: () => void;
    clearSelection: () => void;
    isItemSelected: (productId: string, size?: string) => boolean;
    selectedTotal: number;
    getSelectedItems: () => CartItem[];
    removeSelectedItems: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
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

    const updateSize = async (productId: string, oldSize: string | undefined, newSize: string) => {
        // Check if item with newSize already exists
        const existingWithNewSize = items.find(item => item.id === productId && item.size === newSize);
        const currentItem = items.find(item => item.id === productId && item.size === oldSize);

        if (!currentItem) return;

        if (existingWithNewSize) {
            // Merge: add quantity to existing item and remove old
            if (isLoggedIn && user) {
                // Update the existing item's quantity
                await supabase
                    .from('cart_items')
                    .update({ quantity: existingWithNewSize.quantity + currentItem.quantity })
                    .eq('user_id', user.id)
                    .eq('product_id', productId)
                    .eq('size', newSize);

                // Delete the old size item
                let deleteQuery = supabase
                    .from('cart_items')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', productId);

                if (oldSize) {
                    deleteQuery = deleteQuery.eq('size', oldSize);
                } else {
                    deleteQuery = deleteQuery.is('size', null);
                }
                await deleteQuery;
            }

            setItems(prev =>
                prev
                    .map(item => {
                        if (item.id === productId && item.size === newSize) {
                            return { ...item, quantity: item.quantity + currentItem.quantity };
                        }
                        return item;
                    })
                    .filter(item => !(item.id === productId && item.size === oldSize))
            );
        } else {
            // Simply update the size
            if (isLoggedIn && user) {
                let query = supabase
                    .from('cart_items')
                    .update({ size: newSize })
                    .eq('user_id', user.id)
                    .eq('product_id', productId);

                if (oldSize) {
                    query = query.eq('size', oldSize);
                } else {
                    query = query.is('size', null);
                }
                await query;
            }

            setItems(prev =>
                prev.map(item =>
                    (item.id === productId && item.size === oldSize)
                        ? { ...item, size: newSize }
                        : item
                )
            );
        }

        // Update selection if this item was selected
        const oldKey = getItemKey(productId, oldSize);
        const newKey = getItemKey(productId, newSize);
        if (selectedItems.has(oldKey)) {
            setSelectedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(oldKey);
                newSet.add(newKey);
                return newSet;
            });
        }
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

    // Selection functions
    const toggleItemSelection = (productId: string, size?: string) => {
        const key = getItemKey(productId, size);
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const selectAllItems = () => {
        const allKeys = items.map(item => getItemKey(item.id, item.size));
        setSelectedItems(new Set(allKeys));
    };

    const clearSelection = () => {
        setSelectedItems(new Set());
    };

    const isItemSelected = (productId: string, size?: string) => {
        return selectedItems.has(getItemKey(productId, size));
    };

    const selectedTotal = items
        .filter(item => isItemSelected(item.id, item.size))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

    const getSelectedItems = () => {
        return items.filter(item => isItemSelected(item.id, item.size));
    };

    const removeSelectedItems = async () => {
        const selectedItemsList = getSelectedItems();
        for (const item of selectedItemsList) {
            await removeItem(item.id, item.size);
        }
        clearSelection();
    };

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                updateSize,
                clearCart,
                isOpen,
                openCart,
                closeCart,
                itemCount,
                total,
                isLoading,
                selectedItems,
                toggleItemSelection,
                selectAllItems,
                clearSelection,
                isItemSelected,
                selectedTotal,
                getSelectedItems,
                removeSelectedItems
            }}
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
