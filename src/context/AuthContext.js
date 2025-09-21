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
        const saved = localStorage.getItem("auth");
        if (saved) {
            const { token, user } = JSON.parse(saved);
            if (token) {
                setToken(token);
                setUser(user);
                api.defaults.headers.Authorization = `Bearer ${token}`;
            }
        }
        setReady(true);
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

    // src/context/AuthContext.js
    const login = async (username, password) => {
        const { data } = await api.post("/api/auth/login", { username, password });

        const token = data.token;
        const user = {
            id: data.id,
            username: data.username,
            role: data.role,
        };

        setToken(token);
        setUser(user);

        // src/context/AuthContext.js (after successful login)
        setToken(data.token);
        setUser({ id: data.id, username: data.username, role: data.role });
        localStorage.setItem("auth", JSON.stringify({ token: data.token, user: { id: data.id, username: data.username, role: data.role } }));
        api.defaults.headers.Authorization = `Bearer ${data.token}`;


        router.replace("/"); // redirect after login
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
