import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { advisors, properties } from '../data/mockData'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { PropertyCard } from '../components/properties/PropertyCard'
import { AdvisorVerificationBadge } from '../components/advisors/AdvisorVerificationBadge'

const advisor = advisors[0]

export function HomePage() {
  return (
    <>
      <section className="border-b border-[#E5E7EB] bg-[#F8FAF7]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <Badge tone="green" className="mb-4 w-fit gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Para asesores independientes en Hermosillo
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-[#111827] sm:text-5xl lg:text-6xl">
              El portal profesional para asesores inmobiliarios independientes
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6B7280]">
              Crea tu perfil, publica tus propiedades, comparte tu catalogo y recibe prospectos sin depender de una inmobiliaria grande.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/catalogo">Buscar propiedades</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/unirme">Soy asesor, quiero publicar</Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-xl">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#DCFCE7_1px,transparent_1px),linear-gradient(#DCFCE7_1px,transparent_1px)] bg-[size:42px_42px] opacity-70" />
            <div className="relative h-full rounded-lg border border-[#D1D5DB] bg-[#EFF6EF]">
              {properties.slice(0, 4).map((property, index) => (
                <div
                  key={property.id}
                  className="absolute rounded-full border-4 border-white bg-[#166534] p-2 text-white shadow-lg"
                  style={{
                    left: `${18 + index * 18}%`,
                    top: `${22 + (index % 2) * 34}%`,
                  }}
                >
                  <MapPin className="h-5 w-5" />
                </div>
              ))}
              <div className="absolute bottom-4 left-4 right-4">
                <PropertyCard property={properties[0]} />
              </div>
              <div className="absolute right-5 top-5 max-w-64 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <img src={advisor.profilePhotoUrl} alt={advisor.displayName} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold">{advisor.displayName}</p>
                    <AdvisorVerificationBadge verified={advisor.verified} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-[#6B7280]">Catalogo profesional con propiedades activas y contacto directo por WhatsApp.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold text-[#111827]">Publicar en Facebook ya no es suficiente</h2>
            <p className="mt-4 text-lg leading-8 text-[#6B7280]">
              Tus propiedades necesitan verse profesionales, estar organizadas y generar confianza. Con AsesorMaps tienes tu propio catalogo inmobiliario, perfil publico y contacto directo por WhatsApp.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {['Deja de mandar fotos sueltas por WhatsApp.', 'Comparte un catalogo profesional.', 'Muestra tus propiedades en mapa.', 'Genera confianza con verificacion.', 'Recibe leads organizados.', 'Construye tu marca personal como asesor.'].map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#166534]" />
                <p className="text-sm font-medium text-[#374151]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <HowItWorks title="Para asesores" steps={['Crea tu perfil.', 'Sube tus propiedades.', 'Admin valida tu informacion.', 'Comparte tu catalogo.', 'Recibe prospectos por WhatsApp.']} />
          <HowItWorks title="Para visitantes" steps={['Busca en mapa o catalogo.', 'Filtra por zona, precio y tipo.', 'Revisa propiedades verificadas.', 'Contacta directamente al asesor.']} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-5">
          {['Asesores verificados', 'Propiedades revisadas', 'Reportes de anuncios', 'Consejos anti-fraude', 'Informacion clara'].map((item) => (
            <div key={item} className="rounded-lg border border-[#E5E7EB] bg-white p-5">
              <ShieldCheck className="mb-3 h-6 w-6 text-[#166534]" />
              <p className="font-semibold text-[#111827]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#111827]">Planes provisionales</h2>
              <p className="mt-2 text-[#6B7280]">Listos para UI de suscripcion, sin cobros reales todavia.</p>
            </div>
            <Button asChild variant="secondary">
              <Link to="/precios">Ver precios</Link>
            </Button>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Plan name="Inicial" price="$149 MXN/mes" features={['Hasta 10 propiedades activas.', 'Perfil publico.', 'Catalogo compartible.', 'WhatsApp directo.', 'Soporte basico.']} />
            <Plan name="Profesional" price="$299 MXN/mes" highlighted features={['Hasta 40 propiedades activas.', 'Badge de asesor verificado.', 'Metricas basicas.', 'Leads organizados.', 'Propiedades destacadas limitadas.']} />
            <Plan name="Premium" price="$499 MXN/mes" features={['Hasta 100 propiedades activas.', 'Perfil destacado.', 'Mas visibilidad en catalogo.', 'Metricas avanzadas.', 'Fichas PDF.', 'Soporte prioritario.']} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-3xl font-bold text-[#111827]">Empieza a construir tu presencia profesional como asesor independiente</h2>
        <Button asChild size="lg" className="mt-6">
          <Link to="/unirme">
            Crear cuenta de asesor
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </>
  )
}

function HowItWorks({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAF7] p-6">
      <h3 className="text-xl font-bold text-[#111827]">{title}</h3>
      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-[#374151]">
            <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-[#166534] text-sm font-bold text-white">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  )
}

function Plan({ name, price, features, highlighted = false }: { name: string; price: string; features: string[]; highlighted?: boolean }) {
  return (
    <div className={`rounded-lg border p-6 ${highlighted ? 'border-[#166534] bg-[#F0FDF4]' : 'border-[#E5E7EB] bg-white'}`}>
      <h3 className="text-xl font-bold text-[#111827]">Plan {name}</h3>
      <p className="mt-2 text-2xl font-bold text-[#166534]">{price}</p>
      <ul className="mt-5 space-y-2 text-sm text-[#374151]">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2"><CheckCircle2 className="h-4 w-4 flex-none text-[#166534]" />{feature}</li>
        ))}
      </ul>
    </div>
  )
}
