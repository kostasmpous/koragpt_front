import Image from "next/image";
import { Plus, Sparkles, Moon, Settings } from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
    const [chats, setChats] = useState([
        "Can you help me write a story about...",
        "Once upon a time in a land where...",
        "Please review this React component...",
        "I need inspiration for a vibrant...",
        "What are some good color palettes...",
    ]);

    return (
        <aside className="flex flex-col justify-between w-64 h-screen bg-gradient-to-b from-blue-50 to-blue-100 text-slate-700 border-r border-blue-200 p-4">
            {/* Top Section */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    {/* logo */}
                    <Image
                        src="/logo.png"   // path is relative to /public
                        alt="Colorful AI logo"
                        width={80}
                        height={90}
                        priority
                    />
                    <span className="font-serif text-xl font-bold text-blue-600">KoraGPT</span>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 mb-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md w-full transition">
                    <Plus className="w-4 h-4" />
                    New Chat
                </button>

                <div className="text-sm font-semibold mb-2 text-blue-700">Recent Chats</div>
                <ul className="space-y-2 text-sm overflow-auto max-h-[300px] pr-1">
                    {chats.map((chat, idx) => (
                        <li key={idx} className="text-blue-900 hover:bg-blue-200 px-2 py-1 rounded-md cursor-pointer">
                            {chat.length > 30 ? chat.slice(0, 30) + "..." : chat}
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
