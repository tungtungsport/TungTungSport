import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input"; // I need to create Input too
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-dark border-t border-primary/20 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-primary border border-accent flex items-center justify-center transform -rotate-3">
                                <span className="font-heading font-bold text-accent">T</span>
                            </div>
                            <span className="font-heading font-bold text-xl tracking-tighter text-white">
                                TUNG TUNG <span className="text-accent">SPORT</span>
                            </span>
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            Premium futsal and football gear engineered for speed, grip, and control. Dominate the court with professional equipment.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="font-heading font-bold text-white uppercase tracking-wider mb-6">Shop</h4>
                        <ul className="space-y-3 text-sm text-text-secondary">
                            <li><Link href="/products?category=shoes" className="hover:text-accent transition-colors">Futsal Shoes</Link></li>
                            <li><Link href="/products?category=jerseys" className="hover:text-accent transition-colors">Jerseys</Link></li>
                            <li><Link href="/products?category=balls" className="hover:text-accent transition-colors">Balls</Link></li>
                            <li><Link href="/products?category=accessories" className="hover:text-accent transition-colors">Accessories</Link></li>
                            <li><Link href="/products?sale=true" className="text-danger font-bold hover:text-danger/80">Sale</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-heading font-bold text-white uppercase tracking-wider mb-6">Support</h4>
                        <ul className="space-y-3 text-sm text-text-secondary">
                            <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
                            <li><Link href="/shipping" className="hover:text-accent transition-colors">Shipping Info</Link></li>
                            <li><Link href="/returns" className="hover:text-accent transition-colors">Returns</Link></li>
                            <li><Link href="/size-guide" className="hover:text-accent transition-colors">Size Guide</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-heading font-bold text-white uppercase tracking-wider mb-6">Join the Club</h4>
                        <p className="text-text-secondary text-xs mb-4">Get exclusive offers and early access to new drops.</p>
                        <div className="flex space-x-2">
                            <Input
                                placeholder="ENTER EMAIL"
                                className="bg-black/20 border border-primary/30 text-white px-3 py-2 text-sm w-full focus:outline-none focus:border-accent font-heading placeholder:text-gray-600"
                            />
                            <Button variant="primary" size="sm" className="px-4">GO</Button>
                        </div>
                        <div className="flex space-x-4 mt-8">
                            <a href="#" className="text-text-secondary hover:text-white hover:bg-primary/20 p-2 rounded-full transition-all"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="text-text-secondary hover:text-white hover:bg-primary/20 p-2 rounded-full transition-all"><Instagram className="h-5 w-5" /></a>
                            <a href="#" className="text-text-secondary hover:text-white hover:bg-primary/20 p-2 rounded-full transition-all"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-text-secondary hover:text-white hover:bg-primary/20 p-2 rounded-full transition-all"><Youtube className="h-5 w-5" /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-text-secondary">
                    <p>&copy; 2026 Tung Tung Sport. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
