import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthPage from './auth/AuthPage.tsx'

const pathname = window.location.pathname.replace(/\/+$/, '')
const isAuthPage =
  pathname === '/login' || pathname === '/register' || pathname === '/auth-preview' || pathname === '/auth-preview.html'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAuthPage ? <AuthPage /> : <App />}
  </StrictMode>,
)
