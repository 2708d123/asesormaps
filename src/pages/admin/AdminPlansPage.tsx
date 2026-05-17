import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { fetchPlans, type Plan } from '../../lib/planService'
import { supabase } from '../../lib/supabase'
import { formatPrice } from '../../lib/utils'

export function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    priceMxn: '',
    maxActiveProperties: '',
    features: '',
  })

  const loadPlans = async () => {
    setLoading(true)
    setMessage('')
    try {
      setPlans(await fetchPlans(true))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron cargar planes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPlans()
  }, [])

  const createPlan = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setMessage('')
    const { error } = await supabase.from('plans').insert({
      name: form.name,
      price_mxn: Number(form.priceMxn),
      max_active_properties: Number(form.maxActiveProperties),
      features: form.features.split(',').map((item) => item.trim()).filter(Boolean),
      is_active: true,
    })
    if (error) {
      setMessage(error.message)
      return
    }
    setForm({ name: '', priceMxn: '', maxActiveProperties: '', features: '' })
    await loadPlans()
  }

  const togglePlan = async (plan: Plan) => {
    if (!supabase) return
    const { error } = await supabase.from('plans').update({ is_active: !plan.isActive }).eq('id', plan.id)
    if (error) {
      setMessage(error.message)
      return
    }
    await loadPlans()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#111827]">Planes</h1>
        <p className="mt-2 text-[#6B7280]">Gestiona planes visibles para asesores. Sin cobros reales todavia.</p>
      </div>

      {message && <p className="mb-4 rounded-md bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">{message}</p>}

      <form onSubmit={createPlan} className="mb-6 grid gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5 md:grid-cols-4">
        <Input required placeholder="Nombre" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        <Input required type="number" placeholder="Precio MXN" value={form.priceMxn} onChange={(event) => setForm((current) => ({ ...current, priceMxn: event.target.value }))} />
        <Input required type="number" placeholder="Limite propiedades" value={form.maxActiveProperties} onChange={(event) => setForm((current) => ({ ...current, maxActiveProperties: event.target.value }))} />
        <Input required placeholder="Features separadas por coma" value={form.features} onChange={(event) => setForm((current) => ({ ...current, features: event.target.value }))} />
        <div className="md:col-span-4">
          <Button type="submit">Crear plan</Button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        {loading && <div className="text-sm text-[#6B7280]">Cargando planes...</div>}
        {!loading && plans.map((plan) => (
          <div key={plan.id} className="rounded-lg border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#111827]">{plan.name}</h2>
                <p className="mt-1 text-2xl font-bold text-[#166534]">{formatPrice(plan.priceMxn)}</p>
              </div>
              <Badge tone={plan.isActive ? 'green' : 'gray'}>{plan.isActive ? 'Activo' : 'Inactivo'}</Badge>
            </div>
            <p className="mt-3 text-sm text-[#6B7280]">Hasta {plan.maxActiveProperties} propiedades activas.</p>
            <ul className="mt-4 space-y-2 text-sm text-[#374151]">
              {plan.features.map((feature) => <li key={feature}>- {feature}</li>)}
            </ul>
            <Button className="mt-5 w-full" variant="outline" onClick={() => void togglePlan(plan)}>
              {plan.isActive ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
