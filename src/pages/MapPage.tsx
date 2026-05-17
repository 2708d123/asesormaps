import { LocateFixed, Rows3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PropertyFilters } from '../components/properties/PropertyFilters'
import { PropertyMap } from '../components/properties/PropertyMap'
import { PropertyCard } from '../components/properties/PropertyCard'
import { Button } from '../components/ui/button'
import { defaultFilters, filterProperties, properties } from '../data/mockData'
import { fetchPublicProperties } from '../lib/propertyService'
import type { Property } from '../types'

export function MapPage() {
  const [filters, setFilters] = useState(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [remoteProperties, setRemoteProperties] = useState<Property[]>([])
  const baseProperties = remoteProperties.length ? remoteProperties : properties
  const filtered = useMemo(() => filterProperties(baseProperties, filters), [baseProperties, filters])

  useEffect(() => {
    let cancelled = false
    fetchPublicProperties()
      .then((remote) => {
        if (!cancelled) setRemoteProperties(remote)
      })
      .catch((error) => console.warn('No se pudieron cargar propiedades publicas', error))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="h-[calc(100vh-4rem)] overflow-hidden bg-white">
      <div className="grid h-full lg:grid-cols-[380px_1fr]">
        <aside className="hidden overflow-y-auto border-r border-[#E5E7EB] bg-[#F8FAF7] p-4 lg:block">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">Mapa inmobiliario</h1>
              <p className="text-sm text-[#6B7280]">{filtered.length} propiedades activas</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/catalogo"><Rows3 className="h-4 w-4" /> Catalogo</Link>
            </Button>
          </div>
          <PropertyFilters filters={filters} onChange={setFilters} />
          <div className="mt-4 grid gap-4">
            {filtered.slice(0, 4).map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        </aside>

        <div className="relative h-full">
          <PropertyMap properties={filtered} className="h-full" />

          <div className="absolute left-4 top-4 z-[500] flex gap-2 lg:hidden">
            <Button variant="outline" onClick={() => setShowFilters((value) => !value)}>Filtros</Button>
            <Button asChild variant="outline">
              <Link to="/catalogo"><Rows3 className="h-4 w-4" /> Catalogo</Link>
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            className="absolute right-4 top-4 z-[500] bg-white"
            onClick={() => window.navigator.geolocation?.getCurrentPosition(() => undefined)}
          >
            <LocateFixed className="h-4 w-4" />
            Usar mi ubicacion
          </Button>

          <div className="absolute inset-x-0 bottom-0 z-[500] max-h-[55vh] overflow-y-auto rounded-t-lg border-t border-[#E5E7EB] bg-white p-4 shadow-2xl lg:hidden">
            {showFilters ? (
              <PropertyFilters filters={filters} onChange={setFilters} compact />
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#111827]">{filtered.length} propiedades</p>
                    <p className="text-sm text-[#6B7280]">Toca un pin o revisa estas opciones.</p>
                  </div>
                </div>
                <div className="flex snap-x gap-3 overflow-x-auto pb-2">
                  {filtered.slice(0, 6).map((property) => (
                    <div key={property.id} className="w-72 flex-none snap-start">
                      <PropertyCard property={property} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
