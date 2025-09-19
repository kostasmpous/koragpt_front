// src/components/Composer.js
"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080";
const USER_ID = 1; // hardcoded, replace with auth later
const MODEL = "gpt-4o-mini"; // default model

export default function Composer({ chatId, onSent }) {
    const [value, setValue] = useState("");
    const [sending, setSending] = useState(false);
    const taRef = useRef(null);

    // auto-grow textarea
    useEffect(() => {
        if (!taRef.current) return;
        taRef.current.style.height = "0px";
        taRef.current.style.height = Math.min(200, taRef.current.scrollHeight) + "px";
    }, [value]);

    const send = async () => {
        const text = value.trim();
        if (!text || sending) return;

        setSending(true);
        try {
            await axios.post(`${BASE_URL}/api/messages`, {
                text,
                chatId: Number(chatId),
                userId: USER_ID,
                model: MODEL,
            });

            setValue("");
            onSent?.(); // trigger refresh of messages
        } catch (e) {
            console.error("Failed to send message", e);
        } finally {
            setSending(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="p-4 border-t bg-white">
            <div className="flex items-end gap-2">
        <textarea
            ref={taRef}
            className="flex-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Type a message…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={5000}
        />
                <button
                    onClick={send}
                    disabled={sending || !value.trim()}
                    className={`px-4 py-2 rounded-xl text-white transition ${
                        sending || !value.trim()
                            ? "bg-blue-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {sending ? "Sending…" : "Send"}
                </button>
            </div>
            <div className="text-xs text-slate-400 mt-1">
                Press Enter to send • Shift+Enter for newline
            </div>
        </div>
    );
}
