// src/pages/register.js
"use client";
import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function Register() {
    const [username, setU] = useState("");
    const [email, setE] = useState("");
    const [password, setP] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [success, setSuccess] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setErr(null);
        setSuccess(false);
        setLoading(true);

        try {
            await api.post("/api/auth/signup", {
                username,
                email,
                password,
                role: "user",
                active: true,
            });
            setSuccess(true);
        } catch (e) {
            console.error("Signup failed", e);
            setErr(e?.response?.data?.message || "Failed to register");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <form
                onSubmit={submit}
                className="bg-white p-6 rounded-xl border w-96 space-y-3"
            >
                <h1 className="text-lg font-semibold text-black">Create account</h1>

                {err && <div className="text-sm text-red-600">{err}</div>}
                {success && (
                    <div className="text-sm text-green-600">
                        ✅ Registration successful!{" "}
                        <Link href="/login" className="underline text-blue-600">
                            Sign in
                        </Link>
                    </div>
                )}

                <input
                    className="w-full border rounded-md px-3 py-2 text-black"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setU(e.target.value)}
                    required
                />
                <input
                    className="w-full border rounded-md px-3 py-2 text-black"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setE(e.target.value)}
                    required
                />
                <input
                    className="w-full border rounded-md px-3 py-2 text-black"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setP(e.target.value)}
                    required
                />

                <button
                    disabled={loading}
                    className={`w-full rounded-md py-2 text-white ${
                        loading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {loading ? "Registering…" : "Register"}
                </button>

                <p className="text-sm text-black">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Sign in
                    </Link>
                </p>
            </form>
        </div>
    );
}
