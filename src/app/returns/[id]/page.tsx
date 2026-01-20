"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, RotateCcw, Check, Package } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { useParams, useRouter } from "next/navigation";

interface OrderItem {
    id: string;
    product_id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    unit_price: number;
    size?: string;
}

interface Order {
    id: string;
    order_number: string;
    status: string;
    order_items: OrderItem[];
}

export default function ReturnRequestPage() {
    const { profile } = useUser();
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [reason, setReason] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (profile && orderId) {
            fetchOrder();
        }
    }, [profile, orderId]);

    const fetchOrder = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    order_number,
                    status,
                    order_items (*)
                `)
                .eq('id', orderId)
                .eq('customer_id', profile?.id)
                .single();

            if (error) throw error;

            if (data.status !== 'TELAH_TIBA') {
                setError('Pengembalian hanya dapat dilakukan saat pesanan berstatus "Telah Tiba"');
            } else {
                setOrder(data);
            }
        } catch (err) {
            console.error("Error fetching order:", err);
            setError("Pesanan tidak ditemukan");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleItemSelection = (itemId: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const selectAllItems = () => {
        if (order) {
            const allIds = order.order_items.map(item => item.id);
            setSelectedItems(new Set(allIds));
        }
    };

    const clearSelection = () => {
        setSelectedItems(new Set());
    };

    const handleSubmit = async () => {
        if (selectedItems.size === 0) {
            setError("Pilih minimal satu item untuk dikembalikan");
            return;
        }
        if (!reason.trim()) {
            setError("Masukkan alasan pengembalian");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            // Get selected items details
            const selectedItemsList = order?.order_items.filter(item => selectedItems.has(item.id)) || [];

            const returnData = {
                order_id: orderId,
                customer_id: profile?.id,
                reason: reason.trim(),
                items: selectedItemsList.map(item => ({
                    order_item_id: item.id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    size: item.size
                })),
                status: 'PENDING'
            };

            console.log("Submitting return data:", returnData);

            // Create return request
            const { data: returnResult, error: returnError } = await supabase
                .from('returns')
                .insert(returnData)
                .select();

            console.log("Return insert result:", { returnResult, returnError });

            if (returnError) {
                console.error("Return error details:", {
                    message: returnError.message,
                    details: returnError.details,
                    hint: returnError.hint,
                    code: returnError.code
                });
                throw new Error(returnError.message || "Failed to create return request");
            }

            // Update order status to PENGEMBALIAN
            const { error: orderError } = await supabase
                .from('orders')
                .update({ status: 'PENGEMBALIAN' })
                .eq('id', orderId);

            if (orderError) throw orderError;

            setSuccess(true);
        } catch (err: any) {
            console.error("Error submitting return:", err);
            const errorMessage = err?.message || err?.error_description || JSON.stringify(err) || "Gagal mengajukan pengembalian";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-dark">
                <Navbar />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-lg max-w-md mx-auto">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="h-8 w-8 text-green-400" />
                        </div>
                        <h1 className="font-heading text-2xl text-white uppercase mb-2">Pengajuan Berhasil!</h1>
                        <p className="text-text-secondary mb-6">
                            Permintaan pengembalian Anda telah dikirim. Tim kami akan segera memprosesnya.
                        </p>
                        <Link href="/orders">
                            <Button variant="neon" className="w-full">Kembali ke Riwayat Pesanan</Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-dark">
            <Navbar />

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/orders">
                        <Button variant="ghost" size="sm" className="text-text-secondary hover:text-white">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
                        </Button>
                    </Link>
                    <h1 className="font-heading text-2xl text-white uppercase">
                        <RotateCcw className="inline-block h-6 w-6 mr-2 text-pink-400" />
                        Ajukan Pengembalian
                    </h1>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-accent" />
                    </div>
                ) : error && !order ? (
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg text-center">
                        <p className="text-red-400">{error}</p>
                        <Link href="/orders" className="mt-4 inline-block">
                            <Button variant="outline">Kembali ke Pesanan</Button>
                        </Link>
                    </div>
                ) : order ? (
                    <div className="space-y-6">
                        {/* Order Info */}
                        <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                            <p className="text-text-secondary text-xs uppercase font-bold">ID Pesanan</p>
                            <p className="text-white font-numeric font-bold text-lg">{order.order_number}</p>
                        </div>

                        {/* Select Items */}
                        <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-heading text-white uppercase">Pilih Item untuk Dikembalikan</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={selectAllItems}
                                        className="text-xs text-accent hover:underline"
                                    >
                                        Pilih Semua
                                    </button>
                                    <span className="text-text-secondary">|</span>
                                    <button
                                        onClick={clearSelection}
                                        className="text-xs text-text-secondary hover:text-white"
                                    >
                                        Batal Pilih
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {order.order_items.map((item) => {
                                    const isSelected = selectedItems.has(item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleItemSelection(item.id)}
                                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${isSelected
                                                ? 'bg-pink-500/10 border-pink-500/50'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            {/* Checkbox */}
                                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 ${isSelected
                                                ? 'bg-pink-500 border-pink-500'
                                                : 'border-white/30'
                                                }`}>
                                                {isSelected && <Check className="h-3 w-3 text-white" />}
                                            </div>

                                            {/* Image */}
                                            <div className="relative w-14 h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                                {item.product_image ? (
                                                    <NextImage src={item.product_image} alt={item.product_name} fill className="object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-gray-600" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white text-sm font-heading truncate">{item.product_name}</h4>
                                                <div className="flex gap-2 text-text-secondary text-xs">
                                                    <span>Qty: {item.quantity}</span>
                                                    {item.size && <span>• Size: {item.size}</span>}
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <span className="text-accent font-numeric font-bold text-sm">
                                                Rp {(item.unit_price * item.quantity).toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="text-text-secondary text-xs mt-3">
                                {selectedItems.size} dari {order.order_items.length} item dipilih
                            </p>
                        </div>

                        {/* Reason */}
                        <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                            <h2 className="font-heading text-white uppercase mb-3">Alasan Pengembalian</h2>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Jelaskan alasan pengembalian (misal: ukuran tidak sesuai, barang rusak, dll.)"
                                className="w-full bg-dark border border-white/20 rounded-lg p-3 text-white text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent resize-none"
                                rows={4}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            variant="neon"
                            className="w-full text-lg"
                            onClick={handleSubmit}
                            disabled={isSubmitting || selectedItems.size === 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <RotateCcw className="mr-2 h-5 w-5" />
                                    Ajukan Pengembalian ({selectedItems.size} item)
                                </>
                            )}
                        </Button>

                        <p className="text-text-secondary text-xs text-center">
                            Dengan mengajukan pengembalian, Anda menyetujui kebijakan pengembalian kami.
                            Tim kami akan menghubungi Anda dalam 1x24 jam.
                        </p>
                    </div>
                ) : null}
            </div>

            <Footer />
        </main>
    );
}
