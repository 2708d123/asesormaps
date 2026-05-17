import { Link } from 'react-router-dom'

export function PublicFooter() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-[#6B7280] sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-bold text-[#111827]">AsesorMaps</p>
          <p className="mt-2 max-w-sm">El portal profesional del asesor inmobiliario independiente verificado.</p>
        </div>
        <div className="flex flex-wrap gap-4 md:justify-center">
          <Link to="/seguridad">Seguridad</Link>
          <Link to="/terminos">Terminos</Link>
          <Link to="/privacidad">Privacidad</Link>
        </div>
        <p className="md:text-right">Hermosillo, Sonora. Datos mock para prototipo.</p>
      </div>
    </footer>
  )
}
