import { SlidersHorizontal, Map } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PropertyFilters, PropertySearchBar } from '../components/properties/PropertyFilters'
import { PropertyGrid } from '../components/properties/PropertyGrid'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import { defaultFilters, filterProperties, properties, sortOptions } from '../data/mockData'
import { getFavoriteIds } from '../lib/favorites'
import { fetchPublicProperties } from '../lib/propertyService'
import type { Property } from '../types'

export function CatalogPage({ onlyFavorites = false }: { onlyFavorites?: boolean }) {
  const [filters, setFilters] = useState(defaultFilters)
  const [sortBy, setSortBy] = useState('recent')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [remoteProperties, setRemoteProperties] = useState<Property[]>([])
  const [sourceLabel, setSourceLabel] = useState('datos mock')

  useEffect(() => {
    setFavoriteIds(getFavoriteIds())
    const listener = () => setFavoriteIds(getFavoriteIds())
    window.addEventListener('favorites:changed', listener)
    return () => window.removeEventListener('favorites:changed', listener)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchPublicProperties()
      .then((remote) => {
        if (cancelled) return
        setRemoteProperties(remote)
        if (remote.length) setSourceLabel('Supabase')
      })
      .catch((error) => console.warn('No se pudieron cargar propiedades publicas', error))
    return () => {
      cancelled = true
    }
  }, [])

  const baseProperties = remoteProperties.length ? remoteProperties : properties
  const source = onlyFavorites ? baseProperties.filter((property) => favoriteIds.includes(property.id)) : baseProperties
  const filtered = useMemo(() => filterProperties(source, filters, sortBy), [filters, sortBy, source])

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#166534]">{onlyFavorites ? 'Tus guardados' : 'Catalogo inmobiliario'}</p>
          <h1 className="mt-1 text-3xl font-bold text-[#111827]">{onlyFavorites ? 'Propiedades favoritas' : 'Propiedades en Hermosillo'}</h1>
          <p className="mt-2 text-[#6B7280]">{filtered.length} resultados desde {sourceLabel} y propiedades aprobadas.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <Link to="/mapa"><Map className="h-4 w-4" /> Ver mapa</Link>
          </Button>
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Ordenar">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mb-4 grid gap-3 lg:hidden">
        <PropertySearchBar filters={filters} onChange={setFilters} />
        <Button type="button" variant="outline" onClick={() => setShowMobileFilters((value) => !value)}>
          <SlidersHorizontal className="h-4 w-4" />
          {showMobileFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
        {showMobileFilters && <PropertyFilters filters={filters} onChange={setFilters} compact />}
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <PropertyFilters filters={filters} onChange={setFilters} />
          </div>
        </aside>
        <PropertyGrid properties={filtered} />
      </div>
    </section>
  )
}
