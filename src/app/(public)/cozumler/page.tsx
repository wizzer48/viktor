import { Home, Building2, Server, Lightbulb, Cctv } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SolutionsPage() {
    // Map of Solution -> Product Category
    const solutions = [
        {
            title: "Akıllı Ev & Villa",
            desc: "KNX ve IoT tabanlı ev otomasyonu. Aydınlatma, iklimlendirme ve perde/panjur yönetimi.",
            icon: Home,
            href: "/urunler?category=Akıllı Bina Otomasyonu"
        },
        {
            title: "Otel Otomasyonu (GRMS)",
            desc: "Misafir konforunu artıran ve enerji tasarrufu sağlayan oda yönetim sistemleri. DND/MUR entegrasyonu.",
            icon: Building2,
            href: "/urunler?category=Otel Çözümleri"
        },
        {
            title: "Ticari Bina & Ofis",
            desc: "A enerji sınıfı plazalar için DALI aydınlatma ve merkezi bina yönetim sistemleri (BMS).",
            icon: Building2,
            href: "/urunler?category=Akıllı Bina Otomasyonu"
        },
        {
            title: "Ağ & IT Altyapısı",
            desc: "Yapısal kablolama, fiber optik sonlandırma, sunucu odası kurulumu ve profesyonel Wi-Fi çözümleri.",
            icon: Server,
            href: "/urunler?category=Ağ & Altyapı"
        },
        {
            title: "Aydınlatma Tasarımı & DALI",
            desc: "Mimari aydınlatma projeleri için DALI senaryo kontrolü ve tunable white uygulamaları.",
            icon: Lightbulb,
            href: "/urunler?category=Anahtar & Priz Grubu"
        },
        {
            title: "Zayıf Akım Sistemleri",
            desc: "IP CCTV, Yangın Algılama, Kartlı Geçiş ve Genel Seslendirme sistemleri entegrasyonu.",
            icon: Cctv,
            href: "/urunler?category=Güvenlik & İnterkom"
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--viktor-bg)] pt-20">
            <section className="bg-[var(--viktor-surface)] border-b border-[var(--viktor-border)] py-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Sektörel <span className="text-[var(--viktor-navy)] dark:text-[var(--viktor-blue)]">Çözümler</span></h1>
                    <p className="text-[var(--viktor-slate)] text-lg max-w-2xl">
                        Her yapının ihtiyacı farklıdır. Projenize özel, ölçeklenebilir ve entegre mühendislik çözümleri sunuyoruz.
                        <br /><span className="text-sm text-[var(--viktor-blue)] mt-2 block opacity-80">* İlgili ürünleri görmek için kartlara tıklayınız.</span>
                    </p>
                </div>
            </section>

            <section className="py-24 container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {solutions.map((sol, i) => (
                        <Link href={sol.href} key={i}>
                            <div className="group h-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-8 rounded-sm hover:border-[var(--viktor-blue)] transition-colors cursor-pointer">
                                <div className="w-12 h-12 bg-[var(--viktor-surface)] rounded-sm flex items-center justify-center mb-6 group-hover:bg-[var(--viktor-blue)]/10 transition-colors">
                                    <sol.icon className="w-6 h-6 text-[var(--viktor-blue)]" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-[var(--viktor-blue)] transition-colors">{sol.title}</h3>
                                <p className="text-[var(--viktor-slate)] text-sm mb-6 leading-relaxed">
                                    {sol.desc}
                                </p>
                                <Button variant="link" className="p-0 text-[var(--viktor-blue)] text-xs font-mono uppercase tracking-widest hover:text-white">
                                    İlgili Ürünleri İncele →
                                </Button>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
