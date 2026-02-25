import { getQuotes } from '@/app/actions/quote';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Phone, Mail } from 'lucide-react';

type QuoteDisplay = {
    id: string;
    customer: { name: string; company?: string; email: string; phone: string };
    createdAt: string;
    status: string;
    notes?: string;
    items: { name: string; quantity: number }[];
};

export const dynamic = 'force-dynamic';

export default async function QuotesPage() {
    const quotes = await getQuotes();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Teklif Talepleri</h1>
                <Badge variant="outline" className="text-[var(--viktor-blue)] border-[var(--viktor-blue)]">
                    {quotes.length} Talep
                </Badge>
            </div>

            <div className="grid gap-4">
                {quotes.length === 0 ? (
                    <div className="text-center py-12 bg-[var(--viktor-surface)] rounded-sm border border-[var(--viktor-border)]">
                        <FileText className="w-12 h-12 text-[var(--viktor-slate)] mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-foreground">Henüz teklif talebi yok</h3>
                        <p className="text-[var(--viktor-slate)]">Yeni talepler burada listelenecektir.</p>
                    </div>
                ) : (
                    quotes.map((quote: QuoteDisplay) => (
                        <Card key={quote.id} className="bg-[var(--viktor-surface)] border-[var(--viktor-border)]">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-foreground flex items-center gap-2">
                                            {quote.customer.name}
                                            {quote.customer.company && <span className="text-sm font-normal text-[var(--viktor-slate)]">({quote.customer.company})</span>}
                                        </CardTitle>
                                        <div className="flex items-center gap-4 text-xs text-[var(--viktor-slate)] font-mono">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(quote.createdAt).toLocaleDateString('tr-TR')}</span>
                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {quote.customer.email}</span>
                                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {quote.customer.phone}</span>
                                        </div>
                                    </div>
                                    <Badge className={`${quote.status === 'new' ? 'bg-green-500' : 'bg-[var(--viktor-slate)]'}`}>
                                        {quote.status === 'new' ? 'YENİ' : quote.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {quote.notes && (
                                        <div className="bg-[var(--viktor-bg)] p-3 rounded-sm border border-[var(--viktor-border)] text-sm text-[var(--viktor-slate)] italic">
                                            &quot;{quote.notes}&quot;
                                        </div>
                                    )}

                                    <div className="border-t border-[var(--viktor-border)] pt-4">
                                        <h4 className="text-xs font-bold text-[var(--viktor-blue)] uppercase mb-2">Talep Edilen Ürünler</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {quote.items.map((item: { name: string; quantity: number }, i: number) => (
                                                <div key={i} className="flex justify-between items-center bg-[var(--viktor-bg)] p-2 rounded-sm text-sm border border-[var(--viktor-border)]">
                                                    <span className="text-foreground truncate pr-2">{item.name}</span>
                                                    <Badge variant="secondary" className="bg-[var(--viktor-surface)] text-foreground font-mono">
                                                        x{item.quantity}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
