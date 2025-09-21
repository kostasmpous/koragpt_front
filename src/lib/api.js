import axios from "axios";

export const AUTH_STORAGE_KEY = "auth";

const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: { Accept: "application/json" },
});

function readTokenFromStorage() {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const token = parsed?.token;
        return typeof token === "string" && token.length > 0 ? token : null;
    } catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("Failed to read auth token from storage", err);
        }
        return null;
    }
}

const initialToken = readTokenFromStorage();
if (initialToken) {
    api.defaults.headers.common.Authorization = `Bearer ${initialToken}`;
}

api.interceptors.request.use((config) => {
    const token = readTokenFromStorage();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
