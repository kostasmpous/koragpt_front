"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const router = useRouter();
    const [user, setUser]   = useState(null);
    const [token, setToken] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("auth");
            if (saved) {
                const { token, user } = JSON.parse(saved);
                setToken(token);
                setUser(user);
                if (token) api.defaults.headers.Authorization = `Bearer ${token}`;
            }
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem("auth", JSON.stringify({ token, user }));
            api.defaults.headers.Authorization = `Bearer ${token}`;
        } else {
            localStorage.removeItem("auth");
            delete api.defaults.headers.Authorization;
        }
    }, [token, user]);

    const login = async (username, password) => {
        const { data } = await api.post("/api/auth/login", { username, password });
        setToken(data.token);
        setUser(data.user);
        await Promise.resolve();
        router.replace("/");
    };

    const register = async (username, email, password) => {
        await api.post("/api/auth/signup", { username, email, password, role: "user", active: true });
        router.replace("/login");
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        router.replace("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, ready, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
