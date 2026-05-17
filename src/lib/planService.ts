import { fetchMyAdvisorProfile } from './propertyService'
import { supabase } from './supabase'

export type Plan = {
  id: string
  name: string
  priceMxn: number
  maxActiveProperties: number
  features: string[]
  isActive: boolean
  createdAt: string
}

export type Subscription = {
  id: string
  advisorId: string
  planId: string
  status: string
  startedAt: string | null
  expiresAt: string | null
  plan?: Plan | null
}

type PlanRow = {
  id: string
  name: string | null
  price_mxn: number | string | null
  max_active_properties: number | null
  features: string[] | null
  is_active: boolean | null
  created_at: string
}

type SubscriptionRow = {
  id: string
  advisor_id: string
  plan_id: string
  status: string | null
  started_at: string | null
  expires_at: string | null
  plans?: PlanRow | null
}

export function mapPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    name: row.name ?? 'Plan',
    priceMxn: Number(row.price_mxn ?? 0),
    maxActiveProperties: row.max_active_properties ?? 0,
    features: row.features ?? [],
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  }
}

function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    advisorId: row.advisor_id,
    planId: row.plan_id,
    status: row.status ?? 'active',
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    plan: row.plans ? mapPlan(row.plans) : null,
  }
}

export async function fetchPlans(includeInactive = false) {
  if (!supabase) return []
  let query = supabase.from('plans').select('*').order('price_mxn', { ascending: true })
  if (!includeInactive) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return (data as PlanRow[]).map(mapPlan)
}

export async function fetchMySubscription(userId: string) {
  if (!supabase) return null
  const advisor = await fetchMyAdvisorProfile(userId)
  if (!advisor) return null
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('advisor_id', advisor.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data ? mapSubscription(data as SubscriptionRow) : null
}

export async function selectPlanForAdvisor(userId: string, planId: string) {
  if (!supabase) throw new Error('Supabase no esta configurado.')
  const advisor = await fetchMyAdvisorProfile(userId)
  if (!advisor) throw new Error('No encontramos tu perfil de asesor.')

  const current = await fetchMySubscription(userId)
  if (current) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan_id: planId,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: null,
      })
      .eq('id', current.id)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('subscriptions').insert({
    advisor_id: advisor.id,
    plan_id: planId,
    status: 'active',
    started_at: new Date().toISOString(),
  })
  if (error) throw error
}
