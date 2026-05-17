import { Menu, MapPinned } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'

const links = [
  { to: '/mapa', label: 'Mapa' },
  { to: '/catalogo', label: 'Catalogo' },
  { to: '/asesores', label: 'Asesores' },
  { to: '/precios', label: 'Precios' },
]

export function PublicHeader() {
  const { user, profile, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-bold text-[#111827]">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#166534] text-white">
            <MapPinned className="h-5 w-5" />
          </span>
          AsesorMaps
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-[#6B7280] md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'text-[#166534]' : 'hover:text-[#111827]')}>
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to={profile?.role === 'admin' ? '/admin' : '/dashboard'} className="hover:text-[#111827]">
                Mi panel
              </NavLink>
              <button type="button" onClick={() => void signOut()} className="font-medium hover:text-[#111827]">
                Salir
              </button>
            </>
          ) : (
            <NavLink to="/login" className="hover:text-[#111827]">
              Iniciar sesion
            </NavLink>
          )}
        </nav>

        <div className="hidden md:block">
          {user ? (
            <Button asChild>
              <Link to={profile?.role === 'admin' ? '/admin' : '/dashboard'}>Ir al panel</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/unirme">Publica tus propiedades</Link>
            </Button>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
