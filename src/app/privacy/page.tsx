import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-dark">
            <Navbar />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="font-heading text-4xl md:text-5xl text-white uppercase italic mb-8">Privacy Policy</h1>
                <p className="text-text-secondary mb-6">Last updated: January 2026</p>

                <div className="prose prose-invert max-w-none space-y-8 text-text-secondary">
                    <section>
                        <h2 className="text-white font-heading text-2xl uppercase">Information We Collect</h2>
                        <p>We collect information you provide directly, including name, email, shipping address, and payment details when placing an order.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-heading text-2xl uppercase">How We Use Your Information</h2>
                        <ul>
                            <li>Process and fulfill orders</li>
                            <li>Send order confirmations and shipping updates</li>
                            <li>Provide customer support</li>
                            <li>Send promotional emails (with your consent)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white font-heading text-2xl uppercase">Data Security</h2>
                        <p>We implement industry-standard security measures to protect your personal information. Payment processing is handled by secure third-party providers.</p>
                    </section>

                    <section>
                        <h2 className="text-white font-heading text-2xl uppercase">Contact Us</h2>
                        <p>For privacy-related inquiries, contact us at privacy@tungtungsport.com</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
