import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RotateCcw, CheckCircle, AlertCircle } from "lucide-react";

export default function ReturnsPage() {
    return (
        <main className="min-h-screen bg-dark">
            <Navbar />
            <div className="container mx-auto px-4 py-12">
                <h1 className="font-heading text-4xl md:text-5xl text-white uppercase italic mb-8">Returns & Exchanges</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <RotateCcw className="h-10 w-10 text-accent mb-4" />
                        <h3 className="text-white font-heading text-xl uppercase mb-2">30-Day Returns</h3>
                        <p className="text-text-secondary text-sm">Return any unworn item within 30 days for a full refund.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                        <CheckCircle className="h-10 w-10 text-success mb-4" />
                        <h3 className="text-white font-heading text-xl uppercase mb-2">Easy Process</h3>
                        <p className="text-text-secondary text-sm">Contact our support team to initiate a return.</p>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none space-y-6">
                    <div>
                        <h2 className="text-white font-heading text-2xl uppercase">Return Policy</h2>
                        <ul className="text-text-secondary">
                            <li>Items must be unworn and in original packaging</li>
                            <li>Include the original receipt or order confirmation</li>
                            <li>Refunds processed within 5-7 business days</li>
                        </ul>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-danger/10 border border-danger/30 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                        <p className="text-text-secondary text-sm m-0">Sale items and customized products are final sale and cannot be returned.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
