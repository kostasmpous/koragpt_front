"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { AUTH_STORAGE_KEY } from "@/lib/api";

const EMPTY_AUTH = { token: null, user: null };

const AuthContext = createContext(null);

function readStoredAuth() {
    if (typeof window === "undefined") {
        return EMPTY_AUTH;
    }

    try {
        const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) {
            return EMPTY_AUTH;
        }

        const parsed = JSON.parse(raw);
        const token = typeof parsed?.token === "string" ? parsed.token : null;
        const user = parsed?.user ?? null;

        return { token, user };
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("Failed to parse stored auth", err);
        }
        return EMPTY_AUTH;
    }
}

function selectFirst(source, keys) {
    if (!source || typeof source !== "object") return undefined;
    for (const key of keys) {
        if (source[key] != null) {
            return source[key];
        }
    }
    return undefined;
}

function normalizeAuthResponse(payload) {
    if (!payload || typeof payload !== "object") {
        return EMPTY_AUTH;
    }

    const sources = [payload, payload.data].filter((value) => value && typeof value === "object");

    let token = null;
    let user = null;

    for (const source of sources) {
        if (token == null) {
            const nextToken = selectFirst(source, ["token", "accessToken", "access_token", "jwt"]);
            if (typeof nextToken === "string" && nextToken.length > 0) {
                token = nextToken;
            }
        }
        if (user == null) {
            const nextUser = selectFirst(source, ["user", "account", "profile"]);
            if (nextUser != null) {
                user = nextUser;
            }
        }
        if (token && user != null) {
            break;
        }
    }

    return {
        token: token ?? null,
        user: user ?? null,
    };
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    const persistAuth = useCallback((nextUser, nextToken) => {
        if (typeof window === "undefined") {
            return;
        }

        try {
            if (nextToken) {
                const payload = JSON.stringify({ token: nextToken, user: nextUser ?? null });
                window.localStorage.setItem(AUTH_STORAGE_KEY, payload);
            } else {
                window.localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        } catch (err) {
            if (process.env.NODE_ENV !== "production") {
                console.warn("Failed to persist auth", err);
            }
        }
    }, []);

    const setSession = useCallback(
        (nextUser, nextToken) => {
            setUser(nextUser ?? null);
            setToken(nextToken ?? null);
            persistAuth(nextUser ?? null, nextToken ?? null);
        },
        [persistAuth],
    );

    useEffect(() => {
        const stored = readStoredAuth();
        setToken(stored.token);
        setUser(stored.user);
        setReady(true);
    }, []);

    useEffect(() => {
        if (token) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common.Authorization;
        }
    }, [token]);

    const login = useCallback(
        async (usernameOrPayload, password, extras = {}) => {
            const body =
                typeof usernameOrPayload === "object" && usernameOrPayload !== null && !Array.isArray(usernameOrPayload)
                    ? usernameOrPayload
                    : { username: usernameOrPayload, password, ...extras };

            const response = await api.post("/api/auth/login", body);
            const auth = normalizeAuthResponse(response?.data);
            setSession(auth.user, auth.token);
            return response?.data;
        },
        [setSession],
    );

    const register = useCallback(
        async (usernameOrPayload, password, extras = {}) => {
            const body =
                typeof usernameOrPayload === "object" && usernameOrPayload !== null && !Array.isArray(usernameOrPayload)
                    ? usernameOrPayload
                    : { username: usernameOrPayload, password, ...extras };

            const response = await api.post("/api/auth/register", body);
            const auth = normalizeAuthResponse(response?.data);
            setSession(auth.user, auth.token);
            return response?.data;
        },
        [setSession],
    );

    const logout = useCallback(() => {
        setSession(null, null);
    }, [setSession]);

    const value = useMemo(
        () => ({
            ready,
            user,
            token,
            login,
            register,
            logout,
        }),
        [ready, user, token, login, register, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
