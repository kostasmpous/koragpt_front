// src/pages/chat/[id].js
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Composer from "@/components/Composer";
const BASE_URL = "http://localhost:8080";

export default function ChatPage() {
    const { query } = useRouter();
    const chatId = query.id;

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [messages, setMessages] = useState([]);

    const scrollRef = useRef(null);

    // fetch messages function
    const fetchMessages = async () => {
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
        } catch (e) {
            console.error("Failed to fetch messages", e);
            setErr(e?.message || "Failed to load chat");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!chatId) return;
        let active = true;

        // initial fetch
        fetchMessages();

        // poll every 3 seconds
        const interval = setInterval(() => {
            if (active) fetchMessages();
        }, 3000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [chatId]);

    // auto-scroll to bottom when messages change
    useEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages.length]);

    if (loading) return <div className="p-6 text-slate-500">Loading chat…</div>;
    if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

    return (
        <div className="h-full w-full flex flex-col">
            <header className="px-6 py-4 border-b bg-slate-50">
                <h1 className="text-lg font-semibold">Chat #{chatId}</h1>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-3">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={
                            m.role === "user"
                                ? "max-w-[75%] rounded-2xl px-4 py-2 bg-blue-100"
                                : "ml-auto max-w-[75%] rounded-2xl px-4 py-2 bg-gray-100"
                        }
                    >
                        <div className="text-xs text-slate-500 mb-1">{m.role}</div>
                        <div className="whitespace-pre-wrap text-black">{m.content}</div>
                    </div>
                ))}
            </div>
            <Composer chatId={chatId} onSent={fetchMessages} />

        </div>
    );

}
