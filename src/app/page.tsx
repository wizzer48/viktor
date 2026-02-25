import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Cpu, Server, CheckCircle2, MapPin, Home as HomeIcon, Building2, Lightbulb, Cctv } from 'lucide-react';
import { getProjects } from '@/app/actions/project';
import Image from 'next/image';

export const revalidate = 0; // Ensure fresh data

export default async function Home() {
    const projects = await getProjects();
    const recentProjects = projects.slice(0, 3); // Get first 3

    return (
        <div className="min-h-screen bg-[var(--viktor-bg)]">

            {/* Hero Section */}
            <section className="relative h-screen flex items-center pt-20 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--viktor-slate) 1px, transparent 0)', backgroundSize: '40px 40px' }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--viktor-blue)]/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10 flex items-center justify-center h-full">
                    <div className="relative w-full max-w-5xl animate-in zoom-in duration-1000">
                        {/* The Terminal Box Background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--viktor-blue)]/20 to-transparent rounded-2xl border border-[var(--viktor-border)] backdrop-blur-sm shadow-2xl" />

                        {/* Box Content */}
                        <div className="relative p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center text-center space-y-8">

                            {/* Terminal Header Decoration */}
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-start opacity-70">
                                <div className="space-y-2">
                                    <div className="h-2 w-24 bg-[var(--viktor-blue)]/40 rounded-full" />
                                    <div className="h-2 w-16 bg-[var(--viktor-blue)]/20 rounded-full" />
                                </div>
                                <Cpu className="w-8 h-8 text-[var(--viktor-blue)]" />
                            </div>

                            {/* Main Text Content */}
                            <div className="pt-8 space-y-8 flex flex-col items-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--viktor-blue)]/10 border border-[var(--viktor-blue)]/30 backdrop-blur-md">
                                    <span className="w-2 h-2 rounded-full bg-[var(--viktor-blue)] animate-pulse" />
                                    <span className="text-xs font-mono text-[var(--viktor-blue)] uppercase tracking-wider">Sistem Çevrimiçi • v1.0</span>
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
                                    Geleceğin Teknolojisi, <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--viktor-navy)] to-black dark:from-[var(--viktor-blue)] dark:to-white">Bugünden Evinizde.</span>
                                </h1>

                                <p className="text-lg text-[var(--viktor-slate)] max-w-2xl leading-relaxed">
                                    Viktor, konut ve ticari yapılar için uçtan uca otomasyon, güvenlik ve ağ altyapısı çözümleri sunan lider sistem entegratörüdür.
                                    Karmaşık teknolojileri, basit ve güvenilir bir yaşama dönüştürüyoruz.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-4">
                                    <Link href="/cozumler" className="w-full sm:w-auto">
                                        <Button size="lg" className="w-full sm:w-auto bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white font-bold tracking-wide">
                                            ÇÖZÜMLERİMİZİ İNCELEYİN
                                        </Button>
                                    </Link>
                                    <Link href="/iletisim" className="w-full sm:w-auto">
                                        <Button variant="outline" size="lg" className="w-full sm:w-auto border-[var(--viktor-slate)]/50 text-foreground hover:border-[var(--viktor-blue)] hover:text-[var(--viktor-blue)] bg-background/50 backdrop-blur-sm">
                                            BİZE ULAŞIN
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Terminal Footer Text */}
                            <div className="w-full pt-8 text-left font-mono text-xs text-[var(--viktor-blue)] opacity-60 space-y-1">
                                <p>{'>'} Sistem Başlatılıyor...</p>
                                <p>{'>'} Modüller Yükleniyor: KNX, DALI, TCP/IP...</p>
                                <p>{'>'} Durum: Operasyonel</p>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* Core Services - Bento Grid */}
            <section className="py-24 container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Mühendislik Tabanlı Çözümler</h2>
                    <p className="text-lg text-[var(--viktor-slate)] max-w-2xl mx-auto">
                        Sadece ürün satmıyoruz; yaşam alanlarınızın DNA&apos;sına işleyen, entegre ve sürdürülebilir sistemler tasarlıyoruz.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[240px]">
                    {/* Item 1: Akıllı Ev (Large Feature) */}
                    <Link href="/urunler?category=Akıllı Bina Otomasyonu" className="group relative overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-8 flex flex-col justify-end hover:border-[var(--viktor-blue)] transition-all duration-500">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[var(--viktor-blue)]/10 blur-3xl rounded-full group-hover:bg-[var(--viktor-blue)]/25 transition-all duration-700" />
                        <HomeIcon className="w-12 h-12 text-[var(--viktor-blue)] mb-auto relative z-10 group-hover:scale-110 transition-transform duration-500" />
                        <div className="relative z-10 mt-4">
                            <h3 className="text-3xl font-bold text-foreground mb-3">Akıllı Ev & Villa</h3>
                            <p className="text-[var(--viktor-slate)] leading-relaxed">
                                KNX ve IoT tabanlı endüstriyel standartlarda ev otomasyonu. Konforunuzu artırırken enerji verimliliğini maksimize eden, tek noktadan yönetilebilir yaşam alanları.
                            </p>
                        </div>
                    </Link>

                    {/* Item 2: Otel (Wide) */}
                    <Link href="/urunler?category=Otel Çözümleri" className="group relative overflow-hidden rounded-2xl md:col-span-2 md:row-span-1 bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-8 flex items-center gap-6 hover:border-[var(--viktor-blue)] transition-all duration-300">
                        <div className="p-4 bg-[var(--viktor-blue)]/10 rounded-xl group-hover:bg-[var(--viktor-blue)]/20 transition-colors">
                            <Building2 className="w-8 h-8 text-[var(--viktor-blue)]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Otel Otomasyonu (GRMS)</h3>
                            <p className="text-sm text-[var(--viktor-slate)]">Misafir konforunu zirveye taşıyan, eşzamanlı enerji tasarrufu sağlayan akıllı oda yönetim sistemleri.</p>
                        </div>
                    </Link>

                    {/* Item 3: Ticari Bina (Accent) */}
                    <Link href="/urunler?category=Akıllı Bina Otomasyonu" className="group relative overflow-hidden rounded-2xl md:col-span-1 md:row-span-1 bg-[var(--viktor-blue)] p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-[var(--viktor-blue)]/30 transition-all duration-300">
                        <Building2 className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" />
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Ticari Bina</h3>
                            <p className="text-xs text-white/70">A sınıfı plazalar için DALI ve Merkezi BMS (Bina Yönetim) entegrasyonu.</p>
                        </div>
                    </Link>

                    {/* Item 4: Ağ (Square) */}
                    <Link href="/urunler?category=Ağ & Altyapı" className="group relative overflow-hidden rounded-2xl md:col-span-1 md:row-span-1 bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-6 flex flex-col justify-between hover:border-[var(--viktor-blue)] transition-all duration-300">
                        <Server className="w-8 h-8 text-[var(--viktor-slate)] group-hover:text-[var(--viktor-blue)] transition-colors" />
                        <div>
                            <h3 className="text-lg font-bold text-foreground mb-1">Ağ & BT</h3>
                            <p className="text-xs text-[var(--viktor-slate)]">Kesintisiz Wi-Fi, yapısal kablolama ve güvenli sunucu odası kurulumları.</p>
                        </div>
                    </Link>

                    {/* Item 5: Aydınlatma (Wide) */}
                    <Link href="/urunler?category=Anahtar & Priz Grubu" className="group relative overflow-hidden rounded-2xl md:col-span-2 md:row-span-1 bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-8 flex items-center justify-between hover:border-[var(--viktor-blue)] transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--viktor-blue)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 max-w-sm">
                            <h3 className="text-xl font-bold text-foreground mb-2">Aydınlatma Tasarımı</h3>
                            <p className="text-sm text-[var(--viktor-slate)]">Mimari projeler için DALI senaryo kontrolü, insan odaklı aydınlatma (HCL) ve tunable white uygulamaları.</p>
                        </div>
                        <Lightbulb className="w-12 h-12 text-[var(--viktor-blue)]/40 group-hover:text-[var(--viktor-blue)] transition-colors relative z-10" />
                    </Link>

                    {/* Item 6: Zayıf Akım (Wide) */}
                    <Link href="/urunler?category=Güvenlik & İnterkom" className="group relative overflow-hidden rounded-2xl md:col-span-2 md:row-span-1 bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-8 flex items-center gap-6 hover:border-[var(--viktor-blue)] transition-all duration-300">
                        <div className="p-4 bg-[var(--viktor-blue)]/10 rounded-xl group-hover:bg-[var(--viktor-blue)]/20 transition-colors">
                            <Cctv className="w-8 h-8 text-[var(--viktor-slate)]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Zayıf Akım Sistemleri</h3>
                            <p className="text-sm text-[var(--viktor-slate)]">IP CCTV, Yangın Algılama, Kartlı Geçiş ve Genel Seslendirme sistemlerinin kusursuz entegrasyonu.</p>
                        </div>
                    </Link>

                </div>
            </section>

            {/* Dynamic References Section */}
            {recentProjects.length > 0 && (
                <section className="py-24 bg-[var(--viktor-surface)] border-y border-[var(--viktor-border)]">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground mb-2">Güncel Referanslar</h2>
                                <p className="text-[var(--viktor-slate)]">Sahadaki en son imza projelerimiz.</p>
                            </div>
                            <Link href="/referanslar" className="text-[var(--viktor-blue)] hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                                Tümünü Gör <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {recentProjects.map(proj => (
                                <div key={proj.id} className="group relative bg-[var(--viktor-bg)] border border-[var(--viktor-border)] overflow-hidden rounded-sm hover:border-[var(--viktor-blue)] transition-all">
                                    <div className="h-64 relative">
                                        <Image src={proj.imagePath} alt={proj.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--viktor-bg)] via-transparent to-transparent opacity-80" />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="flex items-center gap-2 text-xs text-[var(--viktor-blue)] font-mono mb-2">
                                                <MapPin className="w-3 h-3" /> {proj.location}
                                            </div>
                                            <h3 className="text-lg font-bold text-foreground">{proj.name}</h3>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Why Us */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-foreground text-center mb-8">Neden Viktor?</h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                "Marka bağımsız, proje odaklı çözüm tasarımı.",
                                "ETS5/ETS6 sertifikalı uzman mühendis kadrosu.",
                                "Satış sonrası 7/24 teknik destek ve bakım garantisi.",
                                "Uluslararası standartlarda (IEC/ISO) kurulum kalitesi."
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-4 p-4 rounded-sm border border-[var(--viktor-border)] bg-[var(--viktor-surface)]">
                                    <CheckCircle2 className="w-6 h-6 text-[var(--viktor-blue)] flex-shrink-0" />
                                    <span className="text-[var(--viktor-slate)] leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="text-center pt-8">
                            <Link href="/kurumsal" className="inline-flex items-center gap-2 text-[var(--viktor-blue)] font-medium hover:underline p-3 rounded-sm hover:bg-[var(--viktor-blue)]/10 transition-colors">
                                Hakkımızda Daha Fazla Bilgi <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
