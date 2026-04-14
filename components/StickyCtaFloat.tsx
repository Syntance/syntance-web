'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface StickyCtaFloatProps {
  heroId: string
  hideSectionId?: string
  href?: string
  label?: string
}

export default function StickyCtaFloat(props: StickyCtaFloatProps) {
  const pathname = usePathname()
  return <StickyCtaFloatInner key={pathname} {...props} />
}

function StickyCtaFloatInner({
  heroId,
  hideSectionId,
  href = '/cennik',
  label = 'Sprawdź cenę',
}: StickyCtaFloatProps) {
  const router = useRouter()
  const wrapRef = useRef<HTMLDivElement>(null)
  const elRef = useRef<HTMLAnchorElement | null>(null)
  const isFixedRef = useRef(false)
  const animatingRef = useRef(false)
  const flipGenRef = useRef(0)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const el = document.createElement('a')
    el.href = href
    el.textContent = label
    el.className =
      'px-8 py-3 bg-white text-gray-900 rounded-full font-medium tracking-wider hover:bg-opacity-90 glow-box cursor-pointer inline-flex items-center justify-center text-center whitespace-nowrap shadow-lg shadow-white/10'
    el.style.transition = 'opacity 0.3s ease-out'
    el.addEventListener('click', (e) => {
      e.preventDefault()
      router.push(href)
    })
    wrap.appendChild(el)
    elRef.current = el

    return () => {
      el.style.cssText = 'display:none!important'
      el.remove()
      elRef.current = null
      isFixedRef.current = false
      animatingRef.current = false
    }
  }, [href, label, router])

  const flipToFixed = useCallback(() => {
    const el = elRef.current
    const wrap = wrapRef.current
    if (!el || !wrap || isFixedRef.current) return
    animatingRef.current = true
    const gen = ++flipGenRef.current
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
    const sx = last.width > 0 ? first.width / last.width : 1
    const sy = last.height > 0 ? first.height / last.height : 1

    isFixedRef.current = true

    el.style.transition = 'none'
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!elRef.current || flipGenRef.current !== gen) return
        el.style.transition =
          'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease-out'
        el.style.transform = 'none'
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
    if (!el || !wrap || !isFixedRef.current) return
    animatingRef.current = true
    const gen = ++flipGenRef.current
    isFixedRef.current = false

    const first = el.getBoundingClientRect()
    const firstCx = first.left + first.width / 2
    const firstCy = first.top + first.height / 2

    el.style.transition = 'none'
    el.style.transform = 'none'
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
    const lastCx = last.left + last.width / 2
    const lastCy = last.top + last.height / 2

    const baseDx = firstCx - lastCx
    const baseDy = firstCy - lastCy
    const sxStart = last.width > 0 ? first.width / last.width : 1
    const syStart = last.height > 0 ? first.height / last.height : 1
    const scrollY0 = window.scrollY

    el.style.transform = `translate(${baseDx}px, ${baseDy}px) scale(${sxStart}, ${syStart})`

    const duration = 600
    const startTime = performance.now()

    const ease = (t: number) => {
      const x1 = 0.22, x2 = 0.36
      let s = t
      for (let i = 0; i < 8; i++) {
        const cs = 1 - s
        const x = 3 * cs * cs * s * x1 + 3 * cs * s * s * x2 + s * s * s
        const dx = 3 * cs * cs * x1 + 6 * cs * s * (x2 - x1) + 3 * s * s * (1 - x2)
        if (Math.abs(dx) < 1e-6) break
        s = Math.max(0, Math.min(1, s - (x - t) / dx))
      }
      return 3 * s * (1 - s) * (1 - s) + 3 * s * s * (1 - s) + s * s * s
    }

    const tick = (now: number) => {
      if (!elRef.current || flipGenRef.current !== gen) return
      const p = Math.min((now - startTime) / duration, 1)
      const e = ease(p)
      const scrollDelta = window.scrollY - scrollY0
      const dy = (baseDy + scrollDelta) * (1 - e)
      const dx = baseDx * (1 - e)
      const sx = sxStart + (1 - sxStart) * e
      const sy = syStart + (1 - syStart) * e
      el.style.transform = p < 1
        ? `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
        : 'none'
      if (p < 1) {
        requestAnimationFrame(tick)
      } else {
        animatingRef.current = false
      }
    }

    requestAnimationFrame(tick)
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

    return () => {
      observer.disconnect()
    }
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
    const hide = () => {
      const el = elRef.current
      if (el) {
        el.style.transition = 'opacity 0.2s ease-out'
        el.style.opacity = '0'
      }
    }

    const onClick = (e: MouseEvent) => {
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
        hide()
      } catch {
        /* ignore */
      }
    }
    document.addEventListener('click', onClick, true)
    return () =>
      document.removeEventListener('click', onClick, true)
  }, [])

  return <div ref={wrapRef} className="inline-flex justify-center" />
}
