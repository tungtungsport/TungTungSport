"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    avatar_url: string | null;
}

interface UserContextType {
    profile: UserProfile | null;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const { profile: authProfile, isLoading, user, refreshProfile } = useAuth();

    const profile: UserProfile | null = authProfile ? {
        id: authProfile.id,
        name: authProfile.name,
        email: authProfile.email,
        phone: authProfile.phone,
        address: authProfile.address,
        avatar_url: authProfile.avatar_url
    } : null;

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!user) {
            console.error('updateProfile: Not logged in');
            return { error: new Error("Not logged in") };
        }

        console.log('Updating profile for user:', user.id, updates);

        const { error, data } = await supabase
            .from('profiles')
            .update({
                name: updates.name,
                phone: updates.phone,
                address: updates.address,
                avatar_url: updates.avatar_url
            })
            .eq('id', user.id)
            .select();

        if (error) {
            console.error('updateProfile error:', error.message, error.code, error.details);
            return { error: new Error(error.message) };
        }

        console.log('Profile updated successfully:', data);

        // Refresh the profile in AuthContext
        await refreshProfile();

        return { error: null };
    };

    return (
        <UserContext.Provider value={{ profile, updateProfile, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
