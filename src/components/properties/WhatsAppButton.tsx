import { MessageCircle } from 'lucide-react'
import type { Property } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { createWhatsAppLead } from '../../lib/supabaseActions'
import { buildWhatsAppUrl } from '../../lib/utils'
import { Button } from '../ui/button'

export function WhatsAppButton({ property, phone, compact = false }: { property: Property; phone: string; compact?: boolean }) {
  const { user } = useAuth()
  const url = typeof window !== 'undefined' ? window.location.origin + `/propiedad/${property.slug}` : `/propiedad/${property.slug}`
  const href = buildWhatsAppUrl(phone, property.title, url)

  return (
    <Button asChild variant="secondary" size={compact ? 'sm' : 'md'}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          void createWhatsAppLead(property, user?.id)
        }}
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>
    </Button>
  )
}
