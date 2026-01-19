"use client";

import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import { Loader2, Printer, Download } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NextImage from "next/image";

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { profile, isLoading: isUserLoading } = useUser();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (profile && id) {
            fetchOrder();
        }
    }, [profile, id]);

    const fetchOrder = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (*)
                `)
                .eq('id', id)
                .eq('customer_id', profile?.id) // Ensure security
                .single();

            if (error) throw error;
            setOrder(data);
        } catch (err) {
            console.error("Error fetching order:", err);
            // Redirect if not found or unauthorized
            router.push('/orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading || isUserLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
            {/* Action Bar (Hidden in Print) */}
            <div className="container max-w-4xl mx-auto px-4 mb-6 flex justify-between items-center print:hidden">
                <Link href="/orders">
                    <Button variant="outline" size="sm">
                        &larr; Kembali
                    </Button>
                </Link>
                <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white">
                    <Printer className="h-4 w-4 mr-2" /> Cetak / Simpan PDF
                </Button>
            </div>

            {/* Invoice Container */}
            <div className="container max-w-4xl mx-auto bg-white p-8 shadow-sm print:shadow-none print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-green-600 mb-2">Invoice</h1>
                        <p className="text-sm text-gray-500">
                            INV/{new Date(order.created_at).getFullYear()}/{order.order_number.replace('ORD-', '')}
                        </p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-gray-800">Tung Tung Sport</h2>
                        <p className="text-xs text-gray-500 mt-1">
                            Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Info Sections */}
                <div className="grid grid-cols-2 gap-12 mb-8">
                    {/* Seller */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Diterbitkan atas nama</h3>
                        <div className="text-sm">
                            <p className="font-bold">Penjual: <span className="font-normal text-gray-800">Tung Tung Sport</span></p>
                        </div>
                    </div>

                    {/* Buyer */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Tujuan Pengiriman</h3>
                        <div className="text-sm text-gray-800">
                            <p className="font-bold mb-1">{profile?.name || order.shipping_address.split('|')[0].trim()}</p>
                            <p className="whitespace-pre-wrap leading-relaxed">
                                {order.shipping_address.split('|').pop().trim()}
                            </p>
                            <p className="mt-1 text-gray-600">
                                {order.shipping_address.split('|')[1]?.trim()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Product Table */}
                <div className="mb-8 relative">
                    <table className="w-full text-sm relative z-10">
                        <thead className="border-b-2 border-gray-100">
                            <tr>
                                <th className="text-left py-3 font-bold text-gray-700">Nama Produk</th>
                                <th className="text-center py-3 font-bold text-gray-700">Jumlah</th>
                                <th className="text-right py-3 font-bold text-gray-700">Modals</th>
                                <th className="text-right py-3 font-bold text-gray-700">Total Harga</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {order.order_items.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="py-4">
                                        <div className="font-bold text-green-600 mb-1">
                                            {item.product_name}
                                            {item.size && <span className="ml-2 text-gray-400 font-normal">({item.size})</span>}
                                        </div>
                                        <div className="text-xs text-gray-500">Berat: 500gr (Est)</div>
                                    </td>
                                    <td className="text-center py-4 text-gray-700">{item.quantity}</td>
                                    <td className="text-right py-4 text-gray-700">Rp {item.unit_price.toLocaleString('id-ID')}</td>
                                    <td className="text-right py-4 text-gray-700 font-bold">Rp {item.total_price.toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-1/2 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Total Harga ({order.order_items.reduce((acc: any, i: any) => acc + i.quantity, 0)} Barang)</span>
                            <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-3">
                            <span>Total Ongkos Kirim</span>
                            <span>Rp {order.shipping_cost.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-green-600">
                            <span>Total Belanja</span>
                            <span>Rp {order.total.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t pt-6 text-xs text-gray-400 flex justify-between items-center">
                    <p>Terima kasih telah berbelanja di Tung Tung Sport.</p>
                    <p>Pemberitahuan ini adalah bukti pembayaran yang sah.</p>
                </div>
            </div>
        </div>
    );
}
