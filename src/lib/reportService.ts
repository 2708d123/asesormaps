import { supabase } from './supabase'

export type PropertyReport = {
  id: string
  propertyId: string | null
  propertyTitle: string
  reason: string | null
  details: string | null
  status: string | null
  createdAt: string
}

type ReportRow = {
  id: string
  property_id: string | null
  reason: string | null
  details: string | null
  status: string | null
  created_at: string
  properties?: { title: string | null } | null
}

function mapReport(row: ReportRow): PropertyReport {
  return {
    id: row.id,
    propertyId: row.property_id,
    propertyTitle: row.properties?.title ?? 'Propiedad sin titulo',
    reason: row.reason,
    details: row.details,
    status: row.status,
    createdAt: row.created_at,
  }
}

export async function createPropertyReport(input: {
  propertyId: string
  userId?: string | null
  reason: string
  details?: string
}) {
  if (!supabase) throw new Error('Supabase no esta configurado.')
  const { error } = await supabase.from('property_reports').insert({
    property_id: input.propertyId,
    user_id: input.userId ?? null,
    reason: input.reason,
    details: input.details ?? null,
    status: 'pending',
  })
  if (error) throw error
}

export async function fetchAdminReports() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('property_reports')
    .select('*, properties(title)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as ReportRow[]).map(mapReport)
}
