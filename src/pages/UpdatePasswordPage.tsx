import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { supabase } from '../lib/supabase'
import { usePageMeta } from '../lib/seo'

export function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  usePageMeta('Actualizar contrasena | AsesorMaps', 'Actualiza la contrasena de tu cuenta de asesor.')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    setSuccess(false)

    if (!supabase) {
      setMessage('Supabase no esta configurado.')
      return
    }

    if (password.length < 6) {
      setMessage('La contrasena debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Las contrasenas no coinciden.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setSuccess(true)
    setMessage('Contrasena actualizada correctamente.')
    window.setTimeout(() => navigate('/dashboard'), 900)
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#111827]">Actualizar contrasena</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Escribe tu nueva contrasena para recuperar el acceso.</p>

        <div className="mt-6 grid gap-4">
          <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Nueva contrasena" required />
          <Input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" placeholder="Confirmar contrasena" required />
        </div>

        {message && (
          <p className={`mt-4 rounded-md p-3 text-sm ${success ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
            {message}
          </p>
        )}

        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? 'Guardando...' : 'Actualizar contrasena'}
        </Button>

        <p className="mt-5 text-center text-sm text-[#6B7280]">
          <Link to="/login" className="font-semibold text-[#166534]">Volver a iniciar sesion</Link>
        </p>
      </form>
    </section>
  )
}
