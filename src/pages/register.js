// src/pages/login.js
"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Login() {
    const { login } = useAuth();
    const [username, setU] = useState("");
    const [password, setP] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setErr(null); setLoading(true);
        try { await login(username, password); }
        catch (e) { setErr("Invalid credentials"); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <form onSubmit={submit} className="bg-white p-6 rounded-xl border w-80 space-y-3">
                <h1 className="text-lg font-semibold">Sign in</h1>
                {err && <div className="text-sm text-red-600">{err}</div>}
                <input className="w-full border rounded-md px-3 py-2" placeholder="Username"
                       value={username} onChange={(e)=>setU(e.target.value)} />
                <input className="w-full border rounded-md px-3 py-2" type="password" placeholder="Password"
                       value={password} onChange={(e)=>setP(e.target.value)} />
                <button disabled={loading}
                        className={`w-full rounded-md py-2 text-white ${loading? "bg-blue-400":"bg-blue-600 hover:bg-blue-700"}`}>
                    {loading? "Signing in…" : "Sign in"}
                </button>
                <p className="text-sm">No account? <Link className="text-blue-600 hover:underline" href="/register">Register</Link></p>
            </form>
        </div>
    );
}
