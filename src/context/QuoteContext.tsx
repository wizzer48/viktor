'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '@/lib/scraper/types';

export interface QuoteItem {
    product: Product;
    quantity: number;
}

interface QuoteContextType {
    items: QuoteItem[];
    addToQuote: (product: Product, quantity?: number) => void;
    removeFromQuote: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearQuote: () => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('viktor_quote_basket');
        if (saved) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse quote basket', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('viktor_quote_basket', JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addToQuote = (product: Product, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });
        setIsOpen(true); // Auto open/notify
    };

    const removeFromQuote = (productId: string) => {
        setItems(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromQuote(productId);
            return;
        }
        setItems(prev => prev.map(item =>
            item.product.id === productId
                ? { ...item, quantity }
                : item
        ));
    };

    const clearQuote = () => {
        setItems([]);
        localStorage.removeItem('viktor_quote_basket');
    };

    return (
        <QuoteContext.Provider value={{ items, addToQuote, removeFromQuote, updateQuantity, clearQuote, isOpen, setIsOpen }}>
            {children}
        </QuoteContext.Provider>
    );
}

export function useQuote() {
    const context = useContext(QuoteContext);
    if (context === undefined) {
        throw new Error('useQuote must be used within a QuoteProvider');
    }
    return context;
}
