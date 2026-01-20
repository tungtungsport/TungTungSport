"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductCard, Product } from "@/components/ui/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/products";
import { Filter, Search, ChevronDown, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "price-low" | "price-high" | "name-asc";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const categories = ["Football", "Futsal"];

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await getProducts();
                setProducts(data);

                // Extract unique brands
                const uniqueBrands = [...new Set(data.map(p => p.brand))];
                setBrands(uniqueBrands);
            } catch (err) {
                console.error('Error loading products:', err);
            } finally {
                setIsLoading(false);
            }
        }
        loadProducts();
    }, []);

    const toggleBrand = (brand: string) => {
        if (selectedBrands.includes(brand)) {
            setSelectedBrands(selectedBrands.filter(b => b !== brand));
        } else {
            setSelectedBrands([...selectedBrands, brand]);
        }
    };

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedBrands([]);
        setSelectedCategories([]);
        setMinPrice("");
        setMaxPrice("");
    };

    const filteredProducts = products
        .filter(p => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);

            const matchesCategory = selectedCategories.length === 0 ||
                (p.category && selectedCategories.some(cat =>
                    p.category?.toLowerCase().includes(cat.toLowerCase())
                ));

            // Price filter - direct value comparison (500 = Rp 500)
            const min = minPrice ? parseFloat(minPrice) : 0;
            const max = maxPrice ? parseFloat(maxPrice) : Infinity;
            const matchesPrice = p.price >= min && p.price <= max;

            return matchesSearch && matchesBrand && matchesCategory && matchesPrice;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "newest":
                default:
                    return 0; // Keep original order (newest first from DB)
            }
        });

    const hasActiveFilters = searchQuery || selectedBrands.length > 0 || selectedCategories.length > 0 || minPrice || maxPrice;

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: "newest", label: "Newest" },
        { value: "price-low", label: "Price: Low to High" },
        { value: "price-high", label: "Price: High to Low" },
        { value: "name-asc", label: "Name: A-Z" },
    ];

    const filterContent = (
        <div className="space-y-8">
            <div className="flex items-center justify-between text-white font-heading font-bold text-xl uppercase border-b border-primary/20 pb-4">
                <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" /> <span>Filters</span>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-xs text-accent hover:underline font-normal normal-case"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Categories */}
            <div>
                <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Category</h3>
                <div className="space-y-2">
                    {categories.map(category => (
                        <label key={category} className="flex items-center space-x-3 cursor-pointer group">
                            <div className={`w-4 h-4 border border-text-secondary flex items-center justify-center group-hover:border-accent transition-colors ${selectedCategories.includes(category) ? 'bg-accent border-accent' : ''}`}
                                onClick={() => toggleCategory(category)}
                            >
                                {selectedCategories.includes(category) && <div className="w-2 h-2 bg-dark" />}
                            </div>
                            <span className={`text-sm group-hover:text-white transition-colors ${selectedCategories.includes(category) ? 'text-white font-bold' : 'text-text-secondary'}`}>{category}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Brands */}
            <div>
                <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Brands</h3>
                <div className="space-y-2">
                    {brands.map(brand => (
                        <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
                            <div className={`w-4 h-4 border border-text-secondary flex items-center justify-center group-hover:border-accent transition-colors ${selectedBrands.includes(brand) ? 'bg-accent border-accent' : ''}`}
                                onClick={() => toggleBrand(brand)}
                            >
                                {selectedBrands.includes(brand) && <div className="w-2 h-2 bg-dark" />}
                            </div>
                            <span className={`text-sm group-hover:text-white transition-colors ${selectedBrands.includes(brand) ? 'text-white font-bold' : 'text-text-secondary'}`}>{brand}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Price Range (Rp)</h3>
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Min"
                        className="h-8 text-xs bg-dark-lighter"
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="text-text-secondary">-</span>
                    <Input
                        placeholder="Max"
                        className="h-8 text-xs bg-dark-lighter"
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                </div>
            </div>

            {/* Sort on Mobile */}
            <div className="md:hidden">
                <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Sort By</h3>
                <div className="grid grid-cols-1 gap-2">
                    {sortOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setSortBy(option.value)}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded border text-sm transition-all",
                                sortBy === option.value ? "bg-accent/10 border-accent text-accent" : "bg-white/5 border-white/10 text-white"
                            )}
                        >
                            {option.label}
                            {sortBy === option.value && <ChevronDown className="h-4 w-4 rotate-180" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-dark">
            <Navbar />

            {/* Header with Search Bar */}
            <div className="bg-primary/20 border-b border-primary/20 py-8 md:py-12">
                <div className="container mx-auto px-4">
                    <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-white uppercase italic mb-2 md:mb-4">All Products</h1>
                    <p className="text-text-secondary text-sm md:text-base mb-6">Explore our professional grade collection.</p>

                    {/* Top Search Bar */}
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                        <Input
                            placeholder="Search by product name or brand..."
                            className="pl-12 h-12 text-base bg-dark/50 border-primary/30 focus:border-accent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filter Sidebar (Desktop) */}
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        {filterContent}
                    </aside>

                    {/* Mobile Filter Button */}
                    <div className="md:hidden flex gap-4 mb-6">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 gap-2 border-primary/30 font-bold uppercase italic"
                            onClick={() => setShowMobileFilters(true)}
                        >
                            <Filter className="h-4 w-4" /> Filter & Sort
                            {hasActiveFilters && <span className="ml-1 w-2 h-2 bg-accent rounded-full" />}
                        </Button>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {/* Sort / Results Count (Desktop) */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-text-secondary text-xs sm:text-sm font-numeric tracking-wider">
                                <strong className="text-white">{filteredProducts.length}</strong> PRODUCTS FOUND
                            </span>
                            <div className="hidden md:block relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs gap-1 border border-primary/20"
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                >
                                    {sortOptions.find(o => o.value === sortBy)?.label} <ChevronDown className="h-3 w-3" />
                                </Button>
                                {showSortDropdown && (
                                    <div className="absolute right-0 top-full mt-1 bg-[#0A1A13] border border-[#1A4D35] py-1 z-10 min-w-[160px] shadow-2xl">
                                        {sortOptions.map(option => (
                                            <button
                                                key={option.value}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-primary/20 transition-colors ${sortBy === option.value ? 'text-accent' : 'text-text-secondary'}`}
                                                onClick={() => {
                                                    setSortBy(option.value);
                                                    setShowSortDropdown(false);
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-accent" />
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-lg">
                                <Search className="h-12 w-12 mx-auto text-white/10 mb-4" />
                                <p className="text-text-secondary mb-4">No products found matching your criteria.</p>
                                {hasActiveFilters && (
                                    <Button variant="neon" size="sm" onClick={clearFilters}>
                                        Clear All Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!isLoading && filteredProducts.length > 0 && (
                            <div className="mt-12 flex justify-center space-x-2">
                                <Button variant="outline" size="sm" className="h-10 w-10 p-0" disabled>&larr;</Button>
                                <Button variant="neon" size="sm" className="h-10 w-10 p-0 font-bold">1</Button>
                                <Button variant="outline" size="sm" className="h-10 w-10 p-0">&rarr;</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Drawer */}
            <div className={cn(
                "fixed inset-0 z-50 md:hidden transition-all duration-300",
                showMobileFilters ? "visible" : "invisible"
            )}>
                <div
                    className={cn(
                        "absolute inset-0 bg-dark/80 backdrop-blur-sm transition-opacity duration-300",
                        showMobileFilters ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => setShowMobileFilters(false)}
                />
                <div className={cn(
                    "absolute bottom-0 inset-x-0 bg-[#0F2A1E] border-t border-[#1A4D35] p-6 rounded-t-2xl max-h-[85vh] overflow-y-auto transition-transform duration-300 ease-out",
                    showMobileFilters ? "translate-y-0" : "translate-y-full"
                )}>
                    <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" onClick={() => setShowMobileFilters(false)} />
                    {filterContent}
                    <Button
                        variant="neon"
                        className="w-full h-12 mt-8 font-bold uppercase italic"
                        onClick={() => setShowMobileFilters(false)}
                    >
                        Tampilkan {filteredProducts.length} Produk
                    </Button>
                </div>
            </div>

            <Footer />
        </main>
    );
}
