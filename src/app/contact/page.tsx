import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-dark">
            <Navbar />

            {/* Hero */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-turf opacity-20"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="font-heading text-5xl md:text-6xl text-white uppercase italic mb-6">Get In Touch</h1>
                    <p className="text-text-secondary text-xl max-w-2xl mx-auto">
                        Have questions about our gear? Need help with an order? We're here to assist you.
                    </p>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-16">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white/5 border border-white/10 p-8 rounded-lg">
                            <h3 className="text-accent font-bold uppercase tracking-widest text-sm mb-6">Contact Information</h3>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <MapPin className="h-6 w-6 text-primary mt-1" />
                                    <div>
                                        <h4 className="text-white font-heading text-xl uppercase">Visit Us</h4>
                                        <p className="text-text-secondary">Jl. Sudirman No. 45<br />Jakarta Selatan, 12190</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <Mail className="h-6 w-6 text-primary mt-1" />
                                    <div>
                                        <h4 className="text-white font-heading text-xl uppercase">Email Us</h4>
                                        <p className="text-text-secondary">support@tungtungsport.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <Phone className="h-6 w-6 text-primary mt-1" />
                                    <div>
                                        <h4 className="text-white font-heading text-xl uppercase">Call Us</h4>
                                        <p className="text-text-secondary">+62 21 555 1234</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Placeholder */}
                    <div className="bg-white/5 border border-white/10 p-8 rounded-lg">
                        <h3 className="text-accent font-bold uppercase tracking-widest text-sm mb-6">Send a Message</h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-white text-sm font-bold uppercase">Name</label>
                                    <input type="text" className="w-full bg-dark border border-white/20 p-3 text-white focus:border-accent outline-none transition-colors" placeholder="Enter your name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-white text-sm font-bold uppercase">Email</label>
                                    <input type="email" className="w-full bg-dark border border-white/20 p-3 text-white focus:border-accent outline-none transition-colors" placeholder="Enter your email" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-white text-sm font-bold uppercase">Subject</label>
                                <input type="text" className="w-full bg-dark border border-white/20 p-3 text-white focus:border-accent outline-none transition-colors" placeholder="How can we help?" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-white text-sm font-bold uppercase">Message</label>
                                <textarea className="w-full bg-dark border border-white/20 p-3 text-white focus:border-accent outline-none transition-colors h-32" placeholder="Write your message here..."></textarea>
                            </div>

                            <Button variant="neon" size="lg" className="w-full">
                                Send Message <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
