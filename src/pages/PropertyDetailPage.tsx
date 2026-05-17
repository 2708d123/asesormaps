import { AlertTriangle, Bath, BedDouble, Building2, Calendar, Car, Dog, Home, Ruler, Share2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdvisorVerificationBadge } from '../components/advisors/AdvisorVerificationBadge'
import { FavoriteButton } from '../components/properties/FavoriteButton'
import { PropertyGallery } from '../components/properties/PropertyGallery'
import { PropertyMap } from '../components/properties/PropertyMap'
import { ReportPropertyDialog } from '../components/properties/ReportPropertyDialog'
import { WhatsAppButton } from '../components/properties/WhatsAppButton'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { getAdvisor, getProperty } from '../data/mockData'
import { fetchAdvisorById, fetchPublicPropertyBySlug } from '../lib/propertyService'
import { formatPrice } from '../lib/utils'
import { PlaceholderPage } from './PlaceholderPage'
import { usePageMeta } from '../lib/seo'
import type { Advisor, Property } from '../types'

export function PropertyDetailPage() {
  const { slug = '' } = useParams()
  const mockProperty = getProperty(slug)
  const [remoteProperty, setRemoteProperty] = useState<Property | null>(null)
  const [remoteAdvisor, setRemoteAdvisor] = useState<Advisor | null>(null)
  const [loadingRemote, setLoadingRemote] = useState(!mockProperty)
  const property = remoteProperty ?? mockProperty
  const advisor = property ? remoteAdvisor ?? getAdvisor(property.advisorId) : undefined

  useEffect(() => {
    let cancelled = false
    setLoadingRemote(!mockProperty)
    fetchPublicPropertyBySlug(slug)
      .then(async (remote) => {
        if (cancelled) return
        setRemoteProperty(remote)
        if (remote) {
          const advisorData = await fetchAdvisorById(remote.advisorId)
          if (!cancelled) setRemoteAdvisor(advisorData)
        }
      })
      .catch((error) => console.warn('No se pudo cargar propiedad remota', error))
      .finally(() => {
        if (!cancelled) setLoadingRemote(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, mockProperty])

  usePageMeta(
    property
      ? `${property.propertyType} en ${property.operationType} en ${property.neighborhood}, ${property.city} | AsesorMaps`
      : 'Propiedad no encontrada | AsesorMaps',
    property
      ? `Conoce esta propiedad publicada por ${advisor?.verified ? 'un asesor inmobiliario verificado' : 'un asesor inmobiliario'} en AsesorMaps.`
      : 'La propiedad solicitada no esta disponible en AsesorMaps.',
  )

  if (loadingRemote) return <PlaceholderPage title="Cargando propiedad" />
  if (!property) return <PlaceholderPage title="Propiedad no encontrada" />

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `/propiedad/${property.slug}`

  const shareProperty = async () => {
    if (navigator.share) {
      await navigator.share({ title: property.title, url: shareUrl })
      return
    }
    await navigator.clipboard?.writeText(shareUrl)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PropertyGallery images={property.images} title={property.title} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <article>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone={property.operationType === 'venta' ? 'green' : 'gold'}>{property.operationType === 'venta' ? 'Venta' : 'Renta'}</Badge>
            <Badge>{property.propertyType}</Badge>
            {property.isFeatured && <Badge tone="gold">Destacada</Badge>}
          </div>
          <p className="text-3xl font-bold text-[#166534]">{formatPrice(property.price, property.currency)}</p>
          <h1 className="mt-2 text-3xl font-bold text-[#111827]">{property.title}</h1>
          <p className="mt-2 text-[#6B7280]">{property.neighborhood}, {property.city} - {property.zone}</p>
          <p className="mt-1 text-sm text-[#6B7280]">{property.addressApprox}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Feature icon={<BedDouble />} label="Recamaras" value={property.bedrooms ?? '-'} />
            <Feature icon={<Bath />} label="Banos" value={property.bathrooms ?? '-'} />
            <Feature icon={<Car />} label="Estac." value={property.parkingSpaces ?? '-'} />
            <Feature icon={<Ruler />} label="Terreno" value={`${property.landM2 ?? '-'} m2`} />
            <Feature icon={<Building2 />} label="Construccion" value={`${property.constructionM2 ?? '-'} m2`} />
            <Feature icon={<Home />} label="Medios banos" value={property.halfBathrooms ?? '-'} />
            <Feature icon={<Calendar />} label="Antiguedad" value={property.ageYears ? `${property.ageYears} anos` : '-'} />
            <Feature icon={<Dog />} label="Mascotas" value={property.petsAllowed ? 'Permitidas' : 'Consultar'} />
          </div>

          <div className="mt-8 rounded-lg border border-[#E5E7EB] bg-white p-6">
            <h2 className="text-xl font-bold text-[#111827]">Descripcion</h2>
            <p className="mt-3 leading-8 text-[#374151]">{property.description}</p>
            <div className="mt-6 grid gap-3 text-sm text-[#374151] sm:grid-cols-2">
              <p><span className="font-semibold text-[#111827]">Ciudad:</span> {property.city}</p>
              <p><span className="font-semibold text-[#111827]">Colonia:</span> {property.neighborhood}</p>
              <p><span className="font-semibold text-[#111827]">Zona:</span> {property.zone}</p>
              <p><span className="font-semibold text-[#111827]">Direccion aproximada:</span> {property.addressApprox}</p>
              <p><span className="font-semibold text-[#111827]">Amueblado:</span> {property.furnished ? 'Si' : 'No especificado'}</p>
              <p><span className="font-semibold text-[#111827]">ID publico:</span> {property.id}</p>
            </div>
            <h3 className="mt-6 font-bold text-[#111827]">Amenidades</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {property.amenities.map((amenity) => <Badge key={amenity}>{amenity}</Badge>)}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-4">
            <div className="mb-3">
              <h2 className="font-bold text-[#111827]">Ubicacion aproximada</h2>
              <p className="text-sm text-[#6B7280]">La ubicacion exacta se confirma directamente con el asesor.</p>
            </div>
            <div className="h-80 overflow-hidden rounded-lg border border-[#E5E7EB]">
              <PropertyMap properties={[property]} className="h-full" />
            </div>
          </div>

          <div className="mt-6 flex gap-3 rounded-lg border border-[#FACC15] bg-[#FFFBEB] p-4 text-sm text-[#92400E]">
            <AlertTriangle className="h-5 w-5 flex-none" />
            Nunca realices depositos sin verificar directamente la propiedad y la identidad del asesor.
          </div>
        </article>

        {advisor && (
          <aside className="h-fit rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <img src={advisor.profilePhotoUrl} alt={advisor.displayName} className="h-16 w-16 rounded-full object-cover" />
              <div>
                <h2 className="font-bold text-[#111827]">{advisor.displayName}</h2>
                <AdvisorVerificationBadge verified={advisor.verified} />
                <p className="mt-1 text-sm text-[#6B7280]">{advisor.city} - {advisor.zones[0]}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#6B7280]">{advisor.bio}</p>
            <div className="mt-5 grid gap-3">
              <WhatsAppButton property={property} phone={advisor.whatsapp} />
              <Button asChild variant="outline">
                <Link to={`/asesor/${advisor.slug}`}>Ver mas propiedades de este asesor</Link>
              </Button>
              <div className="flex gap-2">
                <FavoriteButton propertyId={property.id} />
                <Button variant="outline" size="icon" aria-label="Compartir" onClick={shareProperty}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <ReportPropertyDialog property={property} />
              </div>
            </div>
          </aside>
        )}
      </div>
    </section>
  )
}

function Feature({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="text-[#166534] [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <p className="mt-2 text-xs text-[#6B7280]">{label}</p>
      <p className="font-bold text-[#111827]">{value}</p>
    </div>
  )
}
