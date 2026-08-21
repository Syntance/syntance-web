import { z } from 'zod'
import { defaultPartnerSettings, type PartnerSettings } from '@/lib/data/partner'

/**
 * Walidacja parametrów modelu partnerskiego — trzymana osobno od `partner.ts`,
 * bo tamten moduł ląduje w bundlu publicznej strony (przelicznik na /dla-agencji),
 * a Zod jest potrzebny wyłącznie po stronie panelu i API.
 */

export const partnerLevelSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1, 'Poziom musi mieć nazwę.').max(60),
  when: z.string().min(1, 'Uzupełnij, kiedy poziom obowiązuje.').max(120),
  /** Rabat od ceny detalicznej, w procentach (0–90). */
  discountPercent: z.number().min(0, 'Rabat nie może być ujemny.').max(90, 'Rabat maksymalnie 90%.'),
})

export const partnerSettingsSchema = z.object({
  levels: z.array(partnerLevelSchema).min(1, 'Zostaw przynajmniej jeden poziom.').max(6),
  whiteLabelSurchargePercent: z.number().min(0).max(100),
  minProjectNet: z.number().int().min(0).max(1_000_000),
  hourlyRateRetail: z.number().int().min(0).max(10_000),
  hourlyRatePartner: z.number().int().min(0).max(10_000),
  auditPriceNet: z.number().int().min(0).max(1_000_000),
  revisionRoundsIncluded: z.number().int().min(0).max(20),
})

/**
 * Scala to, co siedzi w bazie, z domyślnymi wartościami.
 * Niepoprawny lub częściowy rekord nie może wywrócić strony — wtedy wracamy do domyślnych.
 */
export function mergePartnerSettings(raw: unknown): PartnerSettings {
  if (!raw || typeof raw !== 'object') return defaultPartnerSettings
  const parsed = partnerSettingsSchema.safeParse({
    ...defaultPartnerSettings,
    ...(raw as Record<string, unknown>),
  })
  return parsed.success ? parsed.data : defaultPartnerSettings
}
