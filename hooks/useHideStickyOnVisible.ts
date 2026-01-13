import { useEffect, useState, RefObject } from 'react'

/**
 * Hook który ukrywa sticky bar gdy target element jest widoczny
 */
export function useHideStickyOnVisible(targetRef: RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useState(false) // Na początku podsumowanie nie jest widoczne

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        threshold: 0, 
        rootMargin: '0px 0px 200px 0px' // Wykryj trochę wcześniej (200px przed)
      }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [targetRef])

  return isVisible
}
