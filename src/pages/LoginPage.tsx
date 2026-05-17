import { LogIn } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { usePageMeta } from '../lib/seo'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isConfigured } = useAuth()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  usePageMeta('Iniciar sesion | AsesorMaps', 'Accede a tu cuenta de asesor o admin en AsesorMaps.')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')

    if (!supabase) {
      setMessage('Supabase no esta configurado. Revisa el archivo .env.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="hidden pr-10 lg:block">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#166534]">Acceso seguro</p>
        <h1 className="mt-3 text-4xl font-bold text-[#111827]">Entra a tu espacio profesional</h1>
        <p className="mt-4 text-lg leading-8 text-[#6B7280]">
          Gestiona propiedades, favoritos, leads y tu perfil desde una sesion conectada a Supabase Auth.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-[#DCFCE7] text-[#166534]">
            <LogIn className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-2xl font-bold text-[#111827]">Iniciar sesion</h2>
          <p className="mt-2 text-sm text-[#6B7280]">Usa el correo y contrasena con los que te registraste.</p>
        </div>

        <div className="grid gap-4">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" required />
          <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Contrasena" required />
        </div>

        {!isConfigured && (
          <p className="mt-4 rounded-md bg-[#FEF3C7] p-3 text-sm text-[#92400E]">Falta configurar Supabase en `.env`.</p>
        )}
        {message && <p className="mt-4 rounded-md bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">{message}</p>}

        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        <p className="mt-5 text-center text-sm text-[#6B7280]">
          No tienes cuenta? <Link to="/registro" className="font-semibold text-[#166534]">Registrate</Link>
        </p>
        <p className="mt-2 text-center text-sm text-[#6B7280]">
          <Link to="/recuperar-password" className="font-semibold text-[#166534]">Olvide mi contrasena</Link>
        </p>
      </form>
    </section>
  )
}
