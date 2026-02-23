export default function Loading() {
    return (
        <div className="min-h-screen bg-[var(--viktor-bg)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-t-2 border-[var(--viktor-blue)] rounded-full animate-spin"></div>
                <div className="text-[var(--viktor-blue)] font-mono text-sm animate-pulse tracking-widest">
                    YÜKLENİYOR...
                </div>
            </div>
        </div>
    );
}
