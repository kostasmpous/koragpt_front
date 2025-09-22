// src/pages/chat/[id].js
"use client";

import { useRouter } from "next/router";
import { useEffect, useRef, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Composer from "@/components/Composer";

const PROVIDERS = ["OpenAI", "Google"]; // extend later if you add more

export default function ChatPage() {
    const { query } = useRouter();
    const chatId = query.id;
    const { ready, token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [messages, setMessages] = useState([]);

    // provider + models state
    const [provider, setProvider] = useState(PROVIDERS[0]); // default to OpenAI
    const [models, setModels] = useState([]);               // [{ model, display_name }]
    const [model, setModel] = useState("");                 // selected model

    const scrollRef = useRef(null);

    // fetch available models for the selected provider (after auth ready)
    useEffect(() => {
        if (!ready || !token || !provider) return;
        let active = true;

        (async () => {
            try {
                // e.g. /api/modelsai/OpenAI or /api/modelsai/Gemini
                const res = await api.get(`/api/modelsai/${encodeURIComponent(provider)}`);
                const arr = Array.isArray(res.data) ? res.data : [];
                if (!active) return;

                setModels(arr);
                // if current model isn't in the new list, pick the first one
                const exists = arr.some((m) => m.model === model);
                if (!exists) {
                    setModel(arr[0]?.model || "");
                }
            } catch (e) {
                console.error(`Failed to load models for ${provider}`, e);
                setModels([]);
                setModel("");
            }
        })();

        return () => { active = false; };
        // include provider; no need to include `model` in deps (we reconcile inside)
    }, [ready, token, provider]);

    // normalize + fetch messages
    const fetchMessages = useCallback(async () => {
        if (!chatId || !ready || !token) return;
        try {
            const res = await api.get(`/api/chats/${chatId}`);
            const data = res.data ?? {};
            const list = Array.isArray(data.text)
                ? data.text.map((t) => ({
                    role: t.user === "AI" ? "assistant" : "user",
                    content: t.message ?? "",
                }))
                : [];
            setMessages(list);
            setErr(null);
        } catch (e) {
            setErr(e?.message || "Failed to load chat");
        } finally {
            setLoading(false);
        }
    }, [chatId, ready, token]);

    // initial + polling
    useEffect(() => {
        if (!chatId || !ready || !token) return;
        let active = true;
        fetchMessages();
        const id = setInterval(() => {
            if (active && document.visibilityState === "visible") fetchMessages();
        }, 8000);
        window.addEventListener("focus", fetchMessages);
        return () => {
            active = false;
            clearInterval(id);
            window.removeEventListener("focus", fetchMessages);
        };
    }, [chatId, ready, token, fetchMessages]);

    // auto-scroll
    useEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages.length]);

    if (!ready) return null;
    if (loading) return <div className="p-6 text-slate-500">Loading chat…</div>;
    if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

    return (
        <div className="h-full w-full flex flex-col">
            {/* Header with provider + model dropdowns */}
            <header className="px-6 py-4 border-b bg-slate-50 flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <label htmlFor="provider-select" className="text-sm font-medium text-black">
                        Provider:
                    </label>
                    <select
                        id="provider-select"
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="border rounded px-2 py-1 text-sm text-black bg-white"
                    >
                        {PROVIDERS.map((p) => (
                            <option key={p} value={p} className="text-black">
                                {p}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label htmlFor="model-select" className="text-sm font-medium text-black">
                        Model:
                    </label>
                    <select
                        id="model-select"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="border rounded px-2 py-1 text-sm text-black bg-white"
                        disabled={models.length === 0}
                    >
                        {models.map((m) => (
                            <option key={m.model} value={m.model} className="text-black">
                                {m.display_name ?? m.model}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-1">
                {messages.map((m, i) => {
                    const prevRole = i > 0 ? messages[i - 1].role : null;
                    const newGroup = i === 0 || m.role !== prevRole;

                    const base =
                        "max-w-[75%] px-4 py-3 rounded-2xl shadow-sm whitespace-pre-wrap break-words";
                    const userCls = "ml-auto bg-blue-600 text-white rounded-br-none";
                    const aiCls = "bg-white text-black border border-slate-200 rounded-bl-none";

                    return (
                        <div
                            key={i}
                            className={`${base} ${m.role === "user" ? userCls : aiCls} ${
                                newGroup ? "mt-4" : "mt-1"
                            }`}
                        >
                            {m.content}
                        </div>
                    );
                })}
            </div>

            {/* Composer will send the selected model; no need to send provider unless your backend requires it */}
            <Composer chatId={chatId} model={model} onSent={fetchMessages} />
        </div>
    );
}
