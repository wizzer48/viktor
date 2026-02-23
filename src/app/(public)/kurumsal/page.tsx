import { Factory, Award, Users } from 'lucide-react';

export default function CorporatePage() {
    return (
        <div className="min-h-screen bg-[var(--viktor-bg)] pt-20">

            {/* Header */}
            <section className="bg-[var(--viktor-surface)] border-b border-[var(--viktor-border)] py-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Kurumsal Kimlik & <br /><span className="text-[var(--viktor-navy)] dark:text-[var(--viktor-blue)]">Mühendislik Vizyonu</span></h1>
                    <p className="text-[var(--viktor-slate)] text-lg max-w-2xl">
                        2004 yılından bu yana otomasyon sektöründe güven, &quot;kalite&quot; ve &quot;sürdürülebilirlik&quot; ilkeleriyle hareket ediyoruz.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24 container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                                <Factory className="text-[var(--viktor-blue)]" /> Tarihçe
                            </h2>
                            <p className="text-[var(--viktor-slate)] leading-relaxed">
                                Şirketimiz, endüstriyel elektrik taahhüt işleri yapmak üzere kurulmuş, gelişen teknoloji ile birlikte Akıllı Bina Sistemleri ve Entegrasyon alanına odaklanmıştır. Bugün Türkiye&apos;nin önde gelen inşaat projelerinde; zayıf akım, otomasyon ve enerji yönetimi konularında çözüm ortağı olarak yer almaktayız.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                                <Award className="text-[var(--viktor-blue)]" /> Kalite Politikamız
                            </h2>
                            <p className="text-[var(--viktor-slate)] leading-relaxed">
                                ISO 9001 standartlarında proje yönetimi uyguluyor, kullandığımız her donanımın uluslararası sertifikalara (CE, KNX Partner) sahip olmasına özen gösteriyoruz. Bizim için başarı, kablo uçlarındaki etiketlemeden, teslim sonrası eğitim sürecine kadar her detayın kusursuz olmasıdır.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                                <Users className="text-[var(--viktor-blue)]" /> Ekibimiz
                            </h2>
                            <p className="text-[var(--viktor-slate)] leading-relaxed">
                                Saha mühendislerimiz, ETS programlayıcılarımız ve teknik servis personelimizle 7/24 yaşayan sistemler kuruyoruz. Ekibimiz düzenli olarak yurt içi ve yurt dışı eğitimlerle teknolojik yetkinliklerini güncellemektedir.
                            </p>
                        </div>
                    </div>

                    {/* Stats / Visual */}
                    <div>
                        <div className="bg-gradient-to-br from-[var(--viktor-blue)]/20 to-transparent rounded-sm border border-[var(--viktor-blue)]/30 backdrop-blur-sm p-12 flex flex-col justify-center items-center gap-12 h-full">
                            <Stat number="20+" label="Yıllık Tecrübe" />
                            <div className="w-16 h-[1px] bg-[var(--viktor-blue)]/50" />
                            <Stat number="500+" label="Tamamlanan Proje" />
                            <div className="w-16 h-[1px] bg-[var(--viktor-blue)]/50" />
                            <Stat number="%100" label="Müşteri Memnuniyeti" />
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}

function Stat({ number, label }: { number: string, label: string }) {
    return (
        <div className="text-center transform hover:scale-105 transition-transform duration-300">
            <div className="text-6xl font-bold text-foreground mb-2 tracking-tighter">{number}</div>
            <div className="text-sm font-mono text-[var(--viktor-slate)] uppercase tracking-widest">{label}</div>
        </div>
    );
}
