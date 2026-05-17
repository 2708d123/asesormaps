import { CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { fetchMySubscription, fetchPlans, selectPlanForAdvisor, type Plan, type Subscription } from '../../lib/planService'
import { formatPrice } from '../../lib/utils'

export function SubscriptionPage() {
  const { user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    setMessage('')
    try {
      const [plansData, subscriptionData] = await Promise.all([
        fetchPlans(false),
        fetchMySubscription(user.id),
      ])
      setPlans(plansData)
      setSubscription(subscriptionData)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cargar suscripcion.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [user])

  const choosePlan = async (planId: string) => {
    if (!user) return
    setMessage('')
    try {
      await selectPlanForAdvisor(user.id, planId)
      await loadData()
      setMessage('Plan seleccionado. Pago real pendiente de integrar.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo seleccionar plan.')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#111827]">Suscripcion</h1>
        <p className="mt-2 text-[#6B7280]">Selecciona un plan operativo. Los cobros reales se integraran despues.</p>
      </div>

      {message && <p className={`mb-4 rounded-md p-3 text-sm ${message.includes('seleccionado') ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>{message}</p>}

      {subscription?.plan && (
        <div className="mb-6 rounded-lg border border-[#DCFCE7] bg-[#F0FDF4] p-5">
          <p className="text-sm font-semibold text-[#166534]">Plan actual</p>
          <h2 className="mt-1 text-2xl font-bold text-[#111827]">{subscription.plan.name}</h2>
          <p className="mt-1 text-[#6B7280]">Estado: {subscription.status} - Hasta {subscription.plan.maxActiveProperties} propiedades activas.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {loading && <div className="text-sm text-[#6B7280]">Cargando planes...</div>}
        {!loading && plans.map((plan) => {
          const selected = subscription?.planId === plan.id
          return (
            <div key={plan.id} className={`rounded-lg border bg-white p-5 ${selected ? 'border-[#166534] ring-2 ring-[#DCFCE7]' : 'border-[#E5E7EB]'}`}>
              <h2 className="text-xl font-bold text-[#111827]">{plan.name}</h2>
              <p className="mt-2 text-2xl font-bold text-[#166534]">{formatPrice(plan.priceMxn)} / mes</p>
              <p className="mt-2 text-sm text-[#6B7280]">Hasta {plan.maxActiveProperties} propiedades activas.</p>
              <ul className="mt-5 space-y-2 text-sm text-[#374151]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-none text-[#166534]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="mt-5 w-full" variant={selected ? 'secondary' : 'default'} disabled={selected} onClick={() => void choosePlan(plan.id)}>
                {selected ? 'Plan actual' : 'Elegir plan'}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
