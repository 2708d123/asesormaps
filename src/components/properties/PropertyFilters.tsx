import { Filter, Search } from 'lucide-react'
import { advisors, properties, propertyTypes } from '../../data/mockData'
import type { OperationType, PropertyFiltersState } from '../../types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select } from '../ui/select'

type Props = {
  filters: PropertyFiltersState
  onChange: (filters: PropertyFiltersState) => void
  compact?: boolean
}

const cities = ['Todas', ...Array.from(new Set(properties.map((property) => property.city)))]
const neighborhoods = ['Todas', ...Array.from(new Set(properties.map((property) => property.neighborhood)))]
const zones = ['Todas', ...Array.from(new Set(properties.map((property) => property.zone)))]

function updateField<T extends keyof PropertyFiltersState>(
  filters: PropertyFiltersState,
  key: T,
  value: PropertyFiltersState[T],
) {
  return { ...filters, [key]: value }
}

export function PropertySearchBar({ filters, onChange }: Props) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
      <Input
        value={filters.query}
        onChange={(event) => onChange(updateField(filters, 'query', event.target.value))}
        placeholder="Buscar por colonia, zona, tipo o asesor"
        className="pl-9"
      />
    </div>
  )
}

export function PropertyFilters({ filters, onChange, compact = false }: Props) {
  return (
    <div className="space-y-4 rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-[#166534]" />
        <h2 className="font-semibold text-[#111827]">Filtros</h2>
      </div>

      <PropertySearchBar filters={filters} onChange={onChange} />

      <div className={compact ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-3'}>
        <Select
          value={filters.operationType}
          onChange={(event) => onChange(updateField(filters, 'operationType', event.target.value as 'todas' | OperationType))}
          aria-label="Operacion"
        >
          <option value="todas">Venta y renta</option>
          <option value="venta">Venta</option>
          <option value="renta">Renta</option>
        </Select>

        <Select
          value={filters.propertyType}
          onChange={(event) => onChange(updateField(filters, 'propertyType', event.target.value))}
          aria-label="Tipo de propiedad"
        >
          {propertyTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input type="number" placeholder="Precio min." value={filters.minPrice} onChange={(event) => onChange(updateField(filters, 'minPrice', event.target.value))} />
          <Input type="number" placeholder="Precio max." value={filters.maxPrice} onChange={(event) => onChange(updateField(filters, 'maxPrice', event.target.value))} />
        </div>

        <Select value={filters.city} onChange={(event) => onChange(updateField(filters, 'city', event.target.value))} aria-label="Ciudad">
          {cities.map((city) => <option key={city} value={city}>{city}</option>)}
        </Select>

        <Select value={filters.neighborhood} onChange={(event) => onChange(updateField(filters, 'neighborhood', event.target.value))} aria-label="Colonia">
          {neighborhoods.map((neighborhood) => <option key={neighborhood} value={neighborhood}>{neighborhood}</option>)}
        </Select>

        <Select value={filters.zone} onChange={(event) => onChange(updateField(filters, 'zone', event.target.value))} aria-label="Zona">
          {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input type="number" placeholder="Recamaras min." value={filters.minBedrooms} onChange={(event) => onChange(updateField(filters, 'minBedrooms', event.target.value))} />
          <Input type="number" placeholder="Banos min." value={filters.minBathrooms} onChange={(event) => onChange(updateField(filters, 'minBathrooms', event.target.value))} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input type="number" placeholder="Terreno min." value={filters.minLandM2} onChange={(event) => onChange(updateField(filters, 'minLandM2', event.target.value))} />
          <Input type="number" placeholder="Const. min." value={filters.minConstructionM2} onChange={(event) => onChange(updateField(filters, 'minConstructionM2', event.target.value))} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[#374151]">
        <input type="checkbox" checked={filters.verifiedOnly} onChange={(event) => onChange(updateField(filters, 'verifiedOnly', event.target.checked))} />
        Solo asesores verificados
      </label>
      <label className="flex items-center gap-2 text-sm text-[#374151]">
        <input type="checkbox" checked={filters.featuredOnly} onChange={(event) => onChange(updateField(filters, 'featuredOnly', event.target.checked))} />
        Solo propiedades destacadas
      </label>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() =>
          onChange({
            query: '',
            operationType: 'todas',
            propertyType: 'Todos',
            minPrice: '',
            maxPrice: '',
            city: 'Todas',
            neighborhood: 'Todas',
            zone: 'Todas',
            minBedrooms: '',
            minBathrooms: '',
            minLandM2: '',
            minConstructionM2: '',
            verifiedOnly: false,
            featuredOnly: false,
          })
        }
      >
        Limpiar filtros
      </Button>

      <p className="text-xs text-[#6B7280]">{advisors.filter((advisor) => advisor.verified).length} asesores verificados activos en los mocks.</p>
    </div>
  )
}
