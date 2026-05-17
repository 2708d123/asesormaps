export type OperationType = 'venta' | 'renta'
export type PropertyStatus = 'draft' | 'pending' | 'active' | 'paused' | 'rejected' | 'deleted'
export type AdvisorStatus = 'pending' | 'active' | 'rejected' | 'suspended'

export type Advisor = {
  id: string
  slug: string
  displayName: string
  bio: string
  whatsapp: string
  emailPublic?: string
  city: string
  zones: string[]
  yearsExperience: number
  profilePhotoUrl: string
  verified: boolean
  status: AdvisorStatus
  instagramUrl?: string
  facebookUrl?: string
  websiteUrl?: string
}

export type Property = {
  id: string
  advisorId: string
  title: string
  slug: string
  description: string
  operationType: OperationType
  propertyType: string
  price: number
  currency: 'MXN' | 'USD'
  city: string
  neighborhood: string
  zone: string
  addressApprox: string
  lat: number
  lng: number
  bedrooms?: number
  bathrooms?: number
  halfBathrooms?: number
  parkingSpaces?: number
  landM2?: number
  constructionM2?: number
  ageYears?: number
  furnished?: boolean
  petsAllowed?: boolean
  amenities: string[]
  status: PropertyStatus
  isFeatured: boolean
  viewsCount: number
  leadsCount: number
  images: string[]
  imageRecords?: PropertyImage[]
  createdAt: string
}

export type PropertyImage = {
  id: string
  imageUrl: string
  sortOrder: number
  isCover: boolean
}

export type PropertyFiltersState = {
  query: string
  operationType: 'todas' | OperationType
  propertyType: string
  minPrice: string
  maxPrice: string
  city: string
  neighborhood: string
  zone: string
  minBedrooms: string
  minBathrooms: string
  minLandM2: string
  minConstructionM2: string
  verifiedOnly: boolean
  featuredOnly: boolean
}
