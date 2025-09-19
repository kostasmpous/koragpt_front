// src/pages/_app.js
import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";

export default function MyApp({ Component, pageProps }) {
    return (
        <div className="flex h-screen">
            <Sidebar />                          {/* left column (always visible) */}
            <main className="flex-1 overflow-auto bg-white">
                <Component {...pageProps} />       {/* right column (changes by route) */}
            </main>
        </div>
    );
}
