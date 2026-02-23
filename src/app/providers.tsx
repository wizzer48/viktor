'use client';

import { ThemeProvider } from 'next-themes';
import { QuoteProvider } from '@/context/QuoteContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QuoteProvider>
                {children}
            </QuoteProvider>
        </ThemeProvider>
    );
}
