'use client';

import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActionState } from 'react'; // Changed from 'react-dom' and useFormState/useFormStatus
import { sendContact } from '@/app/actions/contact';

// Added initialState for useActionState
const initialState = {
    success: false,
    message: '',
    errors: {}
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[var(--viktor-bg)] pt-20">
            <section className="bg-[var(--viktor-surface)] border-b border-[var(--viktor-border)] py-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">İletişim</h1>
                    <p className="text-lg text-[var(--viktor-slate)] max-w-2xl">
                        Projeleriniz için profesyonel destek almak, keşif talep etmek veya teknik bilgi
                        edinmek için bize ulaşın.
                    </p>
                </div>
            </section>

            <section className="py-24 container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Info */}
                    <div className="space-y-12">
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[var(--viktor-surface)] rounded-sm flex items-center justify-center text-[var(--viktor-blue)]">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Adres</h3>
                                    <p className="text-[var(--viktor-slate)] leading-relaxed">
                                        Bilişim Vadisi Teknoloji Geliştirme Bölgesi<br />
                                        Sanayi Mah. Teknopark Bulvarı No:1/1A<br />
                                        34906 Pendik / İstanbul
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[var(--viktor-surface)] rounded-sm flex items-center justify-center text-[var(--viktor-blue)]">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-2">Telefon & Faks</h3>
                                    <p className="text-[var(--viktor-slate)] leading-relaxed">
                                        T: +90 (216) 555 01 23<br />
                                        F: +90 (216) 555 01 24
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[var(--viktor-surface)] rounded-sm flex items-center justify-center text-[var(--viktor-blue)]">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-2">E-Posta</h3>
                                    <p className="text-[var(--viktor-slate)] leading-relaxed">
                                        info@viktor.com.tr<br />
                                        teknik@viktor.com.tr (Destek)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="w-full h-64 bg-[var(--viktor-surface)] border border-[var(--viktor-border)] rounded-sm overflow-hidden relative grayscale opacity-80 hover:grayscale-0 transition-all duration-500">
                            <div className="absolute inset-0 flex items-center justify-center text-[var(--viktor-slate)] font-mono text-xs uppercase tracking-widest">
                                [ Google Maps Embed Placeholder ]
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-8 rounded-sm">
                        <h3 className="text-xl font-bold text-white mb-2">Telefon & E-Posta</h3>
                        <ContactForm />
                    </div>
                </div>
            </section>
        </div>
    );
}

function ContactForm() {
    const [state, formAction, isPending] = useActionState(sendContact, { success: false, message: '', errors: {} });

    return (
        <form action={formAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-mono font-bold text-[var(--viktor-slate)] uppercase">Ad Soyad</label>
                    <input name="name" type="text" className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-3 text-white text-sm focus:border-[var(--viktor-blue)] outline-none transition-colors" placeholder="İsim Giriniz" />
                    {state.errors?.name && <p className="text-xs text-red-400">{state.errors.name[0]}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-mono font-bold text-[var(--viktor-slate)] uppercase">E-Posta</label>
                    <input name="email" type="email" className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-3 text-white text-sm focus:border-[var(--viktor-blue)] outline-none transition-colors" placeholder="ornek@sirket.com" />
                    {state.errors?.email && <p className="text-xs text-red-400">{state.errors.email[0]}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[var(--viktor-slate)] uppercase">Konu</label>
                <select name="subject" className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-3 text-white text-sm focus:border-[var(--viktor-blue)] outline-none transition-colors">
                    <option value="">Seçiniz...</option>
                    <option value="Genel Bilgi">Genel Bilgi Talebi</option>
                    <option value="Proje Keşif">Proje Keşif / Teklif</option>
                    <option value="Teknik Destek">Teknik Destek</option>
                    <option value="Kariyer">Kariyer</option>
                </select>
                {state.errors?.subject && <p className="text-xs text-red-400">{state.errors.subject[0]}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-[var(--viktor-slate)] uppercase">Mesajınız</label>
                <textarea name="message" rows={5} className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-3 text-white text-sm focus:border-[var(--viktor-blue)] outline-none transition-colors" placeholder="Proje detaylarınızı buraya yazabilirsiniz..." />
                {state.errors?.message && <p className="text-xs text-red-400">{state.errors.message[0]}</p>}
            </div>

            {state.message && (
                <div className={`p-4 rounded-sm text-sm ${state.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {state.message}
                </div>
            )}

            <Button disabled={isPending} type="submit" className="w-full bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white font-bold py-6 disabled:opacity-50">
                {isPending ? 'GÖNDERİLİYOR...' : <>GÖNDER <Send className="w-4 h-4 ml-2" /></>}
            </Button>
        </form>
    );
}
