import { AtSign, ExternalLink, Globe, Mail, MapPin, MessageCircle, Share2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdvisorVerificationBadge } from '../components/advisors/AdvisorVerificationBadge'
import { PropertyFilters } from '../components/properties/PropertyFilters'
import { PropertyGrid } from '../components/properties/PropertyGrid'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select } from '../components/ui/select'
import { advisors, defaultFilters, filterProperties, properties, sortOptions } from '../data/mockData'
import { fetchAdvisorBySlug, fetchPublicPropertiesByAdvisor } from '../lib/propertyService'
import { usePageMeta } from '../lib/seo'
import { buildWhatsAppUrl } from '../lib/utils'
import { PlaceholderPage } from './PlaceholderPage'
import type { Advisor, Property } from '../types'

export function AdvisorPage() {
  const { slug = '' } = useParams()
  const [filters, setFilters] = useState(defaultFilters)
  const [sortBy, setSortBy] = useState('recent')
  const mockAdvisor = advisors.find((item) => item.slug === slug)
  const [remoteAdvisor, setRemoteAdvisor] = useState<Advisor | null>(null)
  const [remoteProperties, setRemoteProperties] = useState<Property[]>([])
  const [loadingRemote, setLoadingRemote] = useState(!mockAdvisor)
  const advisor = remoteAdvisor ?? mockAdvisor
  const advisorProperties = useMemo(
    () => remoteProperties.length ? remoteProperties : properties.filter((property) => property.advisorId === advisor?.id && property.status === 'active'),
    [advisor, remoteProperties],
  )
  const catalog = useMemo(() => filterProperties(advisorProperties, filters, sortBy), [advisorProperties, filters, sortBy])
  const totalViews = advisorProperties.reduce((sum, property) => sum + property.viewsCount, 0)
  const updatedAt = advisorProperties
    .map((property) => property.createdAt)
    .sort()
    .at(-1)

  useEffect(() => {
    let cancelled = false
    setLoadingRemote(!mockAdvisor)
    fetchAdvisorBySlug(slug)
      .then(async (result) => {
        if (cancelled) return
        setRemoteAdvisor(result)
        if (result) {
          const advisorProperties = await fetchPublicPropertiesByAdvisor(result.id)
          if (!cancelled) setRemoteProperties(advisorProperties)
        }
      })
      .catch((error) => console.warn('No se pudo cargar asesor remoto', error))
      .finally(() => {
        if (!cancelled) setLoadingRemote(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, mockAdvisor])

  usePageMeta(
    advisor ? `Propiedades de ${advisor.displayName} | AsesorMaps` : 'Asesor no encontrado | AsesorMaps',
    advisor
      ? `Consulta el catalogo inmobiliario de ${advisor.displayName}, asesor inmobiliario independiente en ${advisor.city}.`
      : 'El asesor solicitado no esta disponible en AsesorMaps.',
  )

  if (loadingRemote) return <PlaceholderPage title="Cargando asesor" />
  if (!advisor) return <PlaceholderPage title="Asesor no encontrado" />

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `/asesor/${advisor.slug}`
  const contactUrl = buildWhatsAppUrl(advisor.whatsapp, `Catalogo de ${advisor.displayName}`, shareUrl)

  return (
    <section>
      <div className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
          <div className="flex flex-col items-start gap-4">
            <img src={advisor.profilePhotoUrl} alt={advisor.displayName} className="h-56 w-56 rounded-lg object-cover shadow-sm" />
            <div className="flex flex-wrap gap-2">
              {advisor.zones.map((zone) => (
                <Badge key={zone} tone="green">{zone}</Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <AdvisorVerificationBadge verified={advisor.verified} />
            <h1 className="mt-3 text-4xl font-bold text-[#111827]">{advisor.displayName}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#6B7280]">{advisor.bio}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Propiedades activas" value={advisorProperties.length} />
              <Metric label="Ciudad principal" value={advisor.city} />
              <Metric label="Vistas del catalogo" value={totalViews} />
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-sm text-[#374151]">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-[#166534]" />{advisor.city}</span>
              <span>{advisor.yearsExperience} anos de experiencia</span>
              <span>Ultima actualizacion: {updatedAt ?? 'mayo 2026'}</span>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href={contactUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Contactar asesor
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (navigator.share) await navigator.share({ title: advisor.displayName, url: shareUrl })
                  else await navigator.clipboard?.writeText(shareUrl)
                }}
              >
                <Share2 className="h-4 w-4" />
                Compartir catalogo
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {advisor.emailPublic && <ContactChip icon={<Mail />} label={advisor.emailPublic} href={`mailto:${advisor.emailPublic}`} />}
              {advisor.instagramUrl && <ContactChip icon={<AtSign />} label="Instagram" href={advisor.instagramUrl} />}
              {advisor.facebookUrl && <ContactChip icon={<ExternalLink />} label="Facebook" href={advisor.facebookUrl} />}
              {advisor.websiteUrl && <ContactChip icon={<Globe />} label="Sitio web" href={advisor.websiteUrl} />}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Catalogo de propiedades</h2>
            <p className="mt-2 text-[#6B7280]">{catalog.length} propiedades encontradas dentro del micrositio profesional.</p>
          </div>
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Ordenar catalogo del asesor" className="max-w-xs">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside>
            <PropertyFilters filters={filters} onChange={setFilters} />
          </aside>
          <PropertyGrid properties={catalog} />
        </div>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAF7] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#111827]">{value}</p>
    </div>
  )
}

function ContactChip({ icon, label, href }: { icon: ReactNode; label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#374151] hover:border-[#166534]">
      <span className="text-[#166534] [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {label}
    </a>
  )
}
