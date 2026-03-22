import {
  PRIMITIVE_FINALS,
  PRIMITIVE_INITIALS,
  PRIMITIVE_MEDIALS,
} from '@/engine/tables/archaicPrimitiveCatalog'
import {
  ARCHAIC_FINAL_RULES,
  ARCHAIC_INITIAL_RULES,
  ARCHAIC_MEDIAL_RULES,
} from '@/engine/tables/archaicRuleCatalog'
import { TARGET_INVENTORY } from '@/engine/tables/inventoryCatalog'

function uniqueChars(chars: string[]) {
  return [...new Set(chars)]
}

const AUXILIARY_TARGET_UNICODE = ['ᅟ', 'ᅠ', '〮', '〯']
const AUXILIARY_SUPPORTED_UNICODE = ['ᅟ', 'ᅠ', '〮', '〯']

const TARGET_INITIAL_UNICODE = TARGET_INVENTORY.initial.map((entry) => entry.char)
const TARGET_MEDIAL_UNICODE = TARGET_INVENTORY.medial.map((entry) => entry.char)
const TARGET_FINAL_UNICODE = TARGET_INVENTORY.final.map((entry) => entry.char)

const SUPPORTED_INITIAL_UNICODE = uniqueChars([
  ...PRIMITIVE_INITIALS.map((entry) => entry.char),
  ...ARCHAIC_INITIAL_RULES.map((entry) => entry.char),
])
const SUPPORTED_MEDIAL_UNICODE = uniqueChars([
  ...PRIMITIVE_MEDIALS.map((entry) => entry.char),
  ...ARCHAIC_MEDIAL_RULES.map((entry) => entry.char),
])
const SUPPORTED_FINAL_UNICODE = uniqueChars([
  ...PRIMITIVE_FINALS.map((entry) => entry.char),
  ...ARCHAIC_FINAL_RULES.map((entry) => entry.char),
])

function createCoverage(target: string[], supported: string[]) {
  const targetSet = new Set(target)
  const supportedSet = new Set(supported.filter((char) => targetSet.has(char)))

  return {
    targetCount: target.length,
    supportedCount: supportedSet.size,
    missingCount: target.length - supportedSet.size,
    coverageRatio: supportedSet.size / target.length,
    missing: target.filter((char) => !supportedSet.has(char)),
  }
}

export const TARGET_INITIALS = TARGET_INITIAL_UNICODE
export const TARGET_MEDIALS = TARGET_MEDIAL_UNICODE
export const TARGET_FINALS = TARGET_FINAL_UNICODE

export const TARGET_INVENTORY_COUNTS = Object.freeze({
  initial: TARGET_INITIALS.length,
  medial: TARGET_MEDIALS.length,
  final: TARGET_FINALS.length,
})

export const TARGET_INVENTORY_COVERAGE = Object.freeze({
  initial: createCoverage(TARGET_INITIALS, SUPPORTED_INITIAL_UNICODE),
  medial: createCoverage(TARGET_MEDIALS, SUPPORTED_MEDIAL_UNICODE),
  final: createCoverage(TARGET_FINALS, SUPPORTED_FINAL_UNICODE),
})

export const TARGET_AUXILIARY_COVERAGE = Object.freeze(
  createCoverage(AUXILIARY_TARGET_UNICODE, AUXILIARY_SUPPORTED_UNICODE),
)
