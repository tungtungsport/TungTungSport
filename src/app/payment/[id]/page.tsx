"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BCAPaymentInfo } from "@/components/payment/BCAPaymentInfo";
import { PaymentProofUpload } from "@/components/payment/PaymentProofUpload";

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const { profile } = useUser();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const orderId = params.id as string;

    useEffect(() => {
        if (profile && orderId) {
            fetchOrder();
        }
    }, [profile, orderId]);

    const fetchOrder = async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .eq('customer_id', profile?.id)
                .single();

            if (fetchError) throw fetchError;

            // Check if order is eligible for payment proof upload
            if (data.payment_method !== 'BCA_TRANSFER') {
                setError('Pesanan ini tidak menggunakan metode BCA Transfer');
                return;
            }

            if (data.status !== 'BELUM_BAYAR') {
                setError('Pembayaran untuk pesanan ini sudah diproses');
                return;
            }

            setOrder(data);
        } catch (err: any) {
            console.error('Error fetching order:', err);
            setError('Gagal memuat detail pesanan');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        router.push('/orders');
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-dark">
                <Navbar />
                <div className="container mx-auto px-4 py-32 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-accent" />
                </div>
                <Footer />
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="min-h-screen bg-dark">
                <Navbar />
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="font-heading text-3xl text-white uppercase mb-4">
                        {error || 'Pesanan tidak ditemukan'}
                    </h1>
                    <Link href="/orders">
                        <Button variant="outline">Kembali ke Pesanan</Button>
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-dark">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <Link href="/orders" className="inline-flex items-center text-text-secondary hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Pesanan
                </Link>

                <h1 className="font-heading text-3xl md:text-4xl text-white uppercase italic mb-2">
                    Pembayaran BCA
                </h1>
                <p className="text-text-secondary mb-2">Order #{order.order_number}</p>
                <p className="text-text-secondary text-sm mb-8">
                    Selesaikan pembayaran dan upload bukti transfer
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <BCAPaymentInfo
                        virtualAccount={order.bca_virtual_account}
                        amount={order.total}
                        orderId={order.id}
                    />
                    <PaymentProofUpload
                        orderId={order.id}
                        bcaVirtualAccount={order.bca_virtual_account}
                        amount={order.total}
                        onUploadSuccess={handleUploadSuccess}
                    />
                </div>
            </div>
            <Footer />
        </main>
    );
}
