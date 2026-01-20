"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { RotateCcw, Package, ChevronRight, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface ReturnRequest {
    id: string;
    order_id: string;
    status: string;
    reason: string;
    items: any[];
    created_at: string;
    admin_notes: string | null;
    orders: {
        order_number: string;
    };
}

export default function MyReturnsPage() {
    const { profile } = useUser();
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (profile) {
            fetchMyReturns();
        }
    }, [profile]);

    const fetchMyReturns = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('returns')
            .select(`
                *,
                orders (order_number)
            `)
            .eq('customer_id', profile?.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching returns:', error);
        } else {
            setReturns(data || []);
        }
        setIsLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'APPROVED': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'REJECTED': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'COMPLETED': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <main className="min-h-screen bg-dark">
            <Navbar />
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-heading text-4xl text-white uppercase italic">Pengembalian Saya</h1>
                        <p className="text-text-secondary mt-1">Lacak status permintaan pengembalian barang Anda</p>
                    </div>
                    <Link href="/orders">
                        <button className="text-accent hover:text-accent/80 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                            <ChevronRight className="h-4 w-4 rotate-180" /> Kembali ke Pesanan
                        </button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
                        <p className="text-text-secondary">Memuat data pengembalian...</p>
                    </div>
                ) : returns.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
                        <RotateCcw className="h-16 w-16 mx-auto text-primary/30 mb-4" />
                        <h3 className="text-white font-heading text-xl uppercase mb-2">Belum ada pengembalian</h3>
                        <p className="text-text-secondary mb-6">Anda belum pernah mengajukan pengembalian barang.</p>
                        <Link href="/orders">
                            <button className="bg-accent text-dark font-bold px-6 py-2.5 rounded uppercase text-sm hover:bg-accent/90 transition-colors">
                                Lihat Pesanan
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {returns.map((req) => (
                            <div key={req.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-accent/40 transition-colors">
                                <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-text-secondary text-xs uppercase font-bold">ID Pesanan</span>
                                            <span className="text-white font-numeric font-bold">#{req.orders?.order_number}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                            <span className="text-text-secondary text-[10px] uppercase font-bold py-1">
                                                Diajukan pada {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-white text-sm">
                                                <span className="text-text-secondary">Alasan: </span>
                                                "{req.reason}"
                                            </p>
                                            <p className="text-white text-sm font-bold">
                                                {req.items?.length} items dikembalikan
                                            </p>
                                        </div>
                                    </div>

                                    {req.admin_notes && (
                                        <div className="md:w-1/3 bg-white/5 p-4 rounded border border-white/10">
                                            <p className="text-accent text-[10px] uppercase font-bold mb-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> Catatan Admin
                                            </p>
                                            <p className="text-white text-sm italic">"{req.admin_notes}"</p>
                                        </div>
                                    )}

                                    {req.status === 'APPROVED' && (
                                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded md:w-1/3">
                                            <p className="text-green-400 text-xs font-bold mb-1 flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" /> Pengembalian Disetujui
                                            </p>
                                            <p className="text-text-secondary text-xs">Silakan kirimkan barang ke alamat toko kami. Tim kami akan memverifikasi setelah barang sampai.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
