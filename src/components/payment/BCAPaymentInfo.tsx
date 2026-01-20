"use client";

import { Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BCAPaymentInfoProps {
    virtualAccount: string;
    amount: number;
    orderId: string;
}

export function BCAPaymentInfo({ virtualAccount, amount, orderId }: BCAPaymentInfoProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">BCA</span>
                </div>
                <div>
                    <h3 className="text-white font-heading text-lg uppercase">Transfer Bank BCA</h3>
                    <p className="text-text-secondary text-sm">Selesaikan pembayaran dalam 24 jam</p>
                </div>
            </div>

            {/* Virtual Account Number */}
            <div className="space-y-2">
                <label className="text-text-secondary text-sm uppercase font-bold">
                    Nomor Virtual Account
                </label>
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg p-4">
                    <span className="flex-1 text-white font-mono text-xl font-bold tracking-wider">
                        {virtualAccount}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(virtualAccount)}
                        className="flex-shrink-0"
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                                <span className="text-success">Tersalin!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Salin
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Receiver Name */}
            <div className="space-y-2">
                <label className="text-text-secondary text-sm uppercase font-bold">
                    Nama Penerima
                </label>
                <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                    <span className="text-white font-bold text-lg">Tung Tung Sport Official</span>
                </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
                <label className="text-text-secondary text-sm uppercase font-bold">
                    Total Pembayaran
                </label>
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                    <span className="text-accent font-numeric font-bold text-2xl">
                        Rp {amount.toLocaleString("id-ID")}
                    </span>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">i</span>
                    Cara Transfer BCA
                </h4>
                <ol className="text-text-secondary text-sm space-y-2 list-decimal list-inside">
                    <li>Buka aplikasi BCA Mobile atau ATM BCA</li>
                    <li>Pilih menu Transfer &gt; BCA Virtual Account</li>
                    <li>Masukkan nomor Virtual Account: <span className="text-white font-mono">{virtualAccount}</span></li>
                    <li>Periksa detail transaksi (Tung Tung Sport Official - Rp {amount.toLocaleString("id-ID")})</li>
                    <li>Masukkan PIN BCA Anda</li>
                    <li>Simpan bukti pembayaran</li>
                    <li>Upload bukti pembayaran di halaman selanjutnya</li>
                </ol>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-200 text-sm">
                    ⚠️ <strong>Penting:</strong> Pastikan Anda mentransfer dengan jumlah yang tepat.
                    Setelah transfer, segera upload bukti pembayaran agar pesanan Anda dapat segera diproses.
                </p>
            </div>
        </div>
    );
}
