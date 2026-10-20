/**
 * Provider session Supabase: login, daftar, Google OAuth, logout.
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Profile } from '../types/db'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  // Cache per user, supaya tidak perlu setState sinkron di dalam effect.
  const [profiles, setProfiles] = useState<Record<string, Profile | null>>({})

  useEffect(() => {
    if (!supabase) return

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user?.id ?? null

  // Ambil profile 1:1 dari tabel `profiles` setiap user berubah.
  useEffect(() => {
    if (!supabase || !userId) return

    let cancelled = false
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setProfiles((prev) => ({ ...prev, [userId]: (data as Profile | null) ?? null }))
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const profile = userId ? (profiles[userId] ?? null) : null

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName?.trim() || undefined } },
    })
    if (error) throw error
    // Kalau "Confirm email" aktif di dashboard, session masih null -> user cek email.
    if (!data.session) {
      throw new Error('Pendaftaran berhasil. Cek email untuk konfirmasi, lalu masuk.')
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      configured: isSupabaseConfigured,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    }),
    [session, profile, loading, signIn, signUp, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
