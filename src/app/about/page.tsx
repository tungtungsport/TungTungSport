import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Users, Target, Zap } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-dark">
            <Navbar />

            {/* Hero */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-primary/30 z-0"></div>
                {/* Mock Background Image */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark z-10"></div>

                <div className="relative z-20 text-center px-4 max-w-4xl">
                    <h1 className="font-heading font-bold text-5xl md:text-7xl text-white uppercase italic mb-6">Built for the Game</h1>
                    <p className="text-xl text-text-secondary">We are Tung Tung Sport. Dedicated to the futsal culture in Indonesia.</p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 relative aspect-video bg-gray-800 rounded-sm overflow-hidden border border-primary/20">
                        {/* Image Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center text-text-secondary font-heading uppercase tracking-widest">
                            Team Photo Mockup
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <span className="text-accent font-bold uppercase tracking-widest text-sm mb-2 block">Our Story</span>
                        <h2 className="font-heading font-bold text-4xl text-white uppercase italic mb-6">From The Pitch, For The Pitch</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>
                                Tung Tung Sport started with a simple observation: Futsal players in Indonesia deserve professional-grade equipment that matches their passion and intensity.
                            </p>
                            <p>
                                Born from local competitions and late-night matches, we understand what it takes to dominate the court. We don&apos;t just sell gear; we curate performance tools that give you the edge.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-white/5 border-y border-primary/10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 border border-white/10 hover:border-accent transition-colors bg-dark/50">
                            <Target className="h-12 w-12 text-accent mb-6" />
                            <h3 className="text-white font-heading text-2xl uppercase italic mb-4">Our Mission</h3>
                            <p className="text-text-secondary">Empowering every futsal player with gear that boosts confidence and enhances performance.</p>
                        </div>
                        <div className="p-8 border border-white/10 hover:border-accent transition-colors bg-dark/50">
                            <Zap className="h-12 w-12 text-success mb-6" />
                            <h3 className="text-white font-heading text-2xl uppercase italic mb-4">Our Vision</h3>
                            <p className="text-text-secondary">To become the most trusted and iconic futsal brand in Indonesia, synonymous with quality and victory.</p>
                        </div>
                        <div className="p-8 border border-white/10 hover:border-accent transition-colors bg-dark/50">
                            <Users className="h-12 w-12 text-primary text-secondary-foreground mb-6" /> {/* Text color fix */}
                            <h3 className="text-white font-heading text-2xl uppercase italic mb-4">The Community</h3>
                            <p className="text-text-secondary">Supporting local tournaments and fostering the next generation of athletes.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
