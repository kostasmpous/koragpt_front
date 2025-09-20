// src/components/ProtectedRoute.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, ready } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!ready) return;               // don’t redirect until we’ve loaded localStorage
        if (!user) router.replace("/login");
    }, [ready, user, router]);

    if (!ready) return null;            // or a loader
    if (!user) return null;             // while redirecting

    return children;
}
