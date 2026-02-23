'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const initialState = {
    success: false,
    message: ''
};

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            router.push('/admin');
        }
    }, [state.success, router]);

    return (
        <div className="min-h-screen bg-[var(--viktor-bg)] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[var(--viktor-surface)] border border-[var(--viktor-border)] p-8 rounded-sm shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-[var(--viktor-blue)]/10 rounded-full flex items-center justify-center mb-4 text-[var(--viktor-blue)]">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">System Access</h1>
                    <p className="text-[var(--viktor-slate)] text-sm mt-2">Viktor Systems Engineering Console</p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase text-[var(--viktor-slate)]">Access Key</label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="••••••••••••"
                            className="w-full bg-[var(--viktor-bg)] border border-[var(--viktor-border)] p-3 text-white outline-none focus:border-[var(--viktor-blue)] transition-colors font-mono tracking-widest"
                        />
                    </div>

                    {state.message && (
                        <div className={`p-3 text-sm rounded-sm ${state.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {state.message}
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-[var(--viktor-blue)] hover:bg-[#0090ad] text-white h-12 font-bold uppercase tracking-wider">
                        Login <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
