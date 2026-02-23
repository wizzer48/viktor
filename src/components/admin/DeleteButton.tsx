'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';

interface DeleteButtonProps {
    id: string;
    action: (id: string) => Promise<{ success: boolean; message: string }>;
}

export function DeleteButton({ id, action }: DeleteButtonProps) {
    // Wrap to ignore return type for form action compatibility
    const deleteWithId = async () => {
        if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            await action(id);
        }
    };

    return (
        <form action={deleteWithId}>
            <SubmitButton />
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-400"
            disabled={pending}
        >
            <Trash2 className={`w-4 h-4 ${pending ? 'animate-pulse' : ''}`} />
        </Button>
    );
}
