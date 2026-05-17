import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { AppRole } from '../../contexts/AuthContext'
import { useAuth } from '../../contexts/AuthContext'

export function ProtectedRoute({ roles }: { roles?: AppRole[] }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center bg-[#F8FAF7] text-sm font-medium text-[#6B7280]">
        Cargando sesion...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles?.length && profile && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
