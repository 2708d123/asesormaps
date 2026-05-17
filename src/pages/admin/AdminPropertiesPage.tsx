import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import type { Property } from '../../types'
import { fetchAdminProperties } from '../../lib/propertyService'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'

export function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadProperties = async () => {
    setLoading(true)
    setMessage('')
    try {
      setProperties(await fetchAdminProperties())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron cargar propiedades.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProperties()
  }, [])

  const setStatus = async (propertyId: string, status: Property['status'], rejectionReason?: string) => {
    if (!supabase) return
    const { error } = await supabase
      .from('properties')
      .update({ status, rejection_reason: rejectionReason ?? null })
      .eq('id', propertyId)

    if (error) {
      setMessage(error.message)
      return
    }

    await loadProperties()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#111827]">Revision de propiedades</h1>
        <p className="mt-2 text-[#6B7280]">Aprueba, rechaza, pausa o elimina propiedades reales de Supabase.</p>
      </div>

      {message && <p className="mb-4 rounded-md bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">{message}</p>}

      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="grid min-w-[980px] grid-cols-[72px_1fr_120px_110px_120px_260px] gap-3 border-b border-[#E5E7EB] p-4 text-sm font-semibold text-[#6B7280]">
          <span>Foto</span><span>Titulo</span><span>Tipo</span><span>Operacion</span><span>Estado</span><span>Acciones</span>
        </div>
        {loading && <div className="p-6 text-sm text-[#6B7280]">Cargando propiedades...</div>}
        {!loading && properties.length === 0 && <div className="p-6 text-sm text-[#6B7280]">No hay propiedades reales todavia.</div>}
        {!loading && properties.map((property) => (
          <div key={property.id} className="grid min-w-[980px] grid-cols-[72px_1fr_120px_110px_120px_260px] items-center gap-3 border-b border-[#E5E7EB] p-4 last:border-0">
            <img src={property.images[0]} alt="" className="h-12 w-14 rounded-md object-cover" />
            <div>
              <p className="font-semibold text-[#111827]">{property.title}</p>
              <p className="text-sm text-[#6B7280]">{formatPrice(property.price, property.currency)} - {property.neighborhood}</p>
            </div>
            <span>{property.propertyType}</span>
            <span>{property.operationType}</span>
            <Badge tone={property.status === 'active' ? 'green' : property.status === 'rejected' ? 'red' : 'gold'}>{property.status}</Badge>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => void setStatus(property.id, 'active')}>Aprobar</Button>
              <Button size="sm" variant="outline" onClick={() => void setStatus(property.id, 'rejected', 'Informacion pendiente de validar')}>Rechazar</Button>
              <Button size="sm" variant="outline" onClick={() => void setStatus(property.id, 'paused')}>Pausar</Button>
              <Button size="sm" variant="outline" onClick={() => void setStatus(property.id, 'deleted')}>Eliminar</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
