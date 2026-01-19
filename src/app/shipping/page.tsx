import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Truck, Clock, MapPin } from "lucide-react";

export default function ShippingPage() {
    return (
        <main className="min-h-screen bg-dark">
            <Navbar />
            <div className="container mx-auto px-4 py-12">
                <h1 className="font-heading text-4xl md:text-5xl text-white uppercase italic mb-8">Shipping Information</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <Truck className="h-10 w-10 text-accent mb-4" />
                        <h3 className="text-white font-heading text-xl uppercase mb-2">Free Shipping</h3>
                        <p className="text-text-secondary text-sm">Free shipping on all orders over Rp 500,000.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <Clock className="h-10 w-10 text-accent mb-4" />
                        <h3 className="text-white font-heading text-xl uppercase mb-2">Fast Delivery</h3>
                        <p className="text-text-secondary text-sm">Standard delivery 3-5 business days. Express 1-2 days.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <MapPin className="h-10 w-10 text-accent mb-4" />
                        <h3 className="text-white font-heading text-xl uppercase mb-2">Nationwide</h3>
                        <p className="text-text-secondary text-sm">We deliver to all major cities across Indonesia.</p>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none">
                    <h2 className="text-white font-heading text-2xl uppercase">Shipping Rates</h2>
                    <ul className="text-text-secondary">
                        <li>Jakarta & Surrounding: Rp 15,000</li>
                        <li>Java Island: Rp 20,000 - Rp 25,000</li>
                        <li>Outside Java: Rp 30,000 - Rp 50,000</li>
                    </ul>
                </div>
            </div>
            <Footer />
        </main>
    );
}
