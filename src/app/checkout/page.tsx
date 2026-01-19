"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { ShoppingBag, Truck, CheckCircle, ArrowLeft, Banknote, Loader2 } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

interface CheckoutItem {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    size?: string;
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const { items: cartItems, total: cartTotal, clearCart } = useCart();
    const { profile } = useUser();
    const [isComplete, setIsComplete] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Determine if this is a direct checkout
    const isDirect = searchParams.get('direct') === 'true';

    // Get items to checkout (either direct product or cart items)
    const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);

    useEffect(() => {
        if (isDirect) {
            // Direct checkout - get product from URL params
            const directItem: CheckoutItem = {
                id: searchParams.get('productId') || '',
                name: searchParams.get('productName') || '',
                image: searchParams.get('productImage') || '',
                price: parseFloat(searchParams.get('productPrice') || '0'),
                quantity: parseInt(searchParams.get('quantity') || '1'),
                size: searchParams.get('size') || undefined
            };
            if (directItem.id) {
                setCheckoutItems([directItem]);
            }
        } else {
            // Cart checkout - use cart items
            setCheckoutItems(cartItems);
        }
    }, [isDirect, searchParams, cartItems]);

    const total = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Form state pre-filled with user data
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // Pre-fill form with user data on mount
    useEffect(() => {
        if (profile) {
            setName(profile.name || "");
            setPhone(profile.phone || "");
            setAddress(profile.address || "");
        }
    }, [profile]);

    const handleCompletePurchase = async () => {
        if (!profile) {
            setError("Silakan login terlebih dahulu.");
            return;
        }

        if (!name || !phone || !address) {
            setError("Silakan lengkapi informasi pengiriman.");
            return;
        }

        if (checkoutItems.length === 0) {
            setError("Tidak ada produk untuk dipesan.");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const shippingCost = 25000;
            const finalTotal = total + shippingCost;

            // Prepare items for RPC (clean object)
            const orderItems = checkoutItems.map(item => ({
                product_id: item.id,
                product_name: item.name,
                product_image: item.image,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity,
                size: item.size
            }));

            // Call Atomic RPC
            const { data: orderId, error: rpcError } = await supabase.rpc('create_order_atomic', {
                p_customer_id: profile.id,
                p_subtotal: total,
                p_shipping_cost: shippingCost,
                p_total: finalTotal,
                p_shipping_address: `${name} | ${phone} | ${address}`,
                p_items: orderItems
            });

            if (rpcError) throw rpcError;

            // Clear cart only if this was a cart checkout
            if (!isDirect) {
                clearCart();
            }
            setIsComplete(true);
        } catch (err: any) {
            console.error("Checkout error:", err);
            setError("Gagal membuat pesanan: " + (err.message || "Unknown error"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isComplete) {
        return (
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-[60vh]">
                <CheckCircle className="h-20 w-20 text-success mb-6" />
                <h1 className="font-heading text-4xl md:text-5xl text-white uppercase italic mb-4">Pesanan Berhasil!</h1>
                <p className="text-text-secondary text-lg mb-8 max-w-md">
                    Terima kasih atas pesanan Anda. Pesanan akan segera diproses!
                </p>
                <Link href="/products">
                    <Button variant="neon" size="lg">Lanjut Belanja</Button>
                </Link>
            </div>
        );
    }

    if (checkoutItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-[60vh]">
                <ShoppingBag className="h-20 w-20 text-primary/50 mb-6" />
                <h1 className="font-heading text-4xl text-white uppercase italic mb-4">Keranjang Kosong</h1>
                <p className="text-text-secondary mb-8">Tambahkan produk ke keranjang sebelum checkout.</p>
                <Link href="/products">
                    <Button variant="neon" size="lg">Lihat Produk</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/products" className="inline-flex items-center text-text-secondary hover:text-white mb-6 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Produk
            </Link>

            <h1 className="font-heading text-3xl md:text-4xl text-white uppercase italic mb-2">Checkout</h1>
            {isDirect && (
                <p className="text-accent text-sm mb-6">Direct checkout - hanya produk ini yang akan dipesan</p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shipping Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <h2 className="font-heading text-xl text-white uppercase flex items-center gap-2 mb-6">
                            <Truck className="h-5 w-5 text-accent" /> Informasi Pengiriman
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-white text-sm font-bold uppercase">Nama Lengkap</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-white text-sm font-bold uppercase">Nomor Telepon</label>
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Masukkan telepon" maxLength={15} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-white text-sm font-bold uppercase">Alamat Lengkap</label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Alamat pengiriman" />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method - COD Only */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <h2 className="font-heading text-xl text-white uppercase flex items-center gap-2 mb-6">
                            <Banknote className="h-5 w-5 text-accent" /> Metode Pembayaran
                        </h2>
                        <div className="flex items-center gap-3 p-4 border border-accent rounded bg-accent/10">
                            <input type="radio" name="payment" defaultChecked className="accent-accent w-4 h-4" readOnly />
                            <span className="text-white font-bold">Cash on Delivery (COD)</span>
                        </div>
                        <p className="text-text-secondary text-sm mt-3">Bayar langsung saat pesanan tiba di alamat Anda.</p>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg h-fit">
                    <h2 className="font-heading text-xl text-white uppercase mb-6">Ringkasan Pesanan</h2>

                    <div className="space-y-4 mb-6">
                        {checkoutItems.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex gap-3">
                                <div className="relative w-16 h-16 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                                    <NextImage src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-heading line-clamp-1">{item.name}</p>
                                    <div className="flex gap-4">
                                        <p className="text-text-secondary text-xs">Qty: {item.quantity}</p>
                                        {item.size && (
                                            <p className="text-text-secondary text-xs">Size: {item.size}</p>
                                        )}
                                    </div>
                                    <p className="text-accent font-numeric font-bold text-sm">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/10 pt-4 space-y-2">
                        <div className="flex justify-between text-text-secondary text-sm">
                            <span>Subtotal</span>
                            <span className="font-numeric">Rp {total.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-text-secondary text-sm">
                            <span>Ongkir</span>
                            <span className="font-numeric">Rp 25,000</span>
                        </div>
                        <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-white/10">
                            <span className="font-heading uppercase">Total</span>
                            <span className="font-numeric">Rp {(total + 25000).toLocaleString("id-ID")}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded">
                            {error}
                        </div>
                    )}

                    <Button
                        variant="neon"
                        className="w-full mt-6 text-lg"
                        size="lg"
                        onClick={handleCompletePurchase}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            "Pesan Sekarang"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <main className="min-h-screen bg-dark">
            <Navbar />
            <Suspense fallback={
                <div className="container mx-auto px-4 py-32 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-accent" />
                </div>
            }>
                <CheckoutContent />
            </Suspense>
            <Footer />
        </main>
    );
}
