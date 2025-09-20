import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: { Accept: "application/json" },
});

// If you want robust refresh handling later, add interceptors here.

export default api;
