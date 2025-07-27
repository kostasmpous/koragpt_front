import '../styles/globals.css'
import Sidebar from '../components/Sidebar'

function MyApp({ Component, pageProps }) {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-screen bg-white">
                <Component {...pageProps} />
            </main>
        </div>
    )
}

export default MyApp
