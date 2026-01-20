"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingCart, Menu, User, Heart, X, LogIn, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
];

export function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { openCart, itemCount: cartCount } = useCart();
    const { openFavorites, itemCount: favCount } = useFavorites();
    const { isLoggedIn, openAuthPopup } = useAuth();

    const handleFavoritesClick = () => {
        if (!isLoggedIn) {
            openAuthPopup();
            return;
        }
        openFavorites();
    };

    const handleCartClick = () => {
        if (!isLoggedIn) {
            openAuthPopup();
            return;
        }
        openCart();
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b-2 border-primary/20 bg-dark/95 backdrop-blur supports-[backdrop-filter]:bg-dark/60">
            <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className="h-8 w-8 md:h-10 md:w-10 bg-primary border-2 border-accent flex items-center justify-center transform group-hover:rotate-45 transition-transform duration-300">
                        <span className="font-heading font-bold text-lg md:text-xl text-accent -rotate-45 group-hover:-rotate-45">T</span>
                    </div>
                    <span className="font-heading font-bold text-lg md:text-2xl tracking-tighter text-white hidden sm:inline">
                        TUNG TUNG <span className="text-accent">SPORT</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "font-heading font-bold uppercase tracking-wide text-sm transition-colors hover:text-accent",
                                pathname === item.href ? "text-accent border-b-2 border-accent" : "text-text-secondary"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* Favorites Button */}
                    <Button variant="ghost" size="icon" className="relative" onClick={handleFavoritesClick}>
                        <Heart className="h-5 w-5" />
                        {favCount > 0 && isLoggedIn && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger text-white text-[10px] font-bold flex items-center justify-center rounded-full">{favCount}</span>
                        )}
                    </Button>

                    {/* Cart Button */}
                    <Button variant="ghost" size="icon" className="relative" onClick={handleCartClick}>
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && isLoggedIn && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-dark text-[10px] font-bold flex items-center justify-center rounded-full">{cartCount}</span>
                        )}
                    </Button>

                    {/* Account / Login (Desktop only) */}
                    {isLoggedIn ? (
                        <Link href="/profile" className="hidden md:block">
                            <Button variant="outline" size="sm" className="gap-2">
                                <User className="h-4 w-4 mb-0.5" />
                                <span>Account</span>
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login" className="hidden md:block">
                            <Button variant="neon" size="sm" className="gap-2">
                                <LogIn className="h-4 w-4" />
                                <span>Masuk</span>
                            </Button>
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-white p-1"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav - Slide-in Drawer */}
            <div className={cn(
                "fixed inset-0 z-50 md:hidden transition-all duration-300",
                isMobileMenuOpen ? "visible" : "invisible"
            )}>
                {/* Backdrop */}
                <div
                    className={cn(
                        "absolute inset-0 bg-dark/80 backdrop-blur-sm transition-opacity duration-300",
                        isMobileMenuOpen ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Menu Content */}
                <div className={cn(
                    "absolute top-0 right-0 h-full w-[280px] bg-dark border-l border-primary/20 p-6 flex flex-col transition-transform duration-300 ease-out",
                    isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="flex justify-between items-center mb-10">
                        <span className="font-heading font-bold text-accent italic">MENU</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-1 hover:text-accent transition-colors">
                            <X className="h-7 w-7" />
                        </button>
                    </div>

                    <nav className="flex flex-col space-y-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "font-heading font-bold uppercase text-2xl transition-all hover:pl-2",
                                    pathname === item.href ? "text-accent" : "text-white"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto space-y-4 pt-6 border-t border-primary/20">
                        {isLoggedIn ? (
                            <div className="space-y-4">
                                <Link
                                    href="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center text-text-secondary font-heading font-bold uppercase hover:text-white transition-colors"
                                >
                                    <User className="h-5 w-5 mr-3 text-accent" /> Profile
                                </Link>
                                <Link
                                    href="/orders"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center text-text-secondary font-heading font-bold uppercase hover:text-white transition-colors"
                                >
                                    <ShoppingCart className="h-5 w-5 mr-3 text-accent" /> Pesanan Saya
                                </Link>
                                <Link
                                    href="/returns/my-returns"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center text-text-secondary font-heading font-bold uppercase hover:text-white transition-colors"
                                >
                                    <RotateCcw className="h-5 w-5 mr-3 text-accent" /> Status Pengembalian
                                </Link>
                            </div>
                        ) : (
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="neon" className="w-full h-12 gap-2 text-base font-bold uppercase italic">
                                    <LogIn className="h-5 w-5" />
                                    <span>Masuk Sekarang</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
