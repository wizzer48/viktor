'use client';

import { useQuote } from '@/context/QuoteContext';
import { Product } from '@/lib/scraper/types';
import { Button } from '@/components/ui/button';
import { FileText, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AddToQuoteButtonProps {
    product: Product;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    showText?: boolean;
}

export function AddToQuoteButton({ product, className, variant = "default", size = "default", showText = true }: AddToQuoteButtonProps) {
    const { addToQuote } = useQuote();
    const [added, setAdded] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if inside a card
        e.stopPropagation();

        addToQuote(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={cn("transition-all duration-300", added && "bg-green-600 hover:bg-green-700 text-white border-green-600", className)}
            onClick={handleAdd}
            disabled={added}
        >
            {added ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            {showText && <span className="ml-2">{added ? 'Eklendi' : 'Teklif İste'}</span>}
        </Button>
    );
}
