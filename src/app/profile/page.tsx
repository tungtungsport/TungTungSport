"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { User, MapPin, Edit2, LogOut, Save, X, Package, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const { profile, updateProfile, isLoading: isUserLoading } = useUser();
    const { signOut, isLoading: isAuthLoading, isLoggedIn } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedPhone, setEditedPhone] = useState("");
    const [editedAddress, setEditedAddress] = useState("");

    // Sync local state with context when profile loads
    useEffect(() => {
        if (profile) {
            setEditedName(profile.name || "");
            setEditedPhone(profile.phone || "");
            setEditedAddress(profile.address || "");
        }
    }, [profile]);

    // Redirect if not logged in (after auth loading completes)
    useEffect(() => {
        if (!isAuthLoading && !isLoggedIn) {
            router.push("/login");
        }
    }, [isAuthLoading, isLoggedIn, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const handleSave = () => {
        updateProfile({ name: editedName, phone: editedPhone, address: editedAddress });
        setIsEditing(false);
    };

    const handleCancel = () => {
        if (profile) {
            setEditedName(profile.name || "");
            setEditedPhone(profile.phone || "");
            setEditedAddress(profile.address || "");
        }
        setIsEditing(false);
    };

    // Show loading state while auth or profile is loading
    if (isAuthLoading || isUserLoading || !profile) {
        return (
            <main className="min-h-screen bg-dark">
                <Navbar />
                <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-10 w-10 animate-spin text-accent" />
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-dark">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="font-heading font-bold text-3xl md:text-4xl text-white uppercase italic mb-2">Profil Saya</h1>
                        <p className="text-text-secondary">Kelola informasi profil Anda.</p>
                    </div>
                    <Button variant="danger" size="sm" className="mt-4 md:mt-0" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-2" /> Keluar
                    </Button>
                </div>

                {/* Show prompt to fill address if empty */}
                {!profile.address && (
                    <div className="bg-accent/10 border border-accent/30 text-accent p-4 rounded-lg mb-6 flex items-center gap-3">
                        <MapPin className="h-5 w-5 flex-shrink-0" />
                        <p>Silakan lengkapi alamat pengiriman Anda untuk mempermudah checkout.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profile Card */}
                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-6 border-b border-primary/20 pb-4">
                            <h2 className="text-white font-heading font-bold text-xl uppercase flex items-center">
                                <User className="h-5 w-5 mr-2 text-accent" /> Informasi Profil
                            </h2>
                            {!isEditing ? (
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="neon" size="sm" onClick={handleSave}>
                                        <Save className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs uppercase text-text-secondary font-bold tracking-wider">Nama Lengkap</label>
                                {isEditing ? (
                                    <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} className="mt-1" />
                                ) : (
                                    <p className="text-white font-bold text-lg">{profile.name || "-"}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs uppercase text-text-secondary font-bold tracking-wider">Email</label>
                                <p className="text-white text-lg">{profile.email}</p>
                            </div>
                            <div>
                                <label className="text-xs uppercase text-text-secondary font-bold tracking-wider">Nomor Telepon</label>
                                {isEditing ? (
                                    <Input value={editedPhone} onChange={(e) => setEditedPhone(e.target.value)} className="mt-1" maxLength={15} />
                                ) : (
                                    <p className="text-white text-lg">{profile.phone || "-"}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                        <h2 className="text-white font-heading font-bold text-xl uppercase flex items-center mb-6 border-b border-primary/20 pb-4">
                            <MapPin className="h-5 w-5 mr-2 text-accent" /> Alamat Pengiriman
                        </h2>
                        <div>
                            <label className="text-xs uppercase text-text-secondary font-bold tracking-wider">Alamat</label>
                            {isEditing ? (
                                <Input value={editedAddress} onChange={(e) => setEditedAddress(e.target.value)} className="mt-1" placeholder="Masukkan alamat lengkap Anda" />
                            ) : (
                                <p className="text-white text-lg mt-1">{profile.address || "-"}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Orders Link */}
                <div className="mt-8">
                    <Link href="/orders">
                        <Button variant="outline" size="lg" className="w-full md:w-auto">
                            <Package className="h-5 w-5 mr-2" /> Lihat Riwayat Pesanan
                        </Button>
                    </Link>
                </div>
            </div>

            <Footer />
        </main>
    );
}
