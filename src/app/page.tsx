"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard, Product } from "@/components/ui/product-card";
import { getProducts } from "@/lib/products";
import { ArrowRight, Trophy, Zap, Shield, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const products = await getProducts();
      // Get first 4 products as featured
      setFeaturedProducts(products.slice(0, 4));
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-dark">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:h-[85vh] w-full overflow-hidden flex items-center">
        {/* Background Turf Texture Effect */}
        <div className="absolute inset-0 bg-turf opacity-40 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/80 to-transparent z-10"></div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>

        <div className="container mx-auto px-4 relative z-20 pt-20">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-accent text-dark font-bold uppercase tracking-widest text-xs mb-4 transform -skew-x-12">New Collection 2026</span>
            <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-white leading-none mb-4 md:mb-6 italic uppercase">
              Dominate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-success">The Court</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl max-w-xl mb-10 font-body">
              Premium futsal and football gear engineered for speed, grip, and control. Elevate your game with Tung Tung Sport.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/products">
                <Button variant="neon" size="lg" className="text-lg px-10 w-full sm:w-auto">
                  Shop Products <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Image Mockup (Floating Cleat) */}
        <div className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2 h-full z-10 pointer-events-none">
          <div className="w-full h-full relative">
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-16 border-b border-primary/20 bg-dark">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4 p-6 bg-white/5 border border-white/10 hover:border-accent transition-colors">
            <Zap className="h-10 w-10 text-accent flex-shrink-0" />
            <div>
              <h3 className="text-white font-heading text-xl uppercase italic mb-2">Maximum Performance</h3>
              <p className="text-text-secondary text-sm">Engineered materials for superior agility and speed on the pitch.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-6 bg-white/5 border border-white/10 hover:border-accent transition-colors">
            <Shield className="h-10 w-10 text-accent flex-shrink-0" />
            <div>
              <h3 className="text-white font-heading text-xl uppercase italic mb-2">Pro Durability</h3>
              <p className="text-text-secondary text-sm">Built to withstand the toughest matches and roughest surfaces.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-6 bg-white/5 border border-white/10 hover:border-accent transition-colors">
            <Trophy className="h-10 w-10 text-accent flex-shrink-0" />
            <div>
              <h3 className="text-white font-heading text-xl uppercase italic mb-2">Match Ready</h3>
              <p className="text-text-secondary text-sm">Trust by local champions. Gear that delivers when it counts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-heading font-bold text-4xl md:text-5xl text-white uppercase italic">Featured Gear</h2>
              <div className="h-1 w-24 bg-accent mt-4 transform -skew-x-12"></div>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="hidden md:flex">View All Products <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-accent" />
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-secondary">No products available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link href="/products" className="block">
              <Button variant="outline" className="w-full">View All Products</Button>
            </Link>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl z-0"></div>
      </section>

      {/* Promo Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-turf opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-heading font-bold text-5xl md:text-7xl text-white uppercase italic mb-6">Unleash Your Potential</h2>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-10">
            Join thousands of players who trust Tung Tung Sport for their match-day essentials.
          </p>
          <Link href="/products">
            <Button variant="neon" size="lg" className="transform scale-110 hover:scale-125 transition-transform">
              Start Shopping Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
