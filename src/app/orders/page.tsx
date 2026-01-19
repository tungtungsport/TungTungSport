"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Loader2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";

const statusTabs: { key: string; label: string }[] = [
    { key: "ALL", label: "Semua" },
    { key: "NEW", label: "Menunggu" },
    { key: "PROCESSING", label: "Dikemas" },
    { key: "SHIPPED", label: "Dikirim" },
    { key: "COMPLETED", label: "Selesai" },
    { key: "CANCELLED", label: "Batal" }
];

// Map DB status to UI status labels
const dbStatusToLabel: Record<string, string> = {
    "NEW": "Menunggu Konfirmasi",
    "PAID": "Menunggu Konfirmasi",
    "PROCESSING": "Dikemas",
    "SHIPPED": "Dalam Pengiriman",
    "COMPLETED": "Telah Tiba",
    "CANCELLED": "Dibatalkan"
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "NEW":
        case "PAID":
            return "bg-yellow-500";
        case "PROCESSING":
            return "bg-blue-500";
        case "SHIPPED":
            return "bg-purple-500";
        case "COMPLETED":
            return "bg-success";
        case "CANCELLED":
            return "bg-danger";
        default:
            return "bg-gray-500";
    }
};

// Check if order can be cancelled (before shipping)
const canCancelOrder = (status: string) => {
    return status === "NEW" || status === "PAID" || status === "PROCESSING";
};

export default function OrdersPage() {
    const { profile } = useUser();
    const [orders, setOrders] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");
    const [isLoading, setIsLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        if (profile) {
            fetchOrders();
        }
    }, [profile]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (*)
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

    const cancelOrder = async (orderId: string) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;

        setCancellingId(orderId);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'CANCELLED' })
                .eq('id', orderId)
                .eq('customer_id', profile?.id); // Security: only own orders

            if (error) throw error;

            // Update local state
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: 'CANCELLED' } : o
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

        const matchesStatus = activeTab === "ALL" ||
            (activeTab === "NEW" && (order.status === "NEW" || order.status === "PAID")) ||
            order.status === activeTab;

        return matchesSearch && matchesStatus;
    });

    return (
        <main className="min-h-screen bg-dark">
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
                        className="pl-12 h-12 text-base"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-primary/20 pb-4">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "px-4 py-2 text-sm font-bold uppercase rounded-full transition-all",
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
                                    <div className="md:text-right">
                                        <span className="text-text-secondary text-xs uppercase font-bold">Tanggal</span>
                                        <p className="text-white text-sm">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-white/10 gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-2.5 w-2.5 rounded-full", getStatusColor(order.status))} />
                                        <span className="text-white text-sm font-bold uppercase tracking-wider">{dbStatusToLabel[order.status] || order.status}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
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

            <Footer />
        </main>
    );
}
