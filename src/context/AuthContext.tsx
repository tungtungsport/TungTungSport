"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface Profile {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    address: string | null;
    avatar_url: string | null;
    role: string;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    showAuthPopup: boolean;
    openAuthPopup: () => void;
    closeAuthPopup: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAuthPopup, setShowAuthPopup] = useState(false);

    // Fetch user profile from database
    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data as Profile;
    };

    const refreshProfile = async () => {
        if (user) {
            const profileData = await fetchProfile(user.id);
            setProfile(profileData);
        }
    };

    // Initialize auth state
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id).then(setProfile);
            }
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    const profileData = await fetchProfile(session.user.id);
                    setProfile(profileData);
                } else {
                    setProfile(null);
                }

                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, name: string, phone?: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, phone: phone || null, role: 'customer' }
            }
        });

        if (error) {
            return { error: new Error(error.message) };
        }

        setShowAuthPopup(false);
        return { error: null };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return { error: new Error(error.message) };
        }

        setShowAuthPopup(false);
        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    const openAuthPopup = () => setShowAuthPopup(true);
    const closeAuthPopup = () => setShowAuthPopup(false);

    const isLoggedIn = !!user;

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            session,
            isLoggedIn,
            isLoading,
            signUp,
            signIn,
            signOut,
            showAuthPopup,
            openAuthPopup,
            closeAuthPopup,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
