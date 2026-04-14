'use client'

import { useEffect, useRef, useCallback } from 'react'

interface StickyCtaFloatProps {
  heroId: string
  hideSectionId?: string
  href?: string
  label?: string
}

export default function StickyCtaFloat({
  heroId,
  hideSectionId,
  href = '/cennik',
  label = 'Sprawdź cenę',
}: StickyCtaFloatProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const elRef = useRef<HTMLAnchorElement | null>(null)
  const isFixedRef = useRef(false)
  const animatingRef = useRef(false)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const el = document.createElement('a')
    el.href = href
    el.textContent = label
    el.className =
      'px-8 py-3 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-opacity-90 glow-box cursor-pointer inline-block text-center whitespace-nowrap shadow-lg shadow-white/10'
    el.style.transition = 'opacity 0.3s ease-out'
    wrap.appendChild(el)
    elRef.current = el

    return () => {
      el.remove()
      elRef.current = null
    }
  }, [href, label])

  const flipToFixed = useCallback(() => {
    const el = elRef.current
    const wrap = wrapRef.current
    if (!el || !wrap || isFixedRef.current || animatingRef.current) return
    animatingRef.current = true

    const first = el.getBoundingClientRect()

    wrap.style.width = `${first.width}px`
    wrap.style.height = `${first.height}px`

    document.body.appendChild(el)

    el.style.position = 'fixed'
    el.style.bottom = '1.5rem'
    el.style.right = '1.5rem'
    el.style.left = 'auto'
    el.style.top = 'auto'
    el.style.zIndex = '50'
    el.style.fontSize = '0.875rem'
    el.style.padding = '0.625rem 1.5rem'

    const last = el.getBoundingClientRect()
    const dx = first.left + first.width / 2 - (last.left + last.width / 2)
    const dy = first.top + first.height / 2 - (last.top + last.height / 2)

    el.style.transition = 'none'
    el.style.transform = `translate(${dx}px, ${dy}px)`

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!elRef.current) return
        el.style.transition =
          'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease-out'
        el.style.transform = 'none'
        isFixedRef.current = true
        const onEnd = () => {
          animatingRef.current = false
          el.removeEventListener('transitionend', onEnd)
        }
        el.addEventListener('transitionend', onEnd, { once: true })
        setTimeout(() => {
          animatingRef.current = false
        }, 700)
      })
    })
  }, [])

  const flipToInline = useCallback(() => {
    const el = elRef.current
    const wrap = wrapRef.current
    if (!el || !wrap || !isFixedRef.current || animatingRef.current) return
    animatingRef.current = true

    const first = el.getBoundingClientRect()

    wrap.appendChild(el)

    el.style.position = ''
    el.style.bottom = ''
    el.style.right = ''
    el.style.left = ''
    el.style.top = ''
    el.style.zIndex = ''
    el.style.fontSize = ''
    el.style.padding = ''
    wrap.style.width = ''
    wrap.style.height = ''

    const last = el.getBoundingClientRect()
    const dx = first.left + first.width / 2 - (last.left + last.width / 2)
    const dy = first.top + first.height / 2 - (last.top + last.height / 2)

    el.style.transition = 'none'
    el.style.transform = `translate(${dx}px, ${dy}px)`

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!elRef.current) return
        el.style.transition =
          'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease-out'
        el.style.transform = 'none'
        isFixedRef.current = false
        const onEnd = () => {
          animatingRef.current = false
          el.removeEventListener('transitionend', onEnd)
        }
        el.addEventListener('transitionend', onEnd, { once: true })
        setTimeout(() => {
          animatingRef.current = false
        }, 700)
      })
    })
  }, [])

  useEffect(() => {
    const hero = document.getElementById(heroId)
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.7) {
          flipToFixed()
        } else {
          flipToInline()
        }
      },
      { threshold: [0, 0.3, 0.5, 0.7, 0.8, 1] }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [heroId, flipToFixed, flipToInline])

  useEffect(() => {
    if (!hideSectionId) return
    const section = document.getElementById(hideSectionId)
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const el = elRef.current
        if (!el) return
        if (entry.isIntersecting) {
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
        } else {
          el.style.opacity = ''
          el.style.pointerEvents = ''
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [hideSectionId])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const elLink = (e.target as HTMLElement | null)?.closest?.('a[href]')
      if (!elLink || !(elLink instanceof HTMLAnchorElement)) return
      if (
        elLink.getAttribute('target') === '_blank' ||
        elLink.hasAttribute('download')
      )
        return
      try {
        const url = new URL(elLink.href, window.location.href)
        if (url.origin !== window.location.origin) return
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        )
          return
        const el = elRef.current
        if (el) {
          el.style.transition = 'opacity 0.15s ease-out'
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
        }
      } catch {
        /* ignore */
      }
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true)
  }, [])

  return <div ref={wrapRef} className="inline-flex justify-center" />
}
