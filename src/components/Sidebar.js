"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Sparkles, Moon, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080"; // your Spring backend
const userId = 1; // hardcoded for now

const Sidebar = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadChats = async () => {
            try {
                setLoading(true);
                setErr(null);

                // Expect: GET /api/users/{userId}/chats -> [{ id, title?, lastMessage?, ... }]
                const res = await axios.get(
                    `${BASE_URL}/api/chats/users/${userId}/chats`,
                    {
                        signal: controller.signal,
                        headers: { Accept: "application/json" },
                    }
                );

                const data = Array.isArray(res.data) ? res.data : [];

                // Normalize to { id, title, lastMessage }
                const items = data
                    .map((x) => ({
                        id: x.chatId,          // the id to link with
                        title: x.text || "Untitled chat", // show text as preview/title
                    }))
                    .filter((x) => x.id != null);
                setChats(items);
            } catch (e) {
                if (axios.isCancel(e)) return;
                setErr(e?.message || "Failed to load chats");
            } finally {
                setLoading(false);
            }
        };

        loadChats();
        return () => controller.abort();
    }, []);

    return (
        <aside className="flex flex-col justify-between w-64 h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-700 border-r border-blue-200 p-4">
            {/* Top Section */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <Image src="/logo.png" alt="Colorful AI logo" width={80} height={90} priority />
                    <span className="font-serif text-xl font-bold text-blue-600">KoraGPT</span>
                </div>

                <Link
                    href="/chat/new"
                    className="flex items-center gap-2 px-3 py-2 mb-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md w-full transition"
                >
                    <Plus className="w-4 h-4" />
                    New Chat
                </Link>

                <div className="text-sm font-semibold mb-2 text-blue-700">Recent Chats</div>

                {loading && <div className="text-xs text-slate-500">Loading…</div>}
                {err && <div className="text-xs text-red-600">Error: {err}</div>}

                <ul className="space-y-2 text-sm overflow-auto max-h-[300px] pr-1">
                    {chats.map((chat) => (
                        <li key={chat.id}>
                            <Link
                                href={`/chat/${chat.id}`}
                                className="block text-blue-900 hover:bg-blue-200 px-2 py-1 rounded-md"
                                title={chat.title}
                            >
                                {chat.title.length > 30 ? chat.title.slice(0, 30) + "…" : chat.title}
                            </Link>
                        </li>
                    ))}
                </ul>

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
};

export default Sidebar;
