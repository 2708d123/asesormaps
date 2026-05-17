import { ShieldCheck } from 'lucide-react'

export function SecurityPage() {
  const items = [
    'Revisamos identidad y datos basicos de los asesores antes de marcarlos como verificados.',
    'Las propiedades nuevas quedan pendientes hasta que admin valide informacion minima.',
    'Cada anuncio puede reportarse si detectas datos falsos, duplicados o comportamiento sospechoso.',
    'Nunca realices depositos sin verificar personalmente la propiedad y la identidad del asesor.',
  ]

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <ShieldCheck className="h-10 w-10 text-[#166534]" />
      <h1 className="mt-4 text-4xl font-bold text-[#111827]">Seguridad y confianza</h1>
      <p className="mt-4 text-lg leading-8 text-[#6B7280]">AsesorMaps esta disenado para dar orden, trazabilidad y moderacion al mercado independiente.</p>
      <div className="mt-8 grid gap-4">
        {items.map((item) => (
          <div key={item} className="rounded-lg border border-[#E5E7EB] bg-white p-5 text-[#374151]">{item}</div>
        ))}
      </div>
    </section>
  )
}
