import { supabase } from './supabase';

export interface DBProduct {
    id: string;
    name: string;
    brand: string;
    category: string | null;
    price: number;
    original_price: number | null;
    stock: number;
    status: string;
    images: string[];
    video_url: string | null;
    is_new: boolean;
    favorite_count: number;
    rating_average?: number;
    rating_count?: number;
}

export interface DisplayProduct {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    image: string;
    isNew?: boolean;
    category?: string;
    ratingAverage: number;
    ratingCount: number;
}

// Transform database product to display format
export function toDisplayProduct(product: DBProduct): DisplayProduct {
    return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.original_price || undefined,
        image: product.images?.[0] || '/products/default.png',
        isNew: product.is_new || false,
        category: product.category || undefined,
        ratingAverage: product.rating_average || 0,
        ratingCount: product.rating_count || 0
    };
}

// Fetch all active products
export async function getProducts(): Promise<DisplayProduct[]> {
    try {
        console.log('Fetching products from Supabase...');
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error.message, error.code, error.details);
            return [];
        }

        console.log(`Fetched ${data?.length} products successfully`);
        return (data || []).map(toDisplayProduct);
    } catch (err) {
        console.error('Exception fetching products:', err);
        return [];
    }
}

// Fetch featured products (newest ones)
export async function getFeaturedProducts(limit = 4): Promise<DisplayProduct[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('is_new', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }

    return (data || []).map(toDisplayProduct);
}

// Fetch product by ID
export async function getProductById(id: string): Promise<DBProduct | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }

    return data;
}

// Fetch products by category
export async function getProductsByCategory(category: string): Promise<DisplayProduct[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('category', category)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products by category:', error);
        return [];
    }

    return (data || []).map(toDisplayProduct);
}

// Fetch products by brand
export async function getProductsByBrand(brand: string): Promise<DisplayProduct[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .ilike('brand', brand)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products by brand:', error);
        return [];
    }

    return (data || []).map(toDisplayProduct);
}

// Search products
export async function searchProducts(query: string): Promise<DisplayProduct[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching products:', error);
        return [];
    }

    return (data || []).map(toDisplayProduct);
}
