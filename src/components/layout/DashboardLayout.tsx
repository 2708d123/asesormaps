import { BarChart3, CreditCard, Home, Inbox, Plus, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Resumen', icon: Home },
  { to: '/dashboard/propiedades', label: 'Propiedades', icon: Plus },
  { to: '/dashboard/leads', label: 'Leads', icon: Inbox },
  { to: '/dashboard/perfil', label: 'Perfil', icon: UserRound },
  { to: '/dashboard/metricas', label: 'Metricas', icon: BarChart3 },
  { to: '/dashboard/suscripcion', label: 'Suscripcion', icon: CreditCard },
]

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAF7] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-[#E5E7EB] bg-white p-4">
        <Link to="/" className="block text-lg font-bold text-[#166534]">AsesorMaps</Link>
        <nav className="mt-6 grid gap-1">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-[#DCFCE7] text-[#166534]' : 'text-[#6B7280] hover:bg-[#F3F4F6]'}`
                }
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>
      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
