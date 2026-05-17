import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import { AdminHomePage } from './pages/admin/AdminHomePage'
import { AdminAdvisorsPage } from './pages/admin/AdminAdvisorsPage'
import { AdminLeadsPage } from './pages/admin/AdminLeadsPage'
import { AdminPlansPage } from './pages/admin/AdminPlansPage'
import { AdminPropertiesPage } from './pages/admin/AdminPropertiesPage'
import { AdminReportsPage } from './pages/admin/AdminReportsPage'
import { CatalogPage } from './pages/CatalogPage'
import { DashboardHomePage } from './pages/dashboard/DashboardHomePage'
import { DashboardLeadsPage } from './pages/dashboard/DashboardLeadsPage'
import { DashboardPropertiesPage } from './pages/dashboard/DashboardPropertiesPage'
import { EditPropertyPage } from './pages/dashboard/EditPropertyPage'
import { NewPropertyPage } from './pages/dashboard/NewPropertyPage'
import { ProfilePage } from './pages/dashboard/ProfilePage'
import { SubscriptionPage } from './pages/dashboard/SubscriptionPage'
import { HomePage } from './pages/HomePage'
import { MapPage } from './pages/MapPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { AdvisorPage } from './pages/AdvisorPage'
import { PropertyDetailPage } from './pages/PropertyDetailPage'
import { JoinPage } from './pages/JoinPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { SecurityPage } from './pages/SecurityPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { UpdatePasswordPage } from './pages/UpdatePasswordPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/propiedad/:slug" element={<PropertyDetailPage />} />
        <Route path="/asesor/:slug" element={<AdvisorPage />} />
        <Route path="/unirme" element={<JoinPage />} />
        <Route path="/seguridad" element={<SecurityPage />} />
        <Route path="/asesores" element={<PlaceholderPage title="Asesores independientes" />} />
        <Route path="/precios" element={<PlaceholderPage title="Planes para asesores" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
        <Route path="/actualizar-password" element={<UpdatePasswordPage />} />
        <Route path="/favoritos" element={<CatalogPage onlyFavorites />} />
        <Route path="/terminos" element={<PlaceholderPage title="Terminos de uso" />} />
        <Route path="/privacidad" element={<PlaceholderPage title="Privacidad" />} />
      </Route>

      <Route element={<ProtectedRoute roles={['advisor', 'admin']} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="propiedades" element={<DashboardPropertiesPage />} />
          <Route path="propiedades/nueva" element={<NewPropertyPage />} />
          <Route path="propiedades/:id/editar" element={<EditPropertyPage />} />
          <Route path="leads" element={<DashboardLeadsPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="metricas" element={<PlaceholderPage title="Metricas" />} />
          <Route path="suscripcion" element={<SubscriptionPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="asesores" element={<AdminAdvisorsPage />} />
          <Route path="propiedades" element={<AdminPropertiesPage />} />
          <Route path="leads" element={<AdminLeadsPage />} />
          <Route path="reportes" element={<AdminReportsPage />} />
          <Route path="planes" element={<AdminPlansPage />} />
          <Route path="configuracion" element={<PlaceholderPage title="Configuracion" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
