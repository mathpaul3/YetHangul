import { normalizeUnicodeToInputSymbols } from '@/engine/mapper/inputMapper'

export function normalizePastedTextToInputSymbols(text: string) {
  return normalizeUnicodeToInputSymbols(text)
}
