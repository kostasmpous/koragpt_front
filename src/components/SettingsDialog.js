// src/components/SettingsDialog.js
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";

export default function SettingsDialog({ open, onClose }) {
    const { ready } = useAuth();

    const [tab, setTab] = useState("security"); // "security" | "billing"
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [ok, setOk] = useState(null);

    // Security form
    const [email, setEmail] = useState("");
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");

    // Billing/Profile form
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [postal, setPostal] = useState("");

    // Load current profile when dialog opens
    useEffect(() => {
        if (!open || !ready) return;
        let active = true;

        (async () => {
            setErr(null);
            setOk(null);
            setLoading(true);
            try {
                const { data } = await api.get(`/api/users/me`);
                if (!active) return;

                setEmail(data.email ?? "");
                setFirstName(data.firstName ?? data.first_name ?? "");
                setLastName(data.lastName ?? data.last_name ?? "");
                setAddress(data.address ?? "");
                setCity(data.city ?? "");
                setCountry(data.country ?? "");
                setPostal(data.postalCode ?? data.postal_code ?? "");
            } catch (e) {
                if (active) setErr(e?.response?.data?.message || "Failed to load profile");
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [open, ready]);

    const closeAndReset = () => {
        setErr(null);
        setOk(null);
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        onClose?.();
    };

    // Save email and/or password
    const saveSecurity = async (e) => {
        e.preventDefault();
        setErr(null);
        setOk(null);
        setLoading(true);

        try {
            // Update email (if changed)
            await api.patch(`/api/users/me`, { email });

            // Change password (if provided)
            if (currentPw || newPw || confirmPw) {
                if (!currentPw || !newPw || !confirmPw) {
                    setErr("Please fill all password fields");
                    setLoading(false);
                    return;
                }
                if (newPw !== confirmPw) {
                    setErr("New passwords do not match");
                    setLoading(false);
                    return;
                }
                await api.post("/api/users/me/password", {
                    oldPassword: currentPw,
                    newPassword: newPw,
                });

            }

            setOk("Security settings updated");
            setCurrentPw("");
            setNewPw("");
            setConfirmPw("");
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to update security settings");
        } finally {
            setLoading(false);
        }
    };

    // Save billing/profile
    const saveBilling = async (e) => {
        e.preventDefault();
        setErr(null);
        setOk(null);
        setLoading(true);

        try {
            await api.patch(`/api/users/me`, {
                firstName,
                lastName,
                address,
                city,
                country,
                postalCode: postal,
            });
            setOk("Profile updated");
        } catch (e) {
            setErr(e?.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={closeAndReset} />

            {/* Dialog */}
            <div className="relative bg-white w-[720px] max-w-[95vw] rounded-2xl shadow-xl border text-black">
                <div className="flex items-center justify-between px-5 py-4 border-b bg-slate-50 rounded-t-2xl">
                    <h2 className="text-lg font-semibold">Settings</h2>
                    <button
                        onClick={closeAndReset}
                        className="p-2 rounded-md hover:bg-slate-200"
                        aria-label="Close settings"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-5 pt-3">
                    <div className="flex gap-2">
                        <button
                            className={`px-3 py-1.5 rounded-lg text-sm ${
                                tab === "security" ? "bg-blue-600 text-white" : "bg-slate-100"
                            }`}
                            onClick={() => {
                                setTab("security");
                                setErr(null);
                                setOk(null);
                            }}
                        >
                            Security
                        </button>
                        <button
                            className={`px-3 py-1.5 rounded-lg text-sm ${
                                tab === "billing" ? "bg-blue-600 text-white" : "bg-slate-100"
                            }`}
                            onClick={() => {
                                setTab("billing");
                                setErr(null);
                                setOk(null);
                            }}
                        >
                            Billing / Profile
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
                    {ok && <div className="mb-3 text-sm text-green-600">{ok}</div>}

                    {tab === "security" ? (
                        <form onSubmit={saveSecurity} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full border rounded-md px-3 py-2 bg-white"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Current password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full border rounded-md px-3 py-2 bg-white"
                                        value={currentPw}
                                        onChange={(e) => setCurrentPw(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        New password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full border rounded-md px-3 py-2 bg-white"
                                        value={newPw}
                                        onChange={(e) => setNewPw(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Confirm new password
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full border rounded-md px-3 py-2 bg-white"
                                        value={confirmPw}
                                        onChange={(e) => setConfirmPw(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeAndReset}
                                    className="px-4 py-2 rounded-lg bg-slate-200"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-lg text-white ${
                                        loading
                                            ? "bg-blue-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    {loading ? "Saving…" : "Save changes"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={saveBilling} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        First name
                                    </label>
                                    <input
                                        className="w-full border rounded-md px-3 py-2 bg-white"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Last name
                                    </label>
                                    <input
                                        className="w-full border rounded-md px-3 py-2 bg-white"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <input
                                    className="w-full border rounded-md px-3 py-2 bg-white"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">City</label>
                                    <input
                                        className="w-full border rounded-md px-3 py-2 bg-white"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Country</label>
                                    <input
                                        className="w-full border rounded-md px-3 py-2 bg-white"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Postal code
                                    </label>
                                    <input
                                        className="w-full border rounded-md px-3 py-2 bg-white"
                                        value={postal}
                                        onChange={(e) => setPostal(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeAndReset}
                                    className="px-4 py-2 rounded-lg bg-slate-200"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-lg text-white ${
                                        loading
                                            ? "bg-blue-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    {loading ? "Saving…" : "Save changes"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
