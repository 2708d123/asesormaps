import { advisors as mockAdvisors } from '../data/mockData'
import type { Advisor, Property } from '../types'
import { supabase } from './supabase'

const fallbackImage =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'

type AdvisorRow = {
  id: string
  slug: string | null
  display_name: string | null
  bio: string | null
  whatsapp: string | null
  email_public: string | null
  city: string | null
  zone_specialty: string | null
  years_experience: number | null
  profile_photo_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  website_url: string | null
  verified: boolean | null
  status: string | null
}

type PropertyRow = {
  id: string
  advisor_id: string
  title: string
  slug: string | null
  description: string | null
  operation_type: 'venta' | 'renta' | null
  property_type: string | null
  price: number | string | null
  currency: 'MXN' | 'USD' | null
  city: string | null
  neighborhood: string | null
  zone: string | null
  address_approx: string | null
  lat: number | null
  lng: number | null
  bedrooms: number | null
  bathrooms: number | string | null
  half_bathrooms: number | null
  parking_spaces: number | null
  land_m2: number | string | null
  construction_m2: number | string | null
  age_years: number | null
  furnished: boolean | null
  pets_allowed: boolean | null
  amenities: string[] | null
  status: Property['status']
  is_featured: boolean | null
  views_count: number | null
  leads_count: number | null
  created_at: string
  advisor_profiles?: AdvisorRow | null
  property_images?: { id: string; image_url: string; sort_order: number | null; is_cover: boolean | null }[]
}

function numberValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return undefined
  return Number(value)
}

export function mapAdvisor(row: AdvisorRow): Advisor {
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    displayName: row.display_name ?? 'Asesor independiente',
    bio: row.bio ?? 'Asesor inmobiliario independiente en AsesorMaps.',
    whatsapp: row.whatsapp ?? '',
    emailPublic: row.email_public ?? undefined,
    city: row.city ?? 'Hermosillo',
    zones: row.zone_specialty ? row.zone_specialty.split(',').map((zone) => zone.trim()).filter(Boolean) : ['Hermosillo'],
    yearsExperience: row.years_experience ?? 0,
    profilePhotoUrl:
      row.profile_photo_url ??
      mockAdvisors.find((advisor) => advisor.id === 'adv-ana')?.profilePhotoUrl ??
      '',
    verified: Boolean(row.verified),
    status: (row.status as Advisor['status']) ?? 'pending',
    instagramUrl: row.instagram_url ?? undefined,
    facebookUrl: row.facebook_url ?? undefined,
    websiteUrl: row.website_url ?? undefined,
  }
}

export function mapProperty(row: PropertyRow): Property {
  const images = row.property_images
    ?.sort((a, b) => Number(Boolean(b.is_cover)) - Number(Boolean(a.is_cover)) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((image) => image.image_url)
  const imageRecords =
    row.property_images
      ?.sort((a, b) => Number(Boolean(b.is_cover)) - Number(Boolean(a.is_cover)) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((image) => ({
        id: image.id,
        imageUrl: image.image_url,
        sortOrder: image.sort_order ?? 0,
        isCover: Boolean(image.is_cover),
      })) ?? []

  return {
    id: row.id,
    advisorId: row.advisor_id,
    title: row.title,
    slug: row.slug ?? row.id,
    description: row.description ?? '',
    operationType: row.operation_type ?? 'venta',
    propertyType: row.property_type ?? 'Casa',
    price: Number(row.price ?? 0),
    currency: row.currency ?? 'MXN',
    city: row.city ?? 'Hermosillo',
    neighborhood: row.neighborhood ?? '',
    zone: row.zone ?? '',
    addressApprox: row.address_approx ?? '',
    lat: row.lat ?? 29.0892,
    lng: row.lng ?? -110.9613,
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: numberValue(row.bathrooms),
    halfBathrooms: row.half_bathrooms ?? undefined,
    parkingSpaces: row.parking_spaces ?? undefined,
    landM2: numberValue(row.land_m2),
    constructionM2: numberValue(row.construction_m2),
    ageYears: row.age_years ?? undefined,
    furnished: Boolean(row.furnished),
    petsAllowed: Boolean(row.pets_allowed),
    amenities: row.amenities ?? [],
    status: row.status,
    isFeatured: Boolean(row.is_featured),
    viewsCount: row.views_count ?? 0,
    leadsCount: row.leads_count ?? 0,
    images: images?.length ? images : [fallbackImage],
    imageRecords,
    createdAt: row.created_at,
  }
}

export async function fetchPublicProperties() {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images(id, image_url, sort_order, is_cover), advisor_profiles(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as PropertyRow[]).map(mapProperty)
}

export async function fetchPublicPropertyBySlug(slug: string) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images(id, image_url, sort_order, is_cover), advisor_profiles(*)')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw error
  return data ? mapProperty(data as PropertyRow) : null
}

export async function fetchAdvisorById(advisorId: string) {
  if (!supabase) return null
  const { data, error } = await supabase.from('advisor_profiles').select('*').eq('id', advisorId).maybeSingle()
  if (error) throw error
  return data ? mapAdvisor(data as AdvisorRow) : null
}

export async function fetchAdvisorBySlug(slug: string) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('advisor_profiles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw error
  return data ? mapAdvisor(data as AdvisorRow) : null
}

export async function fetchPublicPropertiesByAdvisor(advisorId: string) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images(id, image_url, sort_order, is_cover)')
    .eq('advisor_id', advisorId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as PropertyRow[]).map(mapProperty)
}

export async function fetchMyAdvisorProfile(userId: string) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('advisor_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data as AdvisorRow | null
}

export async function fetchMyProperties(userId: string) {
  if (!supabase) return []
  const advisor = await fetchMyAdvisorProfile(userId)
  if (!advisor) return []

  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images(id, image_url, sort_order, is_cover)')
    .eq('advisor_id', advisor.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as PropertyRow[]).map(mapProperty)
}

export async function fetchMyPropertyById(userId: string, propertyId: string) {
  if (!supabase) return null
  const advisor = await fetchMyAdvisorProfile(userId)
  if (!advisor) return null

  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images(id, image_url, sort_order, is_cover)')
    .eq('advisor_id', advisor.id)
    .eq('id', propertyId)
    .neq('status', 'deleted')
    .maybeSingle()

  if (error) throw error
  return data ? mapProperty(data as PropertyRow) : null
}

export async function fetchAdminProperties() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images(id, image_url, sort_order, is_cover), advisor_profiles(*)')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as PropertyRow[]).map(mapProperty)
}

export async function fetchAdminAdvisors() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('advisor_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as AdvisorRow[]).map(mapAdvisor)
}
