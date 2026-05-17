import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { formatPrice } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState } from 'react'
import type { Property } from '../../types'
import { fetchMyProperties } from '../../lib/propertyService'
import { supabase } from '../../lib/supabase'

export function DashboardPropertiesPage() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadProperties = async () => {
    if (!user) return
    setLoading(true)
    try {
      setProperties(await fetchMyProperties(user.id))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron cargar propiedades.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProperties()
  }, [user])

  const updateStatus = async (propertyId: string, status: 'paused' | 'pending' | 'deleted') => {
    if (!supabase) return
    const { error } = await supabase.from('properties').update({ status }).eq('id', propertyId)
    if (error) {
      setMessage(error.message)
      return
    }
    await loadProperties()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Mis propiedades</h1>
          <p className="text-[#6B7280]">Buscar, pausar, reactivar y editar inventario.</p>
        </div>
        <Button asChild><Link to="/dashboard/propiedades/nueva">Crear nueva</Link></Button>
      </div>
      {message && <p className="mb-4 rounded-md bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">{message}</p>}
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="grid min-w-[760px] grid-cols-[72px_1fr_120px_120px_120px_160px] gap-3 border-b border-[#E5E7EB] p-4 text-sm font-semibold text-[#6B7280]">
          <span>Foto</span><span>Titulo</span><span>Tipo</span><span>Operacion</span><span>Estado</span><span>Acciones</span>
        </div>
        {loading && <div className="p-6 text-sm text-[#6B7280]">Cargando propiedades...</div>}
        {!loading && properties.length === 0 && (
          <div className="p-6">
            <p className="font-semibold text-[#111827]">Todavia no tienes propiedades.</p>
            <p className="mt-1 text-sm text-[#6B7280]">Crea tu primera propiedad para enviarla a revision admin.</p>
          </div>
        )}
        {!loading && properties.map((property) => (
          <div key={property.id} className="grid min-w-[760px] grid-cols-[72px_1fr_120px_120px_120px_160px] items-center gap-3 border-b border-[#E5E7EB] p-4 last:border-0">
            <img src={property.images[0]} alt="" className="h-12 w-14 rounded-md object-cover" />
            <div>
              <p className="font-semibold text-[#111827]">{property.title}</p>
              <p className="text-sm text-[#6B7280]">{formatPrice(property.price, property.currency)}</p>
            </div>
            <span>{property.propertyType}</span>
            <span>{property.operationType}</span>
            <Badge tone={property.status === 'active' ? 'green' : property.status === 'rejected' ? 'red' : 'gold'}>{property.status}</Badge>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline"><Link to={`/dashboard/propiedades/${property.id}/editar`}>Editar</Link></Button>
              {property.status === 'active' ? (
                <Button size="sm" variant="outline" onClick={() => void updateStatus(property.id, 'paused')}>Pausar</Button>
              ) : property.status === 'paused' ? (
                <Button size="sm" variant="outline" onClick={() => void updateStatus(property.id, 'pending')}>Reactivar</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => void updateStatus(property.id, 'deleted')}>Eliminar</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
