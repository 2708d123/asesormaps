import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Property } from '../types'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value: string) {
  return uuidPattern.test(value)
}

export async function isRemoteFavorite(propertyId: string, user: User | null) {
  if (!supabase || !user || !isUuid(propertyId)) return false

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .maybeSingle()

  if (error) {
    console.warn('No se pudo leer favorito remoto', error.message)
    return false
  }

  return Boolean(data)
}

export async function toggleRemoteFavorite(propertyId: string, user: User | null) {
  if (!supabase || !user || !isUuid(propertyId)) return null

  const active = await isRemoteFavorite(propertyId, user)
  if (active) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
    if (error) throw error
    return false
  }

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, property_id: propertyId })
  if (error) throw error
  return true
}

export async function createWhatsAppLead(property: Property, visitorUserId?: string | null) {
  if (!supabase || !isUuid(property.id) || !isUuid(property.advisorId)) {
    console.info('mock lead whatsapp_click', property.id)
    return
  }

  const { error } = await supabase.from('leads').insert({
    property_id: property.id,
    advisor_id: property.advisorId,
    buyer_user_id: visitorUserId ?? null,
    source: 'whatsapp_click',
    message: `Hola, vi esta propiedad en AsesorMaps: ${property.title}`,
  })

  if (error) {
    console.warn('No se pudo registrar lead', error.message)
    return
  }

  const { data } = await supabase
    .from('properties')
    .select('leads_count')
    .eq('id', property.id)
    .maybeSingle()

  await supabase
    .from('properties')
    .update({ leads_count: Number(data?.leads_count ?? 0) + 1 })
    .eq('id', property.id)
}
