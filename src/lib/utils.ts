import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function buildWhatsAppUrl(phone: string, title: string, url: string) {
  const cleanPhone = phone.replace(/\D/g, '')
  const withCountry = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`
  const message = encodeURIComponent(`Hola, vi esta propiedad en AsesorMaps: ${title} ${url}`)
  return `https://wa.me/${withCountry}?text=${message}`
}
