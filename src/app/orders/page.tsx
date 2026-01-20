"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Loader2, XCircle, CreditCard, CheckCircle, RotateCcw, Star, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import { RatingModal } from "@/components/orders/RatingModal";

// Updated status tabs for new 9-status system (with MENUNGGU_KONFIRMASI and TELAH_TIBA)
const statusTabs: { key: string; label: string }[] = [
    { key: "ALL", label: "Semua" },
    { key: "BELUM_BAYAR", label: "Belum Bayar" },
    { key: "MENUNGGU_KONFIRMASI", label: "Menunggu Konfirmasi" },
    { key: "DIKONFIRMASI", label: "Dikonfirmasi" },
    { key: "DIKEMAS", label: "Dikemas" },
    { key: "DIKIRIM", label: "Dikirim" },
    { key: "TELAH_TIBA", label: "Telah Tiba" },
    { key: "SELESAI", label: "Selesai" },
    { key: "DIBATALKAN", label: "Dibatalkan" }
];

// Map DB status to UI status labels
const dbStatusToLabel: Record<string, string> = {
    "BELUM_BAYAR": "Belum Bayar",
    "MENUNGGU_KONFIRMASI": "Menunggu Konfirmasi Pembayaran",
    "DIKONFIRMASI": "Pembayaran Dikonfirmasi",
    "DIKEMAS": "Sedang Dikemas",
    "DIKIRIM": "Dalam Pengiriman",
    "TELAH_TIBA": "Telah Tiba",
    "SELESAI": "Selesai",
    "PENGEMBALIAN": "Pengembalian",
    "DIBATALKAN": "Dibatalkan"
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "BELUM_BAYAR":
            return "bg-orange-500";
        case "MENUNGGU_KONFIRMASI":
            return "bg-amber-500";
        case "DIKONFIRMASI":
            return "bg-purple-500";
        case "DIKEMAS":
            return "bg-yellow-500";
        case "DIKIRIM":
            return "bg-cyan-500";
        case "TELAH_TIBA":
            return "bg-blue-500";
        case "SELESAI":
            return "bg-success";
        case "PENGEMBALIAN":
            return "bg-pink-500";
        case "DIBATALKAN":
            return "bg-danger";
        default:
            return "bg-gray-500";
    }
};

// Check if order can be cancelled (only before shipped)
const canCancelOrder = (status: string) => {
    return status === "BELUM_BAYAR" || status === "MENUNGGU_KONFIRMASI" || status === "DIKONFIRMASI" || status === "DIKEMAS";
};

// Check if order needs payment proof
const needsPaymentProof = (status: string, paymentMethod: string) => {
    return status === "BELUM_BAYAR" && paymentMethod === "BCA_TRANSFER";
};

// Check if order can be confirmed by customer
const canConfirmOrder = (status: string) => {
    return status === "TELAH_TIBA";
};

// Check if order can request return (only for TELAH_TIBA and within 12 hours)
const canRequestReturn = (status: string, arrivedAt?: string) => {
    if (status !== "TELAH_TIBA") return false;
    if (!arrivedAt) return false;

    const arrived = new Date(arrivedAt).getTime();
    const now = new Date().getTime();
    const twelveHours = 12 * 60 * 60 * 1000;

    return (now - arrived) < twelveHours;
};

const getETA = (createdAt: string, hours: number) => {
    const arrivalDate = new Date(createdAt);
    arrivalDate.setHours(arrivalDate.getHours() + hours);
    return arrivalDate;
};

const formatETA = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export default function OrdersPage() {
    const { profile } = useUser();
    const [orders, setOrders] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");
    const [isLoading, setIsLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [selectedOrderForRating, setSelectedOrderForRating] = useState<any | null>(null);

    useEffect(() => {
        if (profile) {
            fetchOrders();
        }
    }, [profile]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            // First, check and update any orders that need auto-status change
            await supabase.rpc('check_and_update_order_delivery_status');

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (*),
                    ratings (*)
                `)
                .eq('customer_id', profile?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmOrderReceived = async (orderId: string) => {
        setConfirmingId(orderId);
        try {
            const { error } = await supabase.rpc('confirm_order_received', {
                p_order_id: orderId,
                p_customer_id: profile?.id
            });

            if (error) throw error;

            // Update local state
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: 'SELESAI', customer_confirmed: true } : o
            ));
        } catch (err) {
            console.error("Error confirming order:", err);
            alert('Gagal mengkonfirmasi pesanan');
        } finally {
            setConfirmingId(null);
        }
    };

    const cancelOrder = async (orderId: string) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;

        setCancellingId(orderId);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'DIBATALKAN' })
                .eq('id', orderId)
                .eq('customer_id', profile?.id); // Security: only own orders

            if (error) throw error;

            // Update local state
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: 'DIBATALKAN' } : o
            ));
        } catch (err) {
            console.error("Error cancelling order:", err);
            alert('Gagal membatalkan pesanan');
        } finally {
            setCancellingId(null);
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.order_items.some((item: any) => item.product_name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = activeTab === "ALL" || order.status === activeTab;

        return matchesSearch && matchesStatus;
    });

    // Calculate time remaining for auto-complete (24 hours from arrival)
    const getAutoCompleteCountdown = (arrivedAt: string) => {
        if (!arrivedAt) return null;
        const arrived = new Date(arrivedAt);
        const deadline = new Date(arrived.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        const remaining = deadline.getTime() - now.getTime();

        if (remaining <= 0) return "Akan dikonfirmasi otomatis";

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        return `Auto-selesai dalam ${hours}j ${minutes}m`;
    };

    return (
        <main className="min-h-screen bg-dark text-white">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <h1 className="font-heading text-3xl md:text-4xl text-white uppercase italic mb-6">
                    <Package className="inline-block h-8 w-8 mr-2 text-accent" /> Riwayat Pesanan
                </h1>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    <Input
                        placeholder="Cari pesanan atau produk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 text-base text-white bg-white/5 border-white/10"
                    />
                </div>

                {/* Status Tabs - Scrollable on mobile */}
                <div className="flex gap-2 mb-8 border-b border-primary/20 pb-4 overflow-x-auto">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "px-4 py-2 text-sm font-bold uppercase rounded-full transition-all whitespace-nowrap flex-shrink-0",
                                activeTab === tab.key
                                    ? "bg-accent text-dark"
                                    : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-accent" />
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 mx-auto text-primary/50 mb-4" />
                            <p className="text-text-secondary">Tidak ada pesanan ditemukan.</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-lg hover:border-accent/50 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2">
                                    <div>
                                        <span className="text-text-secondary text-xs uppercase font-bold">ID Pesanan</span>
                                        <p className="text-white font-numeric font-bold">{order.order_number}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Payment Method Badge */}
                                        <span className={`px-2 py-1 text-xs font-bold rounded ${order.payment_method === 'BCA_TRANSFER'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            {order.payment_method === 'BCA_TRANSFER' ? 'BCA Transfer' : 'COD'}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-text-secondary text-xs uppercase font-bold">Tanggal</span>
                                            <p className="text-white text-sm">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative h-16 w-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                        {order.order_items[0]?.product_image ? (
                                            <NextImage src={order.order_items[0].product_image} alt={order.order_items[0].product_name} fill className="object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 uppercase font-heading">
                                                IMG
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-heading text-sm uppercase truncate">{order.order_items[0]?.product_name}</h4>
                                        <div className="flex gap-3">
                                            {order.order_items[0]?.size && (
                                                <span className="text-text-secondary text-xs">Size: {order.order_items[0].size}</span>
                                            )}
                                            {order.order_items.length > 1 && (
                                                <span className="text-text-secondary text-xs italic">+ {order.order_items.length - 1} produk lain</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-accent font-numeric font-bold text-lg">
                                            Rp {order.total.toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>

                                {/* Delivery Estimation (ETA) */}
                                {order.status !== 'SELESAI' && order.status !== 'DIBATALKAN' && order.status !== 'PENGEMBALIAN' && order.estimated_delivery_hours && (
                                    <div className="mb-3 p-2 bg-accent/10 border border-accent/20 rounded flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-accent" />
                                        <div>
                                            <span className="text-accent text-xs font-bold">Estimasi Tiba: </span>
                                            <span className="text-white text-xs">{formatETA(getETA(order.created_at, order.estimated_delivery_hours))}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Tracking Number */}
                                {order.tracking_number && (
                                    <div className="mb-3 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded">
                                        <span className="text-cyan-400 text-xs font-bold">No. Resi: </span>
                                        <span className="text-white font-numeric">{order.tracking_number}</span>
                                    </div>
                                )}

                                {/* Auto-complete countdown for TELAH_TIBA */}
                                {order.status === 'TELAH_TIBA' && order.arrived_at && (
                                    <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-center">
                                        <span className="text-blue-400 text-xs">
                                            {getAutoCompleteCountdown(order.arrived_at)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-white/10 gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-2.5 w-2.5 rounded-full", getStatusColor(order.status))} />
                                        <span className="text-white text-sm font-bold uppercase tracking-wider">{dbStatusToLabel[order.status] || order.status}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Confirm Order Button for TELAH_TIBA */}
                                        {canConfirmOrder(order.status) && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs border-green-500 text-green-400 hover:bg-green-500/20"
                                                onClick={() => confirmOrderReceived(order.id)}
                                                disabled={confirmingId === order.id}
                                            >
                                                {confirmingId === order.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                )}
                                                Konfirmasi Terima
                                            </Button>
                                        )}

                                        {/* Return Request Button for TELAH_TIBA - 12h window */}
                                        {canRequestReturn(order.status, order.arrived_at) && (
                                            <Link href={`/returns/${order.id}`}>
                                                <Button variant="outline" size="sm" className="text-xs border-pink-500 text-pink-400 hover:bg-pink-500/20">
                                                    <RotateCcw className="h-4 w-4 mr-1" />
                                                    Ajukan Pengembalian
                                                </Button>
                                            </Link>
                                        )}

                                        {/* Review Button for SELESAI - Only show if not yet rated */}
                                        {order.status === 'SELESAI' && (!order.ratings || order.ratings.length === 0) && (
                                            <Button
                                                variant="neon"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => setSelectedOrderForRating(order)}
                                            >
                                                <Star className="h-4 w-4 mr-1 fill-dark" />
                                                Beri Rating
                                            </Button>
                                        )}

                                        {/* Payment Proof Button for BCA unpaid orders */}
                                        {needsPaymentProof(order.status, order.payment_method) && (
                                            <Link href={`/payment/${order.id}`}>
                                                <Button variant="outline" size="sm" className="text-xs border-blue-500 text-blue-400 hover:bg-blue-500/20">
                                                    <CreditCard className="h-4 w-4 mr-1" />
                                                    Upload Bukti
                                                </Button>
                                            </Link>
                                        )}

                                        {canCancelOrder(order.status) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-danger hover:bg-danger/20 hover:text-danger"
                                                onClick={() => cancelOrder(order.id)}
                                                disabled={cancellingId === order.id}
                                            >
                                                {cancellingId === order.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                )}
                                                Batalkan
                                            </Button>
                                        )}
                                        <Link href={`/orders/${order.id}`}>
                                            <Button variant="ghost" size="sm" className="text-xs">
                                                Lihat Invoice
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <RatingModal
                isOpen={!!selectedOrderForRating}
                onClose={() => setSelectedOrderForRating(null)}
                order={selectedOrderForRating}
                onSuccess={fetchOrders}
            />

            <Footer />
        </main>
    );
}
