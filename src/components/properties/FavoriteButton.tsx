import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { isFavorite, toggleFavorite } from '../../lib/favorites'
import { isRemoteFavorite, toggleRemoteFavorite } from '../../lib/supabaseActions'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

export function FavoriteButton({ propertyId }: { propertyId: string }) {
  const [active, setActive] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    let cancelled = false
    async function loadFavorite() {
      if (user) {
        const remote = await isRemoteFavorite(propertyId, user)
        if (!cancelled && remote) {
          setActive(true)
          return
        }
      }
      if (!cancelled) setActive(isFavorite(propertyId))
    }
    void loadFavorite()
    return () => {
      cancelled = true
    }
  }, [propertyId, user])

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Guardar propiedad"
      onClick={async (event) => {
        event.preventDefault()
        try {
          const remote = await toggleRemoteFavorite(propertyId, user)
          if (remote !== null) {
            setActive(remote)
            return
          }
        } catch (error) {
          console.warn('Favorito remoto fallo, usando localStorage', error)
        }
        setActive(toggleFavorite(propertyId))
      }}
      className={cn(active && 'border-[#FACC15] bg-[#FEF3C7] text-[#92400E]')}
    >
      <Heart className={cn('h-4 w-4', active && 'fill-current')} />
    </Button>
  )
}
