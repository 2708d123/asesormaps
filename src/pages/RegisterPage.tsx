import { UserPlus } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { supabase } from '../lib/supabase'
import { usePageMeta } from '../lib/seo'
import { slugify } from '../lib/utils'

export function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('Hermosillo')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  usePageMeta('Registro de asesor | AsesorMaps', 'Crea una cuenta como asesor inmobiliario independiente en AsesorMaps.')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    setSuccess(false)

    if (!supabase) {
      setMessage('Supabase no esta configurado. Revisa el archivo .env.')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role: 'advisor',
          city,
        },
      },
    })

    if (error) {
      setLoading(false)
      setMessage(error.message)
      return
    }

    if (data.session && data.user) {
      const profilePayload = {
        id: data.user.id,
        role: 'advisor',
        full_name: fullName,
        email,
        phone,
        city,
      }

      const { error: profileError } = await supabase.from('profiles').insert(profilePayload)
      if (profileError) {
        setLoading(false)
        setMessage(profileError.message)
        return
      }

      const { error: advisorError } = await supabase.from('advisor_profiles').insert({
        user_id: data.user.id,
        slug: `${slugify(fullName)}-${data.user.id.slice(0, 6)}`,
        display_name: fullName,
        whatsapp: phone,
        city,
        verification_status: 'not_started',
        status: 'pending',
        verified: false,
      })
      if (advisorError) {
        setLoading(false)
        setMessage(advisorError.message)
        return
      }

      setLoading(false)
      navigate('/dashboard/perfil')
      return
    }

    setLoading(false)
    setSuccess(true)
    setMessage('Cuenta creada. Si Supabase tiene confirmacion por email activa, revisa tu correo antes de iniciar sesion.')
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="hidden pr-10 lg:block">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#166534]">Registro conectado</p>
        <h1 className="mt-3 text-4xl font-bold text-[#111827]">Crea tu cuenta de asesor</h1>
        <p className="mt-4 text-lg leading-8 text-[#6B7280]">
          AsesorMaps es una plataforma para asesores inmobiliarios independientes. Tu perfil inicia pendiente de verificacion.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-[#DCFCE7] text-[#166534]">
            <UserPlus className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-2xl font-bold text-[#111827]">Registro de asesor</h2>
          <p className="mt-2 text-sm text-[#6B7280]">Completa tus datos basicos para iniciar tu perfil profesional.</p>
        </div>

        <div className="grid gap-4">
          <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nombre completo" required />
          <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" required />
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="WhatsApp" required />
          <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ciudad" required />
          <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Contrasena" required minLength={6} />
        </div>

        {message && (
          <p className={`mt-4 rounded-md p-3 text-sm ${success ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
            {message}
          </p>
        )}

        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>

        <p className="mt-5 text-center text-sm text-[#6B7280]">
          Ya tienes cuenta? <Link to="/login" className="font-semibold text-[#166534]">Inicia sesion</Link>
        </p>
      </form>
    </section>
  )
}
