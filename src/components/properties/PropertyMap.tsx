import L from 'leaflet'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import type { Property } from '../../types'
import { getAdvisor } from '../../data/mockData'
import { formatPrice } from '../../lib/utils'
import { AdvisorVerificationBadge } from '../advisors/AdvisorVerificationBadge'
import { Button } from '../ui/button'
import { WhatsAppButton } from './WhatsAppButton'
import { useEffect } from 'react'

const pinIcon = L.divIcon({
  className: '',
  html: '<div class="advisor-pin">$</div>',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -36],
})

function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap()

  useEffect(() => {
    if (!properties.length) return
    const bounds = L.latLngBounds(properties.map((property) => [property.lat, property.lng]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }, [map, properties])

  return null
}

export function PropertyMap({ properties, className = '' }: { properties: Property[]; className?: string }) {
  return (
    <div className={className}>
      <MapContainer center={[29.0892, -110.9613]} zoom={12} scrollWheelZoom className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds properties={properties} />
        {properties.map((property) => {
          const advisor = getAdvisor(property.advisorId)
          return (
            <Marker key={property.id} position={[property.lat, property.lng]} icon={pinIcon}>
              <Popup minWidth={260}>
                <div className="w-72 overflow-hidden rounded-lg bg-white">
                  <img src={property.images[0]} alt={property.title} className="h-32 w-full object-cover" />
                  <div className="p-3">
                    <p className="text-lg font-bold text-[#111827]">{formatPrice(property.price, property.currency)}</p>
                    <p className="mt-1 font-semibold text-[#111827]">{property.propertyType} en {property.operationType}</p>
                    <p className="text-sm text-[#6B7280]">{property.neighborhood}, {property.city}</p>
                    {advisor && (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{advisor.displayName}</p>
                          <AdvisorVerificationBadge verified={advisor.verified} />
                        </div>
                        <WhatsAppButton property={property} phone={advisor.whatsapp} compact />
                      </div>
                    )}
                    <Button asChild className="mt-3 w-full" size="sm">
                      <Link to={`/propiedad/${property.slug}`}>Ver propiedad</Link>
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
