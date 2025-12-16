'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: ''
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, 'users', user.uid, 'monitoredProfile', 'info');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setFormData(docSnap.data() as any);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Required field validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation (basic US format)
        if (formData.phone && !/^[\d\s()+-]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            await setDoc(doc(db, 'users', user.uid, 'monitoredProfile', 'info'), formData);
            setSaveSuccess(true);
            // Hide success message after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
            setErrors({ submit: 'Failed to save profile. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !user) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)] bg-background text-foreground">
            <Header />

            <main className="flex-1 max-w-2xl mx-auto w-full px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-3xl font-medium tracking-tight text-white">Monitoring Profile</h1>
                    <p className="text-muted-foreground mt-1">Update the information you want DigiKlean to monitor.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium text-white border-b border-border pb-2">Personal Details</h2>

                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">Full Name *</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full p-3 bg-[#0a0a0a] border rounded-lg text-white focus:border-white/30 focus:outline-none ${errors.fullName ? 'border-red-500' : 'border-border'
                                    }`}
                                placeholder="e.g. John Doe"
                                required
                            />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full p-3 bg-[#0a0a0a] border rounded-lg text-white focus:border-white/30 focus:outline-none ${errors.email ? 'border-red-500' : 'border-border'
                                        }`}
                                    placeholder="john@example.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full p-3 bg-[#0a0a0a] border rounded-lg text-white focus:border-white/30 focus:outline-none ${errors.phone ? 'border-red-500' : 'border-border'
                                        }`}
                                    placeholder="+1 (555) 000-0000"
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6">
                        <h2 className="text-lg font-medium text-white border-b border-border pb-2">Current Address</h2>

                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">Street Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full p-3 bg-[#0a0a0a] border border-border rounded-lg text-white focus:border-white/30 focus:outline-none"
                                placeholder="123 Main St"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm text-muted-foreground mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-[#0a0a0a] border border-border rounded-lg text-white focus:border-white/30 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-[#0a0a0a] border border-border rounded-lg text-white focus:border-white/30 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">ZIP</label>
                                <input
                                    type="text"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-[#0a0a0a] border border-border rounded-lg text-white focus:border-white/30 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        {errors.submit && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {errors.submit}
                            </div>
                        )}
                        {saveSuccess && (
                            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                                Profile updated successfully! We will use this information for your next scheduled scan.
                            </div>
                        )}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-8 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
