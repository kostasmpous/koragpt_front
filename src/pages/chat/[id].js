// src/pages/chat/[id].js
import { useRouter } from "next/router";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import Composer from "@/components/Composer";

const BASE_URL = "http://localhost:8080";

export default function ChatPage() {
    const { query } = useRouter();
    const chatId = query.id;

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [messages, setMessages] = useState([]);

    // models state
    const [models, setModels] = useState([]); // [{ model, display_name }]
    const [model, setModel] = useState("");   // selected model

    const scrollRef = useRef(null);

    // fetch available models
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/modelsai/OpenAI`, {
                    headers: { Accept: "application/json" },
                });
                const arr = Array.isArray(res.data) ? res.data : [];
                if (!active) return;
                setModels(arr);
                if (!model && arr.length > 0) setModel(arr[0].model);
            } catch (e) {
                console.error("Failed to load models", e);
            }
        })();
        return () => { active = false; };
    }, [model]);

    // normalize + fetch messages
    const fetchMessages = useCallback(async () => {
        if (!chatId) return;
        try {
            const res = await axios.get(`${BASE_URL}/api/chats/${chatId}`, {
                headers: { Accept: "application/json" },
            });
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
    }, [chatId]);

    // initial + polling
    useEffect(() => {
        if (!chatId) return;
        let active = true;
        fetchMessages();
        const interval = setInterval(() => {
            if (active) fetchMessages();
        }, 3000);
        return () => { active = false; clearInterval(interval); };
    }, [chatId, fetchMessages]);

    // auto-scroll
    useEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages.length]);

    if (loading) return <div className="p-6 text-slate-500">Loading chat…</div>;
    if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

    return (
        <div className="h-full w-full flex flex-col">
            {/* 🔽 Replace Chat #{chatId} with just the model dropdown */}
            <header className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2">
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
            </header>

            <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-1">
                {messages.map((m, i) => {
                    const prevRole = i > 0 ? messages[i - 1].role : null;
                    const newGroup = i === 0 || m.role !== prevRole; // extra space when speaker switches

                    const base =
                        "max-w-[75%] px-4 py-3 rounded-2xl shadow-sm whitespace-pre-wrap break-words";
                    const userCls =
                        "ml-auto bg-blue-600 text-white rounded-br-none"; // user on RIGHT, bold color
                    const aiCls =
                        "bg-white text-black border border-slate-200 rounded-bl-none"; // assistant on LEFT, light card

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



            <Composer chatId={chatId} model={model} onSent={fetchMessages} />
        </div>
    );
}
