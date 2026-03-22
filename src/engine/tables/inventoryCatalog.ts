export type InventoryKind = 'initial' | 'medial' | 'final'

export type InventoryEntry = {
  kind: InventoryKind
  char: string
  codePoint: number
  label: string
}

export function toInventorySymbolName(entry: InventoryEntry) {
  return `DIRECT_${entry.kind.toUpperCase()}_${entry.label}`.replace(/[^A-Z0-9_]/g, '_')
}

function rangeToEntries(kind: InventoryKind, start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => {
    const codePoint = start + index

    return {
      kind,
      char: String.fromCodePoint(codePoint),
      codePoint,
      label: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
    } satisfies InventoryEntry
  })
}

function dedupe(entries: InventoryEntry[]) {
  const seen = new Set<number>()

  return entries.filter((entry) => {
    if (seen.has(entry.codePoint)) {
      return false
    }

    seen.add(entry.codePoint)
    return true
  })
}

export const TARGET_INITIAL_INVENTORY = dedupe([
  ...rangeToEntries('initial', 0x1100, 0x115F),
  ...rangeToEntries('initial', 0xA960, 0xA97C),
])

export const TARGET_MEDIAL_INVENTORY = dedupe([
  ...rangeToEntries('medial', 0x1160, 0x11A7),
  ...rangeToEntries('medial', 0xD7B0, 0xD7C6),
])

export const TARGET_FINAL_INVENTORY = dedupe([
  ...rangeToEntries('final', 0x11A7, 0x11FF),
  ...rangeToEntries('final', 0xD7CB, 0xD7FB),
])

export const TARGET_INVENTORY = Object.freeze({
  initial: TARGET_INITIAL_INVENTORY,
  medial: TARGET_MEDIAL_INVENTORY,
  final: TARGET_FINAL_INVENTORY,
})
