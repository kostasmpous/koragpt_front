// src/lib/api.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
    try {
        const saved = localStorage.getItem("auth");
        if (saved) {
            const { token } = JSON.parse(saved);
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch {}
    return config;
});

export default api;
