"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SignupPage() {
    const router = useRouter();
    const { signUp, isLoggedIn } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in - use useEffect to avoid setState during render
    useEffect(() => {
        if (isLoggedIn) {
            router.push("/");
        }
    }, [isLoggedIn, router]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (password.length < 6) {
            setError("Password harus minimal 6 karakter");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Password tidak cocok");
            setIsLoading(false);
            return;
        }

        const { error } = await signUp(email, password, name, phone, address);

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            // Redirect to profile page so user can verify their info
            router.push("/profile");
        }
    };

    return (
        <main className="min-h-screen bg-dark">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <Link href="/" className="inline-flex items-center text-text-secondary hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Link>

                <div className="max-w-md mx-auto">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                            <UserPlus className="h-10 w-10 text-accent" />
                        </div>
                        <h1 className="font-heading text-3xl md:text-4xl text-white uppercase italic">Daftar</h1>
                        <p className="text-text-secondary mt-2">Buat akun baru untuk mulai berbelanja.</p>
                    </div>

                    <form onSubmit={handleSignup} className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-4">
                        {error && (
                            <div className="bg-danger/20 border border-danger/50 text-danger text-sm px-4 py-3 rounded">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-white text-sm font-bold uppercase">Nama Lengkap</label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nama Anda"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-white text-sm font-bold uppercase">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@contoh.com"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-white text-sm font-bold uppercase">Nomor Telepon</label>
                            <Input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+62 812 3456 7890"
                                disabled={isLoading}
                                maxLength={15}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-white text-sm font-bold uppercase">Alamat Pengiriman</label>
                            <Input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Jl. Contoh No. 123, Kota, Provinsi"
                                disabled={isLoading}
                            />
                            <p className="text-text-secondary text-xs">Alamat dapat diubah nanti di halaman profil</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-white text-sm font-bold uppercase">Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    className="pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <p className="text-text-secondary text-xs">Minimal 6 karakter</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-white text-sm font-bold uppercase">Konfirmasi Password</label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                    className="pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" variant="neon" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...
                                </>
                            ) : (
                                "Daftar"
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-text-secondary mt-6">
                        Sudah punya akun?{" "}
                        <Link href="/login" className="text-accent hover:underline">
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>

            <Footer />
        </main>
    );
}
