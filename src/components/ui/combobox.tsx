'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface ComboboxProps {
    options: string[];
    name: string;
    defaultValue?: string;
    placeholder?: string;
    required?: boolean;
    onChange?: (value: string) => void;
}

export function Combobox({ options, name, defaultValue = '', placeholder, required, onChange }: ComboboxProps) {
    const [value, setValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Show all options if the input is empty or exactly matches an option (so they can pick others),
    // otherwise filter. Actually, standard UX says clicking the arrow shows all, typing filters.
    const filteredOptions = value && !options.includes(value)
        ? options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()))
        : options;

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="flex items-center border border-[var(--viktor-border)] bg-[var(--viktor-bg)] focus-within:border-[var(--viktor-blue)] transition-colors">
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setIsOpen(true);
                        if (onChange) onChange(e.target.value);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    required={required}
                    className="w-full bg-transparent p-2 text-foreground outline-none text-sm"
                    autoComplete="off"
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-[var(--viktor-slate)] hover:text-white transition-colors"
                    title="Toggle dropdown"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-[var(--viktor-bg)] border border-[var(--viktor-border)] max-h-60 overflow-y-auto shadow-2xl rounded-sm">
                    {filteredOptions.map((opt) => (
                        <div
                            key={opt}
                            className="p-3 text-sm text-[var(--viktor-slate)] hover:bg-[var(--viktor-blue)] hover:text-white cursor-pointer transition-colors border-b border-[var(--viktor-border)]/50 last:border-0"
                            onClick={() => {
                                setValue(opt);
                                setIsOpen(false);
                                if (onChange) onChange(opt);
                            }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
