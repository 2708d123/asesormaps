import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { supabase } from '../lib/supabase'
import { usePageMeta } from '../lib/seo'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  usePageMeta('Recuperar contrasena | AsesorMaps', 'Recupera el acceso a tu cuenta de asesor en AsesorMaps.')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    setSuccess(false)

    if (!supabase) {
      setMessage('Supabase no esta configurado.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/actualizar-password`,
    })
    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setSuccess(true)
    setMessage('Te enviamos un correo para actualizar tu contrasena.')
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#111827]">Recuperar contrasena</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Escribe tu email y te enviaremos un enlace seguro.</p>

        <Input className="mt-6" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" required />

        {message && (
          <p className={`mt-4 rounded-md p-3 text-sm ${success ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
            {message}
          </p>
        )}

        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </Button>

        <p className="mt-5 text-center text-sm text-[#6B7280]">
          <Link to="/login" className="font-semibold text-[#166534]">Volver a iniciar sesion</Link>
        </p>
      </form>
    </section>
  )
}
