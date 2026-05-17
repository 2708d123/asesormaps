import { Eye, Home, Inbox, PauseCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { properties } from '../../data/mockData'
import { formatPrice } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { fetchMyProperties } from '../../lib/propertyService'
import { fetchMyLeads } from '../../lib/leadService'
import type { Property } from '../../types'

export function DashboardHomePage() {
  const { user } = useAuth()
  const [dashboardProperties, setDashboardProperties] = useState<Property[]>(properties)
  const [leadCount, setLeadCount] = useState(0)
  const active = dashboardProperties.filter((property) => property.status === 'active').length
  const pending = dashboardProperties.filter((property) => property.status === 'pending').length
  const views = dashboardProperties.reduce((sum, property) => sum + property.viewsCount, 0)

  useEffect(() => {
    if (!user) return
    fetchMyProperties(user.id)
      .then((remote) => {
        if (remote.length) setDashboardProperties(remote)
      })
      .catch((error) => console.warn('No se pudieron cargar propiedades dashboard', error))
    fetchMyLeads(user.id)
      .then((leads) => setLeadCount(leads.length))
      .catch((error) => console.warn('No se pudieron cargar leads dashboard', error))
  }, [user])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Dashboard asesor</h1>
          <p className="text-[#6B7280]">Resumen de tu inventario, leads y actividad.</p>
        </div>
        <Button asChild><Link to="/dashboard/propiedades/nueva">Nueva propiedad</Link></Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat icon={<Home />} label="Activas" value={active} />
        <Stat icon={<PauseCircle />} label="Pendientes" value={pending} />
        <Stat icon={<Inbox />} label="Leads" value={leadCount} />
        <Stat icon={<Eye />} label="Vistas" value={views} />
      </div>
      <div className="mt-8 rounded-lg border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] p-4 font-bold">Propiedades recientes</div>
        <div className="divide-y divide-[#E5E7EB]">
          {dashboardProperties.slice(0, 5).map((property) => (
            <div key={property.id} className="grid gap-3 p-4 md:grid-cols-[64px_1fr_140px_90px_90px] md:items-center">
              <img src={property.images[0]} alt="" className="h-14 w-16 rounded-md object-cover" />
              <div>
                <p className="font-semibold text-[#111827]">{property.title}</p>
                <p className="text-sm text-[#6B7280]">{formatPrice(property.price, property.currency)}</p>
              </div>
              <Badge tone="green">{property.status}</Badge>
              <span className="text-sm text-[#6B7280]">{property.viewsCount} vistas</span>
              <span className="text-sm text-[#6B7280]">{property.leadsCount} leads</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
      <div className="text-[#166534] [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <p className="mt-3 text-sm text-[#6B7280]">{label}</p>
      <p className="text-3xl font-bold text-[#111827]">{value}</p>
    </div>
  )
}
