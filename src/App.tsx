import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'

/**
 * Routing tanpa dependency: baca path URL dengan dukungan popstate
 * dan client-side navigation untuk link internal.
 */
export default function App() {
  const [path, setPath] = useState(() => window.location.pathname.replace(/\/+$/, '') || '/')

  useEffect(() => {
    const syncPath = () => {
      setPath(window.location.pathname.replace(/\/+$/, '') || '/')
    }

    const onLinkClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href) return

      // Navigasi internal untuk / dan /dashboard
      if (
        (href === '/' || href === '/dashboard') &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !event.altKey &&
        target.target !== '_blank'
      ) {
        event.preventDefault()
        if (window.location.pathname !== href) {
          window.history.pushState({}, '', href)
          setPath(href)
          window.scrollTo(0, 0)
        }
      }
    }

    window.addEventListener('popstate', syncPath)
    document.addEventListener('click', onLinkClick)

    return () => {
      window.removeEventListener('popstate', syncPath)
      document.removeEventListener('click', onLinkClick)
    }
  }, [])

  return path === '/dashboard' ? <Dashboard /> : <Landing />
}
