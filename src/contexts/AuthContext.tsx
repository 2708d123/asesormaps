import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { slugify } from '../lib/utils'

export type AppRole = 'advisor' | 'agency' | 'admin'

type Profile = {
  id: string
  role: AppRole
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  city: string | null
}

type AuthContextValue = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isConfigured: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const isConfigured = Boolean(supabase)

  const ensureProfile = async (user: User): Promise<Profile | null> => {
    if (!supabase) return null
    const metadata = user.user_metadata ?? {}
    const role = (metadata.role as AppRole | undefined) ?? 'advisor'
    const fullName = (metadata.full_name as string | undefined) ?? user.email ?? 'Usuario'
    const phone = (metadata.phone as string | undefined) ?? null
    const city = (metadata.city as string | undefined) ?? 'Hermosillo'

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      role,
      full_name: fullName,
      email: user.email,
      phone,
      city,
    })

    if (error) {
      console.warn('No se pudo crear perfil automaticamente', error.message)
      return null
    }

    if (role === 'advisor') {
      const { error: advisorError } = await supabase.from('advisor_profiles').insert({
        user_id: user.id,
        slug: `${slugify(fullName)}-${user.id.slice(0, 6)}`,
        display_name: fullName,
        whatsapp: phone,
        city,
        verification_status: 'not_started',
        verified: false,
        status: 'pending',
      })

      if (advisorError) {
        console.warn('No se pudo crear perfil de asesor automaticamente', advisorError.message)
      }
    }

    return loadProfile(user)
  }

  const loadProfile = async (user: User): Promise<Profile | null> => {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, email, phone, avatar_url, city')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.warn('No se pudo cargar el perfil', error.message)
      return null
    }

    if (!data) return ensureProfile(user)

    setProfile(data as Profile | null)
    return data as Profile | null
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session?.user) await loadProfile(data.session.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        void loadProfile(nextSession.user)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      isConfigured,
      signOut: async () => {
        await supabase?.auth.signOut()
        setSession(null)
        setProfile(null)
      },
      refreshProfile: async () => {
        if (session?.user) await loadProfile(session.user)
      },
    }),
    [session, profile, loading, isConfigured],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
