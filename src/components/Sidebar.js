"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
    Plus,
    Sparkles,
    Moon,
    Settings,
    RotateCcw,
    Loader2,
    LogOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import SettingsDialog from "@/components/SettingsDialog";

const REFRESH_MS = 8000000;
const ERROR_BACKOFF_MS = 4000;

export default function Sidebar() {
    const router = useRouter();
    const { user, logout, ready } = useAuth();
    const userId = user?.id;
    const [showSettings, setShowSettings] = useState(false);
    const activeId = router.pathname.startsWith("/chat/") ? router.query?.id : null;

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [creating, setCreating] = useState(false);

    const inFlight = useRef(false);
    const lastErrorAt = useRef(0);

    async function loadChats() {
        if (!ready || !userId) return;
        if (inFlight.current) return;
        if (document.visibilityState === "hidden") return;

        const sinceErr = Date.now() - lastErrorAt.current;
        if (sinceErr < ERROR_BACKOFF_MS) return;

        const controller = new AbortController();
        try {
            inFlight.current = true;
            if (!chats.length) setLoading(true);
            setErr(null);

            const res = await api.get(`/api/chats/users/${userId}/chats`, {
                signal: controller.signal,
            });

            const data = Array.isArray(res.data) ? res.data : [];
            const items = data
                .map((x) => ({ id: x.chatId, title: x.text || "Untitled chat" }))
                .filter((x) => x.id != null);

            setChats(items);
        } catch (e) {
            if (e?.name !== "CanceledError") {
                setErr(e?.message || "Failed to load chats");
                lastErrorAt.current = Date.now();
            }
        } finally {
            setLoading(false);
            inFlight.current = false;
            controller.abort();
        }
    }

    useEffect(() => {
        if (!ready || !userId) return;
        loadChats();
    }, [ready, userId]);

    useEffect(() => {
        if (!ready || !userId) return;

        const tick = () => loadChats();
        const onFocus = () => loadChats();

        const id = setInterval(tick, REFRESH_MS);
        window.addEventListener("focus", onFocus);

        return () => {
            clearInterval(id);
            window.removeEventListener("focus", onFocus);
        };
    }, [ready, userId]);

    const handleNewChat = async () => {
        if (!userId || creating) return;
        setCreating(true);
        try {
            const res = await api.post(`/api/chats`, { userId: String(userId) });
            const newChat = res.data;
            const newId = newChat?.id ?? newChat?.chatId;

            setChats((prev) => [
                { id: newId, title: newChat?.title || "New Chat" },
                ...prev,
            ]);
            if (newId != null) router.push(`/chat/${newId}`);

            loadChats();
        } catch (e) {
            console.error("Failed to create chat", e);
            alert(e?.response?.data?.message || e.message || "Failed to create chat");
        } finally {
            setCreating(false);
        }
    };

    if (!ready || !userId) return null;

    return (
        <aside className="flex flex-col justify-between w-64 h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-700 border-r border-blue-200 p-4">
            {/* Top Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="KoraGPT logo"
                            width={36}
                            height={36}
                            priority
                        />
                        <span className="font-serif text-xl font-bold text-blue-600">
              KoraGPT
            </span>
                    </div>
                </div>

                <button
                    onClick={handleNewChat}
                    disabled={creating}
                    className={`flex items-center justify-center gap-2 px-3 py-2 mb-4 rounded-md w-full transition text-white ${
                        creating
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {creating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                    {creating ? "Creating…" : "New Chat"}
                </button>

                <div className="text-sm font-semibold mb-2 text-blue-700">
                    Recent Chats
                </div>

                {loading && (
                    <ul className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <li
                                key={i}
                                className="h-8 bg-blue-200/40 animate-pulse rounded-md"
                            />
                        ))}
                    </ul>
                )}

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
                                            isActive
                                                ? "bg-blue-600 text-white"
                                                : "text-blue-900 hover:bg-blue-200",
                                        ].join(" ")}
                                        aria-current={isActive ? "page" : undefined}
                                        title={chat.title}
                                    >
                                        <div className="font-medium truncate">
                                            {chat.title.length > 30
                                                ? chat.title.slice(0, 30) + "…"
                                                : chat.title}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                        {chats.length === 0 && (
                            <li className="text-xs text-slate-500 px-1">
                                No chats yet — start a new one!
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {/* Bottom Section */}
            <div className="space-y-2 text-sm">

                <button
                    className="flex items-center gap-2 px-2 py-1 hover:bg-blue-200 rounded-md w-full"
                    onClick={() => setShowSettings(true)}
                >
                    <Settings className="w-4 h-4" /> Settings
                </button>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-red-200 rounded-md w-full text-red-600"
                >
                    <LogOut className="w-4 h-4" /> Log out
                </button>
                <div className="mt-3 text-xs text-blue-500">Free Plan 🌟</div>
            </div>

            <SettingsDialog
                open={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </aside>
    );
}
