import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Ruler } from "lucide-react";

export default function SizeGuidePage() {
    return (
        <main className="min-h-screen bg-dark">
            <Navbar />
            <div className="container mx-auto px-4 py-12">
                <h1 className="font-heading text-4xl md:text-5xl text-white uppercase italic mb-8">Size Guide</h1>

                <div className="flex items-center gap-3 mb-8">
                    <Ruler className="h-8 w-8 text-accent" />
                    <p className="text-text-secondary">Find your perfect fit with our sizing charts.</p>
                </div>

                <div className="overflow-x-auto mb-12">
                    <h2 className="text-white font-heading text-2xl uppercase mb-4">Futsal Shoes</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="p-3 text-accent font-heading uppercase">EU Size</th>
                                <th className="p-3 text-accent font-heading uppercase">US Size</th>
                                <th className="p-3 text-accent font-heading uppercase">UK Size</th>
                                <th className="p-3 text-accent font-heading uppercase">Foot Length (cm)</th>
                            </tr>
                        </thead>
                        <tbody className="text-text-secondary">
                            <tr className="border-b border-white/10 hover:bg-white/5"><td className="p-3">39</td><td className="p-3">6.5</td><td className="p-3">6</td><td className="p-3">24.5</td></tr>
                            <tr className="border-b border-white/10 hover:bg-white/5"><td className="p-3">40</td><td className="p-3">7</td><td className="p-3">6.5</td><td className="p-3">25</td></tr>
                            <tr className="border-b border-white/10 hover:bg-white/5"><td className="p-3">41</td><td className="p-3">8</td><td className="p-3">7.5</td><td className="p-3">25.5</td></tr>
                            <tr className="border-b border-white/10 hover:bg-white/5"><td className="p-3">42</td><td className="p-3">8.5</td><td className="p-3">8</td><td className="p-3">26.5</td></tr>
                            <tr className="border-b border-white/10 hover:bg-white/5"><td className="p-3">43</td><td className="p-3">9.5</td><td className="p-3">9</td><td className="p-3">27</td></tr>
                            <tr className="border-b border-white/10 hover:bg-white/5"><td className="p-3">44</td><td className="p-3">10</td><td className="p-3">9.5</td><td className="p-3">28</td></tr>
                            <tr className="border-b border-white/10 hover:bg-white/5"><td className="p-3">45</td><td className="p-3">11</td><td className="p-3">10.5</td><td className="p-3">29</td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                    <h3 className="text-white font-heading text-xl uppercase mb-3">Pro Tip</h3>
                    <p className="text-text-secondary text-sm">Measure your foot in the evening when it's at its largest. Leave about 1cm of space between your longest toe and the end of the shoe for optimal comfort.</p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
