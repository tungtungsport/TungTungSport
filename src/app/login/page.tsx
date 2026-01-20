"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { LogIn, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
    const router = useRouter();
    const { signIn, isLoggedIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in - use useEffect to avoid setState during render
    useEffect(() => {
        if (isLoggedIn) {
            router.push("/");
        }
    }, [isLoggedIn, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            router.push("/");
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
                            <LogIn className="h-10 w-10 text-accent" />
                        </div>
                        <h1 className="font-heading text-3xl md:text-4xl text-white uppercase italic">Masuk</h1>
                        <p className="text-text-secondary mt-2">Selamat datang kembali!</p>
                    </div>

                    <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-4">
                        {error && (
                            <div className="bg-danger/20 border border-danger/50 text-danger text-sm px-4 py-3 rounded">
                                {error}
                            </div>
                        )}
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
                        </div>
                        <Button type="submit" variant="neon" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...
                                </>
                            ) : (
                                "Masuk"
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-text-secondary mt-6">
                        Belum punya akun?{" "}
                        <Link href="/signup" className="text-accent hover:underline">
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>

            <Footer />
        </main>
    );
}
