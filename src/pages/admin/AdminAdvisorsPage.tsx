import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdvisorVerificationBadge } from '../../components/advisors/AdvisorVerificationBadge'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { fetchAdminAdvisors } from '../../lib/propertyService'
import { supabase } from '../../lib/supabase'
import type { Advisor, AdvisorStatus } from '../../types'

export function AdminAdvisorsPage() {
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadAdvisors = async () => {
    setLoading(true)
    setMessage('')
    try {
      setAdvisors(await fetchAdminAdvisors())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron cargar asesores.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAdvisors()
  }, [])

  const updateAdvisor = async (
    advisorId: string,
    values: { status?: AdvisorStatus; verified?: boolean; verification_status?: string; rejection_reason?: string | null },
  ) => {
    if (!supabase) return
    const { error } = await supabase
      .from('advisor_profiles')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', advisorId)

    if (error) {
      setMessage(error.message)
      return
    }
    await loadAdvisors()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#111827]">Revision de asesores</h1>
        <p className="mt-2 text-[#6B7280]">Aprueba, suspende y verifica perfiles profesionales independientes.</p>
      </div>

      {message && <p className="mb-4 rounded-md bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">{message}</p>}

      <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="grid min-w-[1060px] grid-cols-[72px_1fr_160px_120px_150px_320px] gap-3 border-b border-[#E5E7EB] p-4 text-sm font-semibold text-[#6B7280]">
          <span>Foto</span><span>Asesor</span><span>Ciudad</span><span>Estado</span><span>Verificacion</span><span>Acciones</span>
        </div>

        {loading && <div className="p-6 text-sm text-[#6B7280]">Cargando asesores...</div>}
        {!loading && advisors.length === 0 && <div className="p-6 text-sm text-[#6B7280]">No hay asesores registrados.</div>}

        {!loading && advisors.map((advisor) => (
          <div key={advisor.id} className="grid min-w-[1060px] grid-cols-[72px_1fr_160px_120px_150px_320px] items-center gap-3 border-b border-[#E5E7EB] p-4 last:border-0">
            <img src={advisor.profilePhotoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-[#111827]">{advisor.displayName}</p>
              <p className="text-sm text-[#6B7280]">/{advisor.slug} - {advisor.whatsapp || 'sin WhatsApp'}</p>
            </div>
            <span>{advisor.city}</span>
            <Badge tone={advisor.status === 'active' ? 'green' : advisor.status === 'suspended' ? 'red' : 'gold'}>{advisor.status}</Badge>
            <AdvisorVerificationBadge verified={advisor.verified} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => void updateAdvisor(advisor.id, { status: 'active', verified: true, verification_status: 'approved', rejection_reason: null })}>
                Aprobar
              </Button>
              <Button size="sm" variant="outline" onClick={() => void updateAdvisor(advisor.id, { verified: true, verification_status: 'approved' })}>
                Verificar
              </Button>
              <Button size="sm" variant="outline" onClick={() => void updateAdvisor(advisor.id, { status: 'rejected', verified: false, verification_status: 'rejected', rejection_reason: 'Perfil no aprobado por admin' })}>
                Rechazar
              </Button>
              <Button size="sm" variant="outline" onClick={() => void updateAdvisor(advisor.id, { status: 'suspended', verified: false })}>
                Suspender
              </Button>
              {advisor.status === 'active' && (
                <Button asChild size="sm" variant="outline">
                  <Link to={`/asesor/${advisor.slug}`}>Ver</Link>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
