import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { fetchAdminReports, type PropertyReport } from '../../lib/reportService'
import { supabase } from '../../lib/supabase'

export function AdminReportsPage() {
  const [reports, setReports] = useState<PropertyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadReports = async () => {
    setLoading(true)
    setMessage('')
    try {
      setReports(await fetchAdminReports())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron cargar reportes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReports()
  }, [])

  const updateStatus = async (reportId: string, status: string) => {
    if (!supabase) return
    const { error } = await supabase.from('property_reports').update({ status }).eq('id', reportId)
    if (error) {
      setMessage(error.message)
      return
    }
    await loadReports()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#111827]">Reportes</h1>
        <p className="mt-2 text-[#6B7280]">Revisa anuncios reportados por visitantes y asesores.</p>
      </div>

      {message && <p className="mb-4 rounded-md bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">{message}</p>}

      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="grid min-w-[920px] grid-cols-[150px_1fr_160px_1fr_120px_180px] gap-3 border-b border-[#E5E7EB] p-4 text-sm font-semibold text-[#6B7280]">
          <span>Fecha</span><span>Propiedad</span><span>Motivo</span><span>Detalles</span><span>Estado</span><span>Acciones</span>
        </div>

        {loading && <div className="p-6 text-sm text-[#6B7280]">Cargando reportes...</div>}
        {!loading && reports.length === 0 && <div className="p-6 text-sm text-[#6B7280]">No hay reportes pendientes.</div>}
        {!loading && reports.map((report) => (
          <div key={report.id} className="grid min-w-[920px] grid-cols-[150px_1fr_160px_1fr_120px_180px] gap-3 border-b border-[#E5E7EB] p-4 text-sm last:border-0">
            <span className="text-[#6B7280]">{new Date(report.createdAt).toLocaleString('es-MX')}</span>
            <span className="font-semibold text-[#111827]">{report.propertyTitle}</span>
            <span>{report.reason ?? '-'}</span>
            <span className="text-[#374151]">{report.details ?? '-'}</span>
            <Badge tone={report.status === 'pending' ? 'gold' : 'green'}>{report.status ?? 'pending'}</Badge>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => void updateStatus(report.id, 'reviewed')}>Revisado</Button>
              <Button size="sm" onClick={() => void updateStatus(report.id, 'resolved')}>Resuelto</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
