import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Network, Shield } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-[var(--viktor-bg)] py-20 md:py-32 border-b border-[var(--viktor-border)]">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--viktor-slate) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="container relative z-10 max-w-7xl mx-auto px-4">
                <div className="grid gap-12 lg:grid-cols-2 items-center">

                    <div className="space-y-8">
                        <div className="inline-flex items-center rounded border border-[var(--viktor-blue)]/30 bg-[var(--viktor-blue)]/10 px-3 py-1 text-xs font-mono text-[var(--viktor-blue)]">
                            SYSTEM STATUS: ONLINE
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl text-[var(--foreground)]">
                            ENGINEERING-GRADE <br />
                            <span className="text-[var(--viktor-blue)]">INTEGRATION.</span>
                        </h1>

                        <p className="max-w-[600px] text-lg text-[var(--viktor-slate)] md:text-xl leading-relaxed">
                            We bridge the gap between physical hardware and digital control.
                            Advanced KNX automation, robust network infrastructure, and seamless IoT solutions.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" asChild>
                                <Link href="/iletisim">
                                    PROJECT INQUIRY <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/cozumler">
                                    EXPLORE SYSTEMS
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Visual / Abstract Representation of Integration */}
                    <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
                        <div className="aspect-square rounded-none border border-[var(--viktor-border)] bg-[var(--viktor-surface)]/20 p-8 backdrop-blur relative overflow-hidden group">
                            {/* Tech Decoration */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--viktor-blue)]"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--viktor-blue)]"></div>

                            <div className="grid grid-cols-2 gap-4 h-full">
                                <div className="flex flex-col justify-center items-center border border-[var(--viktor-border)] bg-[var(--viktor-bg)] p-4 hover:border-[var(--viktor-blue)] transition-colors">
                                    <Cpu className="h-12 w-12 text-[var(--viktor-slate)] mb-4" />
                                    <span className="font-mono text-xs text-[var(--viktor-blue)]">KNX CORE</span>
                                </div>
                                <div className="flex flex-col justify-center items-center border border-[var(--viktor-border)] bg-[var(--viktor-bg)] p-4 hover:border-[var(--viktor-blue)] transition-colors">
                                    <Network className="h-12 w-12 text-[var(--viktor-slate)] mb-4" />
                                    <span className="font-mono text-xs text-[var(--viktor-blue)]">NETWORKING</span>
                                </div>
                                <div className="col-span-2 flex flex-col justify-center items-center border border-[var(--viktor-border)] bg-[var(--viktor-bg)] p-4 hover:border-[var(--viktor-blue)] transition-colors">
                                    <Shield className="h-12 w-12 text-[var(--viktor-slate)] mb-4" />
                                    <span className="font-mono text-xs text-[var(--viktor-blue)]">SECURE ACCESS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
