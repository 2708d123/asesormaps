const FAVORITES_KEY = 'asesormaps:favorites'

export function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function isFavorite(id: string) {
  return getFavoriteIds().includes(id)
}

export function toggleFavorite(id: string) {
  const favorites = getFavoriteIds()
  const next = favorites.includes(id)
    ? favorites.filter((favoriteId) => favoriteId !== id)
    : [...favorites, id]
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('favorites:changed'))
  return next.includes(id)
}
