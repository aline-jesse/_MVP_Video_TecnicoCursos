
/**
 * Índice de Templates NR
 * Exporta todos os templates disponíveis
 * 
 * FASE 3 COMPLETA - 12 templates implementados
 */

import { NR06_TEMPLATE } from './nr-06'
import { NR10_TEMPLATE } from './nr-10'
import { NR11_TEMPLATE } from './nr-11'
import { NR12_TEMPLATE } from './nr-12'
import { NR17_TEMPLATE } from './nr-17'
import { NR18_TEMPLATE } from './nr-18'
import { NR20_TEMPLATE } from './nr-20'
import { NR23_TEMPLATE } from './nr-23'
import { NR24_TEMPLATE } from './nr-24'
import { NR26_TEMPLATE } from './nr-26'
import { NR33_TEMPLATE } from './nr-33'
import { NR35_TEMPLATE } from './nr-35'

export const NR_TEMPLATES = {
  'NR-06': NR06_TEMPLATE,
  'NR-10': NR10_TEMPLATE,
  'NR-11': NR11_TEMPLATE,
  'NR-12': NR12_TEMPLATE,
  'NR-17': NR17_TEMPLATE,
  'NR-18': NR18_TEMPLATE,
  'NR-20': NR20_TEMPLATE,
  'NR-23': NR23_TEMPLATE,
  'NR-24': NR24_TEMPLATE,
  'NR-26': NR26_TEMPLATE,
  'NR-33': NR33_TEMPLATE,
  'NR-35': NR35_TEMPLATE
}

export type NRCode = keyof typeof NR_TEMPLATES

export function getNRTemplate(nr: NRCode) {
  return NR_TEMPLATES[nr]
}

export function getAllNRs(): NRCode[] {
  return Object.keys(NR_TEMPLATES) as NRCode[]
}
