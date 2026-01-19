import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getProductById, toDisplayProduct } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductDetailActions } from "./ProductDetailActions";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const dbProduct = await getProductById(id);

    if (!dbProduct) {
        notFound();
    }

    const product = toDisplayProduct(dbProduct);

    return (
        <main className="min-h-screen bg-dark">
            <Navbar />

            <div className="container mx-auto px-4 py-6 md:py-8">
                <Link href="/products" className="inline-flex items-center text-text-secondary hover:text-white mb-4 md:mb-6 transition-colors text-sm md:text-base">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden border border-white/10">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                        {product.isNew && (
                            <span className="absolute top-4 left-4 bg-accent text-dark text-xs md:text-sm font-bold px-2 md:px-3 py-1 uppercase tracking-wider">New Drop</span>
                        )}
                    </div>

                    {/* Product Details */}
                    <div>
                        <h2 className="text-accent font-bold uppercase tracking-widest text-xs md:text-sm mb-2">{product.brand}</h2>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading text-white uppercase italic mb-4">{product.name}</h1>

                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-6">
                            <span className="text-2xl md:text-3xl font-numeric font-bold text-white">Rp {product.price.toLocaleString('id-ID')}</span>
                            {product.originalPrice && (
                                <span className="text-lg md:text-xl font-numeric text-text-secondary line-through">Rp {product.originalPrice.toLocaleString('id-ID')}</span>
                            )}
                        </div>

                        <div className="prose prose-invert max-w-none mb-6 md:mb-8">
                            <p className="text-text-secondary text-sm md:text-base">
                                Experience superior control and speed with the {product.name}.
                                Designed for the modern player who demands agility and precision.
                            </p>
                            <ul className="text-text-secondary mt-4 space-y-2 list-disc pl-5 text-sm md:text-base">
                                <li>Premium synthetic upper for lightweight feel.</li>
                                <li>Optimized stud configuration for traction.</li>
                                <li>Cushioned insole for comfort during match play.</li>
                            </ul>
                        </div>

                        {/* Client-side actions */}
                        <ProductDetailActions product={product} />
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}


