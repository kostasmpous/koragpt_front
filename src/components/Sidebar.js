"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Plus, Sparkles, Moon, Settings, RotateCcw, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080";
const userId = 1; // hardcoded
const REFRESH_MS = 8000; // how often to check for updates

export default function Sidebar() {
    const router = useRouter();
    const activeId = router.pathname.startsWith("/chat/") ? router.query?.id : null;

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [creating, setCreating] = useState(false);

    const inFlight = useRef(false); // prevent overlapping loads

    const loadChats = async (controller) => {
        if (inFlight.current) return;
        try {
            inFlight.current = true;
            if (!chats.length) setLoading(true); // show skeletons only on first load
            setErr(null);

            const res = await axios.get(`${BASE_URL}/api/chats/users/${userId}/chats`, {
                signal: controller?.signal,
                headers: { Accept: "application/json" },
            });

            const data = Array.isArray(res.data) ? res.data : [];
            const items = data
                .map((x) => ({
                    id: x.chatId,
                    title: x.text || "Untitled chat",
                }))
                .filter((x) => x.id != null);

            setChats(items);
        } catch (e) {
            if (!axios.isCancel(e)) setErr(e?.message || "Failed to load chats");
        } finally {
            setLoading(false);
            inFlight.current = false;
        }
    };

    // initial load
    useEffect(() => {
        const controller = new AbortController();
        loadChats(controller);
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 🔁 periodic refresh + refetch on focus
    useEffect(() => {
        const controller = new AbortController();

        const tick = () => loadChats(controller);
        const onFocus = () => loadChats(controller);

        const id = setInterval(tick, REFRESH_MS);
        window.addEventListener("focus", onFocus);

        return () => {
            clearInterval(id);
            window.removeEventListener("focus", onFocus);
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // ➕ Create new chat
    const handleNewChat = async () => {
        if (creating) return;
        setCreating(true);
        try {
            const res = await axios.post(`${BASE_URL}/api/chats`, { userId: String(userId) });
            const newChat = res.data;
            const newId = newChat?.id ?? newChat?.chatId;

            // Optimistic add
            setChats((prev) => [
                { id: newId, title: newChat?.title || "New Chat" },
                ...prev,
            ]);

            if (newId != null) router.push(`/chat/${newId}`);

            // ensure server & client lists are in sync
            loadChats();
        } catch (e) {
            console.error("Failed to create chat", e);
            alert(e?.response?.data?.message || e.message || "Failed to create chat");
        } finally {
            setCreating(false);
        }
    };

    return (
        <aside className="flex flex-col justify-between w-64 h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-700 border-r border-blue-200 p-4">
            {/* Top Section */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <Image src="/logo.png" alt="KoraGPT logo" width={80} height={90} priority />
                    <span className="font-serif text-xl font-bold text-blue-600">KoraGPT</span>
                </div>

                <button
                    onClick={handleNewChat}
                    disabled={creating}
                    className={`flex items-center justify-center gap-2 px-3 py-2 mb-4 rounded-md w-full transition text-white ${
                        creating ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {creating ? "Creating…" : "New Chat"}
                </button>

                <div className="text-sm font-semibold mb-2 text-blue-700">Recent Chats</div>

                {/* Loading skeletons */}
                {loading && (
                    <ul className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <li key={i} className="h-8 bg-blue-200/40 animate-pulse rounded-md" />
                        ))}
                    </ul>
                )}

                {/* Error with Retry */}
                {!loading && err && (
                    <div className="text-xs text-red-600 flex items-center justify-between">
                        <span className="truncate pr-2">Error: {err}</span>
                        <button
                            className="flex items-center gap-1 px-2 py-1 text-blue-700 hover:bg-blue-200 rounded"
                            onClick={() => loadChats()}
                            title="Retry"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Retry
                        </button>
                    </div>
                )}

                {/* Chats */}
                {!loading && !err && (
                    <ul className="space-y-1 text-sm overflow-auto max-h-[300px] pr-1">
                        {chats.map((chat) => {
                            const isActive = String(activeId ?? "") === String(chat.id);
                            return (
                                <li key={chat.id}>
                                    <Link
                                        href={`/chat/${chat.id}`}
                                        className={[
                                            "block px-3 py-2 rounded-lg transition",
                                            isActive ? "bg-blue-600 text-white" : "text-blue-900 hover:bg-blue-200",
                                        ].join(" ")}
                                        aria-current={isActive ? "page" : undefined}
                                        title={chat.title}
                                    >
                                        <div className="font-medium truncate">
                                            {chat.title.length > 30 ? chat.title.slice(0, 30) + "…" : chat.title}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                        {chats.length === 0 && (
                            <li className="text-xs text-slate-500 px-1">No chats yet — start a new one!</li>
                        )}
                    </ul>
                )}
            </div>

            {/* Bottom Section */}
            <div className="space-y-2 text-sm">
                <button className="flex items-center gap-2 px-2 py-1 hover:bg-blue-200 rounded-md w-full">
                    <Sparkles className="w-4 h-4" /> Customize
                </button>
                <button className="flex items-center gap-2 px-2 py-1 hover:bg-blue-200 rounded-md w-full">
                    <Moon className="w-4 h-4" /> Dark Mode
                </button>
                <button className="flex items-center gap-2 px-2 py-1 hover:bg-blue-200 rounded-md w-full">
                    <Settings className="w-4 h-4" /> Settings
                </button>
                <div className="mt-3 text-xs text-blue-500">Free Plan 🌟</div>
            </div>
        </aside>
    );
}
