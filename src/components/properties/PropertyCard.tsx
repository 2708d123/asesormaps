import { Bath, BedDouble, MapPin, Ruler } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAdvisor } from '../../data/mockData'
import { formatPrice } from '../../lib/utils'
import type { Property } from '../../types'
import { AdvisorVerificationBadge } from '../advisors/AdvisorVerificationBadge'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { FavoriteButton } from './FavoriteButton'
import { WhatsAppButton } from './WhatsAppButton'

export function PropertyCard({ property }: { property: Property }) {
  const advisor = getAdvisor(property.advisorId)
  const advisorName = advisor?.displayName ?? 'Asesor independiente'
  const advisorPhoto = advisor?.profilePhotoUrl ?? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
  const advisorVerified = advisor?.verified ?? false
  const advisorWhatsApp = advisor?.whatsapp ?? ''

  return (
    <article className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/propiedad/${property.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#E5E7EB]">
          <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge tone={property.operationType === 'venta' ? 'green' : 'gold'}>{property.operationType === 'venta' ? 'Venta' : 'Renta'}</Badge>
            {property.isFeatured && <Badge tone="gold">Destacada</Badge>}
          </div>
          <div className="absolute right-3 top-3">
            <FavoriteButton propertyId={property.id} />
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-bold text-[#111827]">{formatPrice(property.price, property.currency)}</p>
            <h3 className="mt-1 line-clamp-2 text-base font-semibold text-[#111827]">
              <Link to={`/propiedad/${property.slug}`}>{property.title}</Link>
            </h3>
          </div>
          <Badge>{property.propertyType}</Badge>
        </div>

        <p className="mt-2 flex items-center gap-1 text-sm text-[#6B7280]">
          <MapPin className="h-4 w-4" />
          {property.neighborhood}, {property.city}
        </p>

        <div className="mt-4 grid grid-cols-4 gap-2 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{property.bedrooms ?? '-'}</span>
          <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{property.bathrooms ?? '-'}</span>
          <span className="flex items-center gap-1"><Ruler className="h-4 w-4" />{property.landM2 ?? '-'} m2</span>
          <span>{property.constructionM2 ?? '-'} m2 const.</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E5E7EB] pt-4">
          {advisor ? (
            <Link to={`/asesor/${advisor.slug}`} className="flex min-w-0 items-center gap-2">
              <img src={advisorPhoto} alt={advisorName} className="h-9 w-9 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111827]">{advisorName}</p>
                <AdvisorVerificationBadge verified={advisorVerified} />
              </div>
            </Link>
          ) : (
            <div className="flex min-w-0 items-center gap-2">
              <img src={advisorPhoto} alt={advisorName} className="h-9 w-9 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#111827]">{advisorName}</p>
                <AdvisorVerificationBadge verified={advisorVerified} />
              </div>
            </div>
          )}
          {advisorWhatsApp && <WhatsAppButton property={property} phone={advisorWhatsApp} compact />}
        </div>

        <Button asChild variant="outline" className="mt-4 w-full">
          <Link to={`/propiedad/${property.slug}`}>Ver detalle</Link>
        </Button>
      </div>
    </article>
  )
}
