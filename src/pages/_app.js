import "@/styles/globals.css";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/router";

function AppShell({ Component, pageProps }) {
    const router = useRouter();
    const isAuthRoute = router.pathname === "/login" || router.pathname === "/register";

    if (isAuthRoute) {
        return <Component {...pageProps} />;
    }

    return (
        <ProtectedRoute>
            <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 overflow-auto bg-white">
                    <Component {...pageProps} />
                </main>
            </div>
        </ProtectedRoute>
    );
}

export default function MyApp(props) {
    return (
        <AuthProvider>
            <AppShell {...props} />
        </AuthProvider>
    );
}
