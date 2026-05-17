import { ShieldCheck } from 'lucide-react'
import { Badge } from '../ui/badge'

export function AdvisorVerificationBadge({ verified }: { verified: boolean }) {
  if (!verified) return <Badge>En revision</Badge>
  return (
    <Badge tone="green" className="gap-1">
      <ShieldCheck className="h-3.5 w-3.5" />
      Asesor verificado
    </Badge>
  )
}
