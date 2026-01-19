import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-dark">
            <Navbar />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="font-heading text-4xl md:text-5xl text-white uppercase italic mb-8">Terms of Service</h1>
                <p className="text-text-secondary mb-6">Last updated: January 2026</p>

                <div className="prose prose-invert max-w-none space-y-8 text-text-secondary">
                    <section>
                        <h2 className="text-white font-heading text-2xl uppercase">Acceptance of Terms</h2>
                        <p>By accessing and using Tung Tung Sport, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-heading text-2xl uppercase">Products and Pricing</h2>
                        <ul>
                            <li>All prices are listed in Indonesian Rupiah (IDR)</li>
                            <li>Prices are subject to change without notice</li>
                            <li>We reserve the right to limit order quantities</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-heading text-2xl uppercase">Orders and Payment</h2>
                        <p>All orders are subject to availability and confirmation. Payment must be completed before order processing begins.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-heading text-2xl uppercase">Limitation of Liability</h2>
                        <p>Tung Tung Sport shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-heading text-2xl uppercase">Contact</h2>
                        <p>For questions about these terms, contact us at legal@tungtungsport.com</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
