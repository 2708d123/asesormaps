import { fetchMyAdvisorProfile } from './propertyService'
import { supabase } from './supabase'

export type Lead = {
  id: string
  propertyId: string | null
  advisorId: string | null
  propertyTitle: string
  advisorName: string
  name: string | null
  phone: string | null
  email: string | null
  message: string | null
  source: string | null
  createdAt: string
}

type LeadRow = {
  id: string
  property_id: string | null
  advisor_id: string | null
  name: string | null
  phone: string | null
  email: string | null
  message: string | null
  source: string | null
  created_at: string
  properties?: { title: string | null } | null
  advisor_profiles?: { display_name: string | null } | null
}

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    propertyId: row.property_id,
    advisorId: row.advisor_id,
    propertyTitle: row.properties?.title ?? 'Propiedad sin titulo',
    advisorName: row.advisor_profiles?.display_name ?? 'Asesor independiente',
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    source: row.source,
    createdAt: row.created_at,
  }
}

export async function fetchMyLeads(userId: string) {
  if (!supabase) return []
  const advisor = await fetchMyAdvisorProfile(userId)
  if (!advisor) return []

  const { data, error } = await supabase
    .from('leads')
    .select('*, properties(title), advisor_profiles(display_name)')
    .eq('advisor_id', advisor.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as LeadRow[]).map(mapLead)
}

export async function fetchAdminLeads() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('leads')
    .select('*, properties(title), advisor_profiles(display_name)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as LeadRow[]).map(mapLead)
}
