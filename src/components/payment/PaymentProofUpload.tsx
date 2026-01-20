"use client";

import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";
import NextImage from "next/image";

interface PaymentProofUploadProps {
    orderId: string;
    bcaVirtualAccount: string;
    amount: number;
    onUploadSuccess?: () => void;
}

export function PaymentProofUpload({
    orderId,
    bcaVirtualAccount,
    amount,
    onUploadSuccess
}: PaymentProofUploadProps) {
    const { profile } = useUser();
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Hanya file gambar yang diperbolehkan (JPG, PNG, WebP)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Ukuran file maksimal 5MB');
            return;
        }

        setSelectedFile(file);
        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile || !profile) return;

        setUploading(true);
        setError(null);

        try {
            // Upload to storage: customer_id/order_id/filename
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${profile.id}/${orderId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('payment-proofs')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(filePath);

            // Create payment proof record in database
            const { error: dbError } = await supabase
                .from('payment_proofs')
                .insert({
                    order_id: orderId,
                    customer_id: profile.id,
                    image_url: publicUrl,  // Fixed column name
                    status: 'pending'
                });

            if (dbError) throw dbError;

            // Update order status to MENUNGGU_KONFIRMASI
            const { error: statusError } = await supabase
                .from('orders')
                .update({ status: 'MENUNGGU_KONFIRMASI' })
                .eq('id', orderId);

            if (statusError) {
                console.error('Status update error:', statusError);
                // Don't throw - proof is uploaded, just log the error
            }

            setUploadSuccess(true);
            if (onUploadSuccess) {
                setTimeout(() => onUploadSuccess(), 1500);
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Gagal mengupload bukti pembayaran');
        } finally {
            setUploading(false);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setImagePreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (uploadSuccess) {
        return (
            <div className="bg-white/5 border border-success/30 rounded-lg p-8 text-center">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-white font-heading text-xl uppercase mb-2">
                    Bukti Pembayaran Berhasil Dikirim!
                </h3>
                <p className="text-text-secondary">
                    Admin akan memverifikasi pembayaran Anda dalam waktu 1x24 jam.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <div>
                <h3 className="text-white font-heading text-lg uppercase mb-2">
                    Upload Bukti Pembayaran
                </h3>
                <p className="text-text-secondary text-sm">
                    Unggah screenshot atau foto bukti transfer BCA Anda
                </p>
            </div>

            {!imagePreview ? (
                <div
                    className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                    <p className="text-white font-bold mb-1">
                        Klik untuk pilih gambar
                    </p>
                    <p className="text-text-secondary text-sm">
                        JPG, PNG, atau WebP (max 5MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="relative bg-black/30 rounded-lg overflow-hidden">
                        <NextImage
                            src={imagePreview}
                            alt="Preview bukti pembayaran"
                            width={600}
                            height={400}
                            className="w-full h-auto"
                        />
                        <button
                            onClick={clearSelection}
                            className="absolute top-2 right-2 bg-danger text-white p-2 rounded-full hover:bg-danger/80 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <Button
                        variant="neon"
                        className="w-full"
                        size="lg"
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Mengupload...
                            </>
                        ) : (
                            'Kirim Bukti Pembayaran'
                        )}
                    </Button>
                </div>
            )}

            {error && (
                <div className="bg-danger/10 border border-danger/30 rounded-lg p-3 text-danger text-sm">
                    {error}
                </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-200 text-xs">
                    💡 <strong>Tips:</strong> Pastikan bukti pembayaran terlihat jelas, termasuk:
                    nominal transfer, tanggal/waktu, dan nama penerima (Tung Tung Sport Official).
                </p>
            </div>
        </div>
    );
}
