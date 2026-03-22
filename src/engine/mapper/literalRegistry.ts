const LITERAL_ID_START = 1_000_000

const charToId = new Map<string, number>()
const idToChar = new Map<number, string>()

export function encodeLiteralCharAsJamoId(char: string) {
  const existing = charToId.get(char)

  if (existing != null) {
    return existing
  }

  const nextId = LITERAL_ID_START + charToId.size
  charToId.set(char, nextId)
  idToChar.set(nextId, char)
  return nextId
}

export function encodeLiteralTextAsJamoIds(text: string) {
  return [...text].map((char) => encodeLiteralCharAsJamoId(char))
}

export function resolveLiteralCharFromJamoId(id: number) {
  return idToChar.get(id)
}

