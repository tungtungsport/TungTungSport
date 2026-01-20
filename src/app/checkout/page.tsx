"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { ShoppingBag, Truck, CheckCircle, ArrowLeft, Banknote, Loader2, CreditCard, Package } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import { BCAPaymentInfo } from "@/components/payment/BCAPaymentInfo";
import { PaymentProofUpload } from "@/components/payment/PaymentProofUpload";

interface CheckoutItem {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    size?: string;
}

type PaymentMethod = 'COD' | 'BCA_TRANSFER';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { items: cartItems, clearCart } = useCart();
    const { profile } = useUser();
    const [isComplete, setIsComplete] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
    const [bcaVirtualAccount, setBcaVirtualAccount] = useState<string>("");
    const [estimatedDeliveryHours, setEstimatedDeliveryHours] = useState<number | null>(null);

    // Payment method state
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
    const [showPaymentProof, setShowPaymentProof] = useState(false);

    // Shipping method state
    type ShippingMethod = 'TOKO' | 'JNE' | 'JNT' | 'SICEPAT';
    const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('TOKO');

    const shippingOptions = [
        { id: 'TOKO' as ShippingMethod, name: 'Pengiriman Toko', price: 15000, estimate: '2-8 jam' },
        { id: 'JNE' as ShippingMethod, name: 'JNE Regular', price: 20000, estimate: '1-3 hari' },
        { id: 'JNT' as ShippingMethod, name: 'J&T Express', price: 18000, estimate: '1-3 hari' },
        { id: 'SICEPAT' as ShippingMethod, name: 'SiCepat REG', price: 17000, estimate: '1-4 hari' },
    ];

    const selectedShipping = shippingOptions.find(s => s.id === shippingMethod) || shippingOptions[0];

    // Determine checkout type
    const isDirect = searchParams.get('direct') === 'true';
    const selectedParam = searchParams.get('selected');

    // Get items to checkout (direct product, selected cart items, or all cart items)
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
        } else if (selectedParam) {
            // Selected items from cart
            try {
                const selectedKeys = JSON.parse(decodeURIComponent(selectedParam)) as Array<{ id: string, size?: string }>;
                const selectedItems = cartItems.filter(item =>
                    selectedKeys.some(key => key.id === item.id && key.size === item.size)
                );
                setCheckoutItems(selectedItems);
            } catch (e) {
                console.error('Failed to parse selected items:', e);
                setCheckoutItems(cartItems);
            }
        } else {
            // Cart checkout - use all cart items
            setCheckoutItems(cartItems);
        }
    }, [isDirect, selectedParam, searchParams, cartItems]);

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

    const formatETA = (hours: number) => {
        const arrivalDate = new Date();
        arrivalDate.setHours(arrivalDate.getHours() + hours);

        return arrivalDate.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
            const shippingCost = selectedShipping.price;
            const finalTotal = total + shippingCost;

            // Prepare items for database
            const orderItems = checkoutItems.map(item => ({
                product_id: item.id,
                product_name: item.name,
                product_image: item.image,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity,
                size: item.size || null
            }));

            console.log("Creating order with data:", {
                customer_id: profile.id,
                payment_method: paymentMethod,
                courier: selectedShipping.name,
                subtotal: total,
                shipping_cost: shippingCost,
                total: finalTotal
            });

            // Create order with payment method - let database set default status
            const orderData = {
                customer_id: profile.id,
                payment_method: paymentMethod,
                courier: selectedShipping.name,
                subtotal: total,
                shipping_cost: shippingCost,
                total: finalTotal,
                shipping_address: `${name} | ${phone} | ${address}`
            };

            console.log("Inserting order...");
            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert(orderData)
                .select()
                .single();

            console.log("Order insert result:", { newOrder, orderError });

            if (orderError) {
                console.error("Order creation error:", orderError);
                throw new Error(orderError.message || JSON.stringify(orderError));
            }

            // Insert order items
            const orderItemsWithOrderId = orderItems.map(item => ({
                ...item,
                order_id: newOrder.id
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItemsWithOrderId);

            if (itemsError) {
                console.error("Order items error:", itemsError);
                throw new Error(itemsError.message || JSON.stringify(itemsError));
            }

            // Remove purchased items from cart
            if (!isDirect) {
                // Remove only the items that were checked out
                for (const item of checkoutItems) {
                    await supabase
                        .from('cart_items')
                        .delete()
                        .eq('user_id', profile.id)
                        .eq('product_id', item.id);
                }
            }

            setCreatedOrderId(newOrder.id);
            setBcaVirtualAccount(newOrder.bca_virtual_account || "");
            setEstimatedDeliveryHours(newOrder.estimated_delivery_hours || null);

            // If BCA payment, show payment proof upload
            if (paymentMethod === 'BCA_TRANSFER') {
                setShowPaymentProof(true);
            } else {
                // COD - show success immediately
                setIsComplete(true);
            }
        } catch (err: any) {
            console.error("Checkout error:", err);
            setError("Gagal membuat pesanan: " + (err.message || "Unknown error"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleUploadSuccess = () => {
        setIsComplete(true);
    };

    if (isComplete) {
        return (
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-[60vh]">
                <CheckCircle className="h-20 w-20 text-success mb-6" />
                <h1 className="font-heading text-4xl md:text-5xl text-white uppercase italic mb-4">Pesanan Berhasil!</h1>
                <p className="text-text-secondary text-lg mb-4 max-w-md">
                    {paymentMethod === 'BCA_TRANSFER'
                        ? "Terima kasih! Bukti pembayaran Anda sudah diterima. Admin akan memverifikasi dalam 1x24 jam."
                        : "Terima kasih atas pesanan Anda. Pesanan akan segera diproses!"
                    }
                </p>

                {estimatedDeliveryHours && (
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-8 max-w-sm w-full">
                        <p className="text-accent text-xs uppercase font-bold mb-1 flex items-center justify-center gap-2">
                            <Truck className="h-4 w-4" /> Estimasi Kedatangan
                        </p>
                        <p className="text-white font-bold">{formatETA(estimatedDeliveryHours)}</p>
                        <p className="text-text-secondary text-[10px] mt-1 italic">Waktu dapat berubah sesuai kondisi kurir di lapangan</p>
                    </div>
                )}
                <div className="flex gap-4">
                    <Link href="/orders">
                        <Button variant="outline" size="lg">Lihat Pesanan</Button>
                    </Link>
                    <Link href="/products">
                        <Button variant="neon" size="lg">Lanjut Belanja</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Show payment proof upload after order created with BCA
    if (showPaymentProof && createdOrderId && bcaVirtualAccount) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Link href="/products" className="inline-flex items-center text-text-secondary hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Produk
                </Link>

                <h1 className="font-heading text-3xl md:text-4xl text-white uppercase italic mb-2">Transfer BCA</h1>
                <p className="text-text-secondary mb-8">Selesaikan pembayaran dan upload bukti transfer</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <BCAPaymentInfo
                        virtualAccount={bcaVirtualAccount}
                        amount={total + 25000}
                        orderId={createdOrderId}
                    />
                    <PaymentProofUpload
                        orderId={createdOrderId}
                        bcaVirtualAccount={bcaVirtualAccount}
                        amount={total + 25000}
                        onUploadSuccess={handleUploadSuccess}
                    />
                </div>
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

                    {/* Shipping Method Selection */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <h2 className="font-heading text-xl text-white uppercase flex items-center gap-2 mb-6">
                            <Package className="h-5 w-5 text-accent" /> Metode Pengiriman
                        </h2>
                        <div className="space-y-3">
                            {shippingOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${shippingMethod === option.id
                                        ? 'border-accent bg-accent/10'
                                        : 'border-white/20 bg-white/5 hover:border-white/30'
                                        }`}
                                    onClick={() => setShippingMethod(option.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="shipping"
                                            checked={shippingMethod === option.id}
                                            onChange={() => setShippingMethod(option.id)}
                                            className="accent-accent w-4 h-4"
                                        />
                                        <div>
                                            <span className="text-white font-bold">{option.name}</span>
                                            <p className="text-text-secondary text-xs mt-0.5">Estimasi {option.estimate}</p>
                                        </div>
                                    </div>
                                    <span className="text-accent font-numeric font-bold">
                                        Rp {option.price.toLocaleString("id-ID")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <h2 className="font-heading text-xl text-white uppercase flex items-center gap-2 mb-6">
                            <Banknote className="h-5 w-5 text-accent" /> Metode Pembayaran
                        </h2>
                        <div className="space-y-3">
                            {/* COD Option */}
                            <div
                                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'COD'
                                    ? 'border-accent bg-accent/10'
                                    : 'border-white/20 bg-white/5 hover:border-white/30'
                                    }`}
                                onClick={() => setPaymentMethod('COD')}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                    className="accent-accent w-4 h-4"
                                />
                                <CreditCard className="h-5 w-5 text-white" />
                                <div className="flex-1">
                                    <span className="text-white font-bold">Cash on Delivery (COD)</span>
                                    <p className="text-text-secondary text-xs mt-1">Bayar langsung saat pesanan tiba</p>
                                </div>
                            </div>

                            {/* BCA Transfer Option */}
                            <div
                                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'BCA_TRANSFER'
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-white/20 bg-white/5 hover:border-white/30'
                                    }`}
                                onClick={() => setPaymentMethod('BCA_TRANSFER')}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'BCA_TRANSFER'}
                                    onChange={() => setPaymentMethod('BCA_TRANSFER')}
                                    className="accent-blue-500 w-4 h-4"
                                />
                                <div className="h-8 w-12 bg-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">BCA</span>
                                </div>
                                <div className="flex-1">
                                    <span className="text-white font-bold">Transfer Bank BCA</span>
                                    <p className="text-text-secondary text-xs mt-1">Bayar dengan transfer ke Virtual Account BCA</p>
                                </div>
                            </div>
                        </div>
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
                            <span>Ongkir ({selectedShipping.name})</span>
                            <span className="font-numeric">Rp {selectedShipping.price.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-white/10">
                            <span className="font-heading uppercase">Total</span>
                            <span className="font-numeric">Rp {(total + selectedShipping.price).toLocaleString("id-ID")}</span>
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
                            paymentMethod === 'COD' ? "Pesan Sekarang" : "Lanjut ke Pembayaran"
                        )}
                    </Button>

                    {paymentMethod === 'BCA_TRANSFER' && (
                        <p className="text-text-secondary text-xs text-center mt-3">
                            Anda akan diarahkan ke halaman pembayaran BCA
                        </p>
                    )}
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
