import { useEffect, useState, RefObject } from 'react'

/**
 * Hook który pokazuje sticky bar TYLKO gdy scrollujemy powyżej głównego podsumowania
 * (NIE pokazuje gdy jesteśmy poniżej podsumowania, np. w stopce)
 */
export function useHideStickyOnVisible(targetRef: RefObject<HTMLElement | null>) {
  const [shouldShowBar, setShouldShowBar] = useState(false)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const checkPosition = () => {
      const rect = target.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Bar pokazuje się TYLKO gdy podsumowanie jest poniżej viewportu (nie dotarliśmy do niego)
      // I ukrywa się gdy podsumowanie jest w viewporcie LUB gdy już je minęliśmy (scrollujemy do stopki)
      const isAboveViewport = rect.top > viewportHeight
      const isBelowViewport = rect.bottom < 0
      
      // Pokazuj bar tylko gdy jesteśmy POWYŻEJ podsumowania (nie dotarliśmy do niego jeszcze)
      setShouldShowBar(isAboveViewport && !isBelowViewport)
    }

    checkPosition()
    window.addEventListener('scroll', checkPosition, { passive: true })
    window.addEventListener('resize', checkPosition, { passive: true })

    return () => {
      window.removeEventListener('scroll', checkPosition)
      window.removeEventListener('resize', checkPosition)
    }
  }, [targetRef])

  return shouldShowBar
}
