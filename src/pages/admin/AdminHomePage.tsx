import { useEffect, useState } from 'react'
import { advisors, properties as mockProperties } from '../../data/mockData'
import { fetchAdminProperties } from '../../lib/propertyService'
import type { Property } from '../../types'

export function AdminHomePage() {
  const [properties, setProperties] = useState<Property[]>(mockProperties)

  useEffect(() => {
    fetchAdminProperties()
      .then((remote) => {
        if (remote.length) setProperties(remote)
      })
      .catch((error) => console.warn('No se pudieron cargar stats admin', error))
  }, [])

  const stats = [
    ['Total asesores', advisors.length],
    ['Asesores pendientes', 0],
    ['Propiedades activas', properties.filter((property) => property.status === 'active').length],
    ['Propiedades pendientes', properties.filter((property) => property.status === 'pending').length],
    ['Leads generados', properties.reduce((sum, property) => sum + property.leadsCount, 0)],
    ['Reportes pendientes', 1],
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#111827]">Panel admin</h1>
      <p className="mt-2 text-[#6B7280]">Moderacion mock para asesores, propiedades, leads, reportes y planes.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[#E5E7EB] bg-white p-5">
            <p className="text-sm text-[#6B7280]">{label}</p>
            <p className="mt-2 text-3xl font-bold text-[#111827]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
