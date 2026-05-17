import { useEffect, useMemo, useState } from 'react'
import { Select } from '../../components/ui/select'
import { useAuth } from '../../contexts/AuthContext'
import { fetchMyLeads, type Lead } from '../../lib/leadService'

export function DashboardLeadsPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [propertyFilter, setPropertyFilter] = useState('Todas')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetchMyLeads(user.id)
      .then(setLeads)
      .catch((error) => setMessage(error instanceof Error ? error.message : 'No se pudieron cargar leads.'))
      .finally(() => setLoading(false))
  }, [user])

  const properties = useMemo(
    () => ['Todas', ...Array.from(new Set(leads.map((lead) => lead.propertyTitle)))],
    [leads],
  )
  const filtered = propertyFilter === 'Todas' ? leads : leads.filter((lead) => lead.propertyTitle === propertyFilter)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Leads recibidos</h1>
          <p className="mt-2 text-[#6B7280]">Prospectos generados por clicks de WhatsApp y formularios futuros.</p>
        </div>
        <Select value={propertyFilter} onChange={(event) => setPropertyFilter(event.target.value)} className="max-w-xs">
          {properties.map((property) => <option key={property}>{property}</option>)}
        </Select>
      </div>

      {message && <p className="mb-4 rounded-md bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">{message}</p>}

      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="grid min-w-[860px] grid-cols-[150px_1fr_130px_1fr_170px] gap-3 border-b border-[#E5E7EB] p-4 text-sm font-semibold text-[#6B7280]">
          <span>Fecha</span><span>Propiedad</span><span>Fuente</span><span>Mensaje</span><span>Contacto</span>
        </div>
        {loading && <div className="p-6 text-sm text-[#6B7280]">Cargando leads...</div>}
        {!loading && filtered.length === 0 && (
          <div className="p-6">
            <p className="font-semibold text-[#111827]">Todavia no tienes leads.</p>
            <p className="mt-1 text-sm text-[#6B7280]">Cuando alguien toque WhatsApp en una propiedad real, aparecera aqui.</p>
          </div>
        )}
        {!loading && filtered.map((lead) => (
          <div key={lead.id} className="grid min-w-[860px] grid-cols-[150px_1fr_130px_1fr_170px] gap-3 border-b border-[#E5E7EB] p-4 text-sm last:border-0">
            <span className="text-[#6B7280]">{new Date(lead.createdAt).toLocaleString('es-MX')}</span>
            <span className="font-semibold text-[#111827]">{lead.propertyTitle}</span>
            <span>{lead.source ?? 'Sin fuente'}</span>
            <span className="text-[#374151]">{lead.message ?? '-'}</span>
            <span className="text-[#6B7280]">{lead.phone ?? lead.email ?? lead.name ?? 'Click WhatsApp'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
