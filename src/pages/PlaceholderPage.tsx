export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#166534]">Ruta preparada</p>
        <h1 className="mt-2 text-3xl font-bold text-[#111827]">{title}</h1>
        <p className="mt-3 max-w-2xl text-[#6B7280]">
          Esta pantalla queda lista como base modular para la siguiente fase con Supabase, proteccion por rol y acciones reales.
        </p>
      </div>
    </section>
  )
}
