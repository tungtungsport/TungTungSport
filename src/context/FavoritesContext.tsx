"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Product } from "@/components/ui/product-card";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

interface FavoritesContextType {
    items: Product[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    toggleItem: (product: Product) => void;
    isFavorite: (productId: string) => boolean;
    isOpen: boolean;
    openFavorites: () => void;
    closeFavorites: () => void;
    itemCount: number;
    isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<Product[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoggedIn } = useAuth();

    // Fetch favorites from Supabase when user logs in
    const fetchFavorites = useCallback(async () => {
        if (!user) {
            setItems([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const { data, error } = await supabase
            .from('favorites')
            .select(`
                id,
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
            console.error('Error fetching favorites:', error);
            setIsLoading(false);
            return;
        }

        // Transform to Product format
        const favoriteItems: Product[] = (data || []).map((item: any) => ({
            id: item.products.id,
            name: item.products.name,
            brand: item.products.brand,
            price: item.products.price,
            originalPrice: item.products.original_price,
            image: item.products.images?.[0] || '/products/default.png',
            isNew: item.products.is_new
        }));

        setItems(favoriteItems);
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        if (isLoggedIn && user) {
            fetchFavorites();
        } else {
            // Load from localStorage for guests
            const stored = localStorage.getItem("favorites");
            if (stored) {
                try {
                    setItems(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse favorites from localStorage", e);
                }
            }
            setIsLoading(false);
        }
    }, [isLoggedIn, user, fetchFavorites]);

    // Save to localStorage for guests
    useEffect(() => {
        if (!isLoggedIn && !isLoading) {
            localStorage.setItem("favorites", JSON.stringify(items));
        }
    }, [items, isLoggedIn, isLoading]);

    const addItem = async (product: Product) => {
        if (items.find((item) => item.id === product.id)) {
            return; // Already in favorites
        }

        if (isLoggedIn && user) {
            await supabase
                .from('favorites')
                .insert({
                    user_id: user.id,
                    product_id: product.id
                });
        }

        setItems((prev) => [...prev, product]);
    };

    const removeItem = async (productId: string) => {
        if (isLoggedIn && user) {
            await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', productId);
        }

        setItems((prev) => prev.filter((item) => item.id !== productId));
    };

    const toggleItem = (product: Product) => {
        if (isFavorite(product.id)) {
            removeItem(product.id);
        } else {
            addItem(product);
        }
    };

    const isFavorite = (productId: string) => items.some((item) => item.id === productId);

    const openFavorites = () => setIsOpen(true);
    const closeFavorites = () => setIsOpen(false);

    const itemCount = items.length;

    return (
        <FavoritesContext.Provider
            value={{ items, addItem, removeItem, toggleItem, isFavorite, isOpen, openFavorites, closeFavorites, itemCount, isLoading }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}
