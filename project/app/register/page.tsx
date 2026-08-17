'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        badgenumber: '',
        rank: 'Officer',
        division: 'Patrol',
    });

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        if (!form.firstname || !form.lastname || !form.email || !form.password || !form.rank) {
            setError('Bitte alle Pflichtfelder ausfüllen.');
            return;
        }

        if (form.password.length < 6) {
            setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError('Die Passwörter stimmen nicht überein.');
            return;
        }

        setLoading(true);

        try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        firstname: form.firstname,
                        lastname: form.lastname,
                        badgenumber: form.badgenumber || null,
                        rank: form.rank,
                        division: form.division,
                    },
                },
            });

            if (signUpError) {
                throw signUpError;
            }

            const userId = signUpData.user?.id;

            if (!userId) {
                throw new Error('Registrierung akzeptiert, aber keine User-ID zurückbekommen.');
            }

            const divisionList = form.division
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);

            const { error: profileError } = await (supabase.from('user') as any).upsert(
                {
                    id: userId,
                    firstname: form.firstname,
                    lastname: form.lastname,
                    badgenumber: form.badgenumber || null,
                    rank: form.rank,
                    division: divisionList.length ? divisionList : ['Patrol'],
                    role: 'officer',
                    status: 'pending',
                },
                { onConflict: 'id' }
            );

            if (profileError) {
                throw profileError;
            }

            setSuccess(true);
            setForm({
                firstname: '',
                lastname: '',
                email: '',
                password: '',
                confirmPassword: '',
                badgenumber: '',
                rank: 'Officer',
                division: 'Patrol',
            });

            setTimeout(() => router.push('/'), 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unbekannter Fehler bei der Registrierung.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0058a0] flex items-center justify-center p-4">
            <div className="xp-window w-full max-w-xl">
                <div className="xp-titlebar">
                    <UserPlus className="w-4 h-4" />
                    <span>Neuen Zugang registrieren</span>
                </div>

                <div className="p-5 bg-[#ece9d8] space-y-4">
                    <Link href="/" className="inline-flex items-center gap-1 text-xs text-[#0a246a] hover:underline">
                        <ArrowLeft className="w-3 h-3" /> Zurück zur Anmeldung
                    </Link>

                    <div className="flex items-center gap-3 border-b border-[#808080] pb-3">
                        <div className="w-12 h-12 bg-[#0a246a] flex items-center justify-center xp-raised">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-[#0a246a]">RCPD Zugang beantragen</h1>
                            <p className="text-xs text-[#404040]">Nach der Registrierung wartet dein Account auf Freigabe durch einen Admin.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 border border-red-500 text-red-800 text-xs font-bold">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-100 border border-green-600 text-green-800 text-xs font-bold">
                            Registrierung erfolgreich. Ein Administrator prüft deinen Zugang und bestätigt ihn anschließend.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-3">
                            <label className="space-y-1 text-xs font-bold text-[#404040]">
                                Vorname
                                <input
                                    value={form.firstname}
                                    onChange={(e) => handleChange('firstname', e.target.value)}
                                    className="xp-input w-full"
                                    placeholder="Max"
                                />
                            </label>

                            <label className="space-y-1 text-xs font-bold text-[#404040]">
                                Nachname
                                <input
                                    value={form.lastname}
                                    onChange={(e) => handleChange('lastname', e.target.value)}
                                    className="xp-input w-full"
                                    placeholder="Mustermann"
                                />
                            </label>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                            <label className="space-y-1 text-xs font-bold text-[#404040]">
                                E-Mail
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="xp-input w-full"
                                    placeholder="max@rcpd.local"
                                />
                            </label>

                            <label className="space-y-1 text-xs font-bold text-[#404040]">
                                Dienstnummer
                                <input
                                    value={form.badgenumber}
                                    onChange={(e) => handleChange('badgenumber', e.target.value)}
                                    className="xp-input w-full"
                                    placeholder="1234"
                                />
                            </label>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                            <label className="space-y-1 text-xs font-bold text-[#404040]">
                                Rang
                                <input
                                    value={form.rank}
                                    onChange={(e) => handleChange('rank', e.target.value)}
                                    className="xp-input w-full"
                                    placeholder="Officer"
                                />
                            </label>

                            <label className="space-y-1 text-xs font-bold text-[#404040]">
                                Division
                                <input
                                    value={form.division}
                                    onChange={(e) => handleChange('division', e.target.value)}
                                    className="xp-input w-full"
                                    placeholder="Patrol, CID"
                                />
                            </label>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                            <label className="space-y-1 text-xs font-bold text-[#404040]">
                                Passwort
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    className="xp-input w-full"
                                    placeholder="******"
                                />
                            </label>

                            <label className="space-y-1 text-xs font-bold text-[#404040]">
                                Passwort bestätigen
                                <input
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    className="xp-input w-full"
                                    placeholder="******"
                                />
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="xp-btn w-full py-2 text-sm font-bold disabled:opacity-60"
                        >
                            {loading ? 'Registrierung läuft...' : 'Zugang registrieren'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
