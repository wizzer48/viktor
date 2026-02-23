import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, Mail } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[var(--viktor-bg)] flex items-center justify-center p-4">
            <div className="text-center space-y-8 max-w-lg">
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-[var(--viktor-blue)]/20 rounded-full animate-ping" />
                    <div className="w-24 h-24 bg-[var(--viktor-surface)] rounded-full flex items-center justify-center border border-[var(--viktor-border)]">
                        <AlertTriangle className="w-10 h-10 text-[var(--viktor-blue)]" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-6xl font-bold text-white tracking-tighter">404</h1>
                    <h2 className="text-2xl font-bold text-[var(--viktor-slate)]">Sayfa Bulunamadı</h2>
                    <p className="text-[var(--viktor-slate)]/80 leading-relaxed">
                        Aradığınız sayfa silinmiş, taşınmış veya hiç var olmamış olabilir.
                        Sistem kayıtlarında bu URL için bir karşılık bulunamadı.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button size="lg" className="bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white font-bold w-full sm:w-auto">
                            <Home className="w-4 h-4 mr-2" /> Ana Sayfaya Dön
                        </Button>
                    </Link>
                    <Link href="/iletisim">
                        <Button variant="outline" size="lg" className="border-[var(--viktor-slate)] text-white hover:border-[var(--viktor-blue)] hover:text-[var(--viktor-blue)] w-full sm:w-auto">
                            <Mail className="w-4 h-4 mr-2" /> İletişime Geç
                        </Button>
                    </Link>
                </div>

                <div className="pt-8 border-t border-[var(--viktor-border)]">
                    <p className="text-xs font-mono text-[var(--viktor-slate)]">
                        ERROR_CODE: 404_NOT_FOUND <br />
                        SYSTEM_ID: VIKTOR_WEB_V1
                    </p>
                </div>
            </div>
        </div>
    );
}
