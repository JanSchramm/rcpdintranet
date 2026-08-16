'use client';

import { useAuth } from '@/contexts/AuthContext';

export function useAdmin() {
    const { officer, loading } = useAuth();

    const isAdmin = officer?.role === 'admin';

    return {
        isAdmin,
        loading,
        officer,
    };
}
