import type { Metadata } from "next";
import { Oswald, Inter, Chakra_Petch } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { UserProvider } from "@/context/UserContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { FavoritesDrawer } from "@/components/ui/FavoritesDrawer";
import { AuthPopup } from "@/components/ui/AuthPopup";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tung Tung Sport",
  description: "Premium futsal and football gear",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          oswald.variable,
          inter.variable,
          chakra.variable,
          "antialiased bg-dark text-white font-body"
        )}
      >
        <AuthProvider>
          <UserProvider>
            <CartProvider>
              <FavoritesProvider>
                {children}
                <CartDrawer />
                <FavoritesDrawer />
                <AuthPopup />
              </FavoritesProvider>
            </CartProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
