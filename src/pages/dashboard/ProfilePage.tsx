import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAuth } from '../../contexts/AuthContext'
import { fetchMyAdvisorProfile, mapAdvisor } from '../../lib/propertyService'
import { supabase } from '../../lib/supabase'
import { slugify } from '../../lib/utils'
import type { Advisor } from '../../types'

const fallbackPhoto =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'

export function ProfilePage() {
  const { user, refreshProfile } = useAuth()
  const [advisor, setAdvisor] = useState<Advisor | null>(null)
  const [advisorId, setAdvisorId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    displayName: '',
    slug: '',
    bio: '',
    whatsapp: '',
    emailPublic: '',
    city: 'Hermosillo',
    zones: '',
    yearsExperience: '',
    profilePhotoUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    websiteUrl: '',
  })

  useEffect(() => {
    let cancelled = false
    async function loadProfile() {
      if (!user) return
      setLoading(true)
      setMessage('')
      try {
        const result = await fetchMyAdvisorProfile(user.id)
        if (cancelled) return
        if (!result) {
          setMessage('No encontramos tu perfil de asesor.')
          return
        }
        const mapped = mapAdvisor(result)
        setAdvisor(mapped)
        setAdvisorId(result.id)
        setForm({
          displayName: mapped.displayName,
          slug: mapped.slug,
          bio: mapped.bio,
          whatsapp: mapped.whatsapp,
          emailPublic: mapped.emailPublic ?? '',
          city: mapped.city,
          zones: mapped.zones.join(', '),
          yearsExperience: String(mapped.yearsExperience || ''),
          profilePhotoUrl: mapped.profilePhotoUrl,
          facebookUrl: mapped.facebookUrl ?? '',
          instagramUrl: mapped.instagramUrl ?? '',
          websiteUrl: mapped.websiteUrl ?? '',
        })
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : 'No se pudo cargar el perfil.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [user])

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'displayName' && !current.slug ? { slug: slugify(value) } : {}),
    }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    if (!supabase || !advisorId) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('advisor_profiles')
        .update({
          display_name: form.displayName,
          slug: slugify(form.slug || form.displayName),
          bio: form.bio,
          whatsapp: form.whatsapp,
          email_public: form.emailPublic || null,
          city: form.city,
          zone_specialty: form.zones,
          years_experience: form.yearsExperience ? Number(form.yearsExperience) : null,
          profile_photo_url: form.profilePhotoUrl || null,
          facebook_url: form.facebookUrl || null,
          instagram_url: form.instagramUrl || null,
          website_url: form.websiteUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', advisorId)

      if (error) throw error
      await refreshProfile()
      setMessage('Perfil actualizado correctamente.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el perfil.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 text-[#6B7280]">Cargando perfil...</div>

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Perfil profesional</h1>
          <p className="mt-2 text-[#6B7280]">Edita tu micrositio publico como asesor independiente.</p>
        </div>
        {advisor && (
          <Button asChild variant="outline">
            <Link to={`/asesor/${advisor.slug}`}>Ver pagina publica</Link>
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 rounded-lg border border-[#E5E7EB] bg-white p-6">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div>
            <img src={form.profilePhotoUrl || fallbackPhoto} alt="" className="h-48 w-48 rounded-lg object-cover" />
            <p className="mt-3 text-xs text-[#6B7280]">Por ahora usa una URL de foto. Despues podemos subir foto a Storage.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input required placeholder="Nombre publico" value={form.displayName} onChange={(event) => update('displayName', event.target.value)} />
            <Input required placeholder="Slug publico" value={form.slug} onChange={(event) => update('slug', event.target.value)} />
            <Input required placeholder="WhatsApp" value={form.whatsapp} onChange={(event) => update('whatsapp', event.target.value)} />
            <Input placeholder="Email publico" value={form.emailPublic} onChange={(event) => update('emailPublic', event.target.value)} />
            <Input required placeholder="Ciudad" value={form.city} onChange={(event) => update('city', event.target.value)} />
            <Input placeholder="Zonas separadas por coma" value={form.zones} onChange={(event) => update('zones', event.target.value)} />
            <Input type="number" placeholder="Anios de experiencia" value={form.yearsExperience} onChange={(event) => update('yearsExperience', event.target.value)} />
            <Input placeholder="URL de foto profesional" value={form.profilePhotoUrl} onChange={(event) => update('profilePhotoUrl', event.target.value)} />
            <Input placeholder="Instagram URL" value={form.instagramUrl} onChange={(event) => update('instagramUrl', event.target.value)} />
            <Input placeholder="Facebook URL" value={form.facebookUrl} onChange={(event) => update('facebookUrl', event.target.value)} />
            <Input placeholder="Sitio web URL" value={form.websiteUrl} onChange={(event) => update('websiteUrl', event.target.value)} />
          </div>
        </div>

        <textarea
          required
          value={form.bio}
          onChange={(event) => update('bio', event.target.value)}
          placeholder="Bio profesional"
          className="min-h-36 rounded-md border border-[#D1D5DB] bg-white px-3 py-3 text-sm outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#DCFCE7]"
        />

        {message && (
          <p className={`rounded-md p-3 text-sm ${message.includes('correctamente') ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
            {message}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar perfil'}</Button>
        </div>
      </form>
    </div>
  )
}
