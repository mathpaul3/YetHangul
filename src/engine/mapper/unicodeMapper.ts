import { JAMO_UNICODE_TABLE } from '@/engine/tables/jamoTable'
import { resolveLiteralCharFromJamoId } from '@/engine/mapper/literalRegistry'

export function jamoIdsToUnicode(jamoIds: number[]) {
  return jamoIds.map((id) => JAMO_UNICODE_TABLE[id] ?? resolveLiteralCharFromJamoId(id) ?? '').join('')
}
