import { ClipboardCheck, CreditCard, Flag, Gauge, Inbox, Users } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Resumen', icon: Gauge },
  { to: '/admin/asesores', label: 'Asesores', icon: Users },
  { to: '/admin/propiedades', label: 'Propiedades', icon: ClipboardCheck },
  { to: '/admin/leads', label: 'Leads', icon: Inbox },
  { to: '/admin/reportes', label: 'Reportes', icon: Flag },
  { to: '/admin/planes', label: 'Planes', icon: CreditCard },
]

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAF7] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-[#E5E7EB] bg-[#111827] p-4 text-white">
        <Link to="/" className="block text-lg font-bold">AsesorMaps Admin</Link>
        <nav className="mt-6 grid gap-1">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-white text-[#111827]' : 'text-[#D1D5DB] hover:bg-white/10'}`
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
