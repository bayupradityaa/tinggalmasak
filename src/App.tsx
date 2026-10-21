import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'

/**
 * Routing tanpa dependency: cukup baca path URL.
 * Dua halaman saja — beranda (/) dan dashboard (/dashboard).
 */
export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  return path === '/dashboard' ? <Dashboard /> : <Landing />
}
