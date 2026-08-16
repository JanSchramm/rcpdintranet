'use client';

import { useAdmin } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Lock } from 'lucide-react';

interface AdminProtectionProps {
    children: React.ReactNode;
}

export default function AdminProtection({ children }: AdminProtectionProps) {
    const { isAdmin, loading } = useAdmin();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.replace('/dashboard');
        }
    }, [isAdmin, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#ece9d8]">
                <div className="text-center space-y-4">
                    <Lock className="w-12 h-12 mx-auto text-[#cc0000]" />
                    <p className="text-[#404040] font-bold">Authentifizierung lädt...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#ece9d8]">
                <div className="xp-window max-w-md w-full">
                    <div className="xp-titlebar">
                        <Lock className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">Zugriff verweigert</span>
                        <div className="flex gap-0.5">
                            <div className="w-5 h-5 flex items-center justify-center text-xs border border-white/30 bg-white/10">
                                _
                            </div>
                            <div className="w-5 h-5 flex items-center justify-center text-xs border border-white/30 bg-white/10">
                                x
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-[#ece9d8] space-y-4">
                        <div className="flex items-start gap-4">
                            <Lock className="w-8 h-8 text-[#cc0000] flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="font-bold text-[#0a246a] mb-2">Zugriff verweigert</h2>
                                <p className="text-xs text-[#404040] leading-relaxed">
                                    Sie verfügen nicht über die erforderlichen Administratorrechte, um auf diese Seite zuzugreifen.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="xp-statusbar">
                        <span className="text-[11px]">ERROR: INSUFFICIENT_PRIVILEGES</span>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
