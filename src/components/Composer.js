// src/components/Composer.js
"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080";
const USER_ID = 1; // TODO: replace with auth later
const MAX_LEN = 5000;

export default function Composer({ chatId, model, onSent }) {
    const [value, setValue] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const taRef = useRef(null);
    const abortRef = useRef(null); // for cancel/stop

    // auto-grow textarea
    useEffect(() => {
        if (!taRef.current) return;
        const ta = taRef.current;
        ta.style.height = "0px";
        ta.style.height = Math.min(200, ta.scrollHeight) + "px";
    }, [value]);

    const send = async () => {
        const text = value.trim();
        if (!text || sending || !chatId) return;

        setSending(true);
        setError(null);

        // enable cancel
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            await axios.post(
                `${BASE_URL}/api/messages`,
                {
                    text,
                    chatId: Number(chatId),
                    userId: USER_ID,
                    model: model || "gpt-4o-mini", // fallback if dropdown hasn't loaded
                },
                { signal: controller.signal }
            );

            setValue("");
            onSent?.(); // refresh messages (your poller will also keep it fresh)
        } catch (e) {
            if (axios.isCancel(e)) {
                // user pressed Stop
            } else {
                console.error("Failed to send message", e);
                setError(e?.message || "Failed to send message");
            }
        } finally {
            setSending(false);
            abortRef.current = null;
        }
    };

    const stop = () => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
            setSending(false);
        }
    };

    const onKeyDown = (e) => {
        // IME composition guard
        if (e.nativeEvent.isComposing) return;

        // Enter to send, Shift+Enter newline
        if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            send();
            return;
        }
        // Cmd/Ctrl+Enter to send
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            send();
        }
    };

    const remaining = MAX_LEN - value.length;
    const disabled = sending || !value.trim() || !chatId;

    return (
        <div className="p-4 border-t bg-white">
            <div className="flex items-end gap-2">
        <textarea
            ref={taRef}
            className="flex-1 border rounded-2xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300 bg-white text-black placeholder-slate-400"
            placeholder="Type a message…"
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_LEN))}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={MAX_LEN}
            aria-label="Message input"
        />

                {!sending ? (
                    <button
                        onClick={send}
                        disabled={disabled}
                        className={`px-4 py-2 rounded-2xl text-white transition ${
                            disabled ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                        title="Send (Enter)"
                        aria-label="Send message"
                    >
                        Send
                    </button>
                ) : (
                    <button
                        onClick={stop}
                        className="px-4 py-2 rounded-2xl text-white bg-red-500 hover:bg-red-600 transition"
                        title="Stop"
                        aria-label="Stop sending"
                    >
                        Stop
                    </button>
                )}
            </div>

            <div className="mt-1 flex items-center justify-between text-xs">
                <div className="text-slate-400">
                    Press <span className="font-medium">Enter</span> to send •{" "}
                    <span className="font-medium">Shift+Enter</span> for newline •{" "}
                    <span className="font-medium">⌘/Ctrl+Enter</span> to send
                </div>
                <div className={`tabular-nums ${remaining < 0 ? "text-red-600" : "text-slate-400"}`}>
                    {remaining}
                </div>
            </div>

            {error && <div className="mt-2 text-xs text-red-600">Error: {error}</div>}

            {/* Model hint (optional, nice for debugging) */}
            <div className="mt-1 text-[11px] text-slate-400">
                Using model: <span className="font-medium">{model || "loading…"}</span>
            </div>
        </div>
    );
}
