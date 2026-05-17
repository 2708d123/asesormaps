import { useEffect, useState } from 'react'
import { fetchAdminLeads, type Lead } from '../../lib/leadService'

export function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchAdminLeads()
      .then(setLeads)
      .catch((error) => setMessage(error instanceof Error ? error.message : 'No se pudieron cargar leads.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#111827]">Leads</h1>
        <p className="mt-2 text-[#6B7280]">Vista global de leads generados por la plataforma.</p>
      </div>

      {message && <p className="mb-4 rounded-md bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">{message}</p>}

      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="grid min-w-[980px] grid-cols-[150px_1fr_180px_130px_1fr] gap-3 border-b border-[#E5E7EB] p-4 text-sm font-semibold text-[#6B7280]">
          <span>Fecha</span><span>Propiedad</span><span>Asesor</span><span>Fuente</span><span>Mensaje</span>
        </div>
        {loading && <div className="p-6 text-sm text-[#6B7280]">Cargando leads...</div>}
        {!loading && leads.length === 0 && <div className="p-6 text-sm text-[#6B7280]">No hay leads registrados todavia.</div>}
        {!loading && leads.map((lead) => (
          <div key={lead.id} className="grid min-w-[980px] grid-cols-[150px_1fr_180px_130px_1fr] gap-3 border-b border-[#E5E7EB] p-4 text-sm last:border-0">
            <span className="text-[#6B7280]">{new Date(lead.createdAt).toLocaleString('es-MX')}</span>
            <span className="font-semibold text-[#111827]">{lead.propertyTitle}</span>
            <span>{lead.advisorName}</span>
            <span>{lead.source ?? 'Sin fuente'}</span>
            <span className="text-[#374151]">{lead.message ?? '-'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
