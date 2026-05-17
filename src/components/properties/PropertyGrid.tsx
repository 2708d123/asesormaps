import type { Property } from '../../types'
import { EmptyState } from '../ui/EmptyState'
import { PropertyCard } from './PropertyCard'

export function PropertyGrid({ properties }: { properties: Property[] }) {
  if (!properties.length) {
    return <EmptyState title="No encontramos propiedades" description="Ajusta los filtros o intenta con otra colonia de Hermosillo." />
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
