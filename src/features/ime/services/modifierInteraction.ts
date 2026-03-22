import type { ModifierMode } from '@/engine/core/types'

export function getNextModifierMode(currentMode: ModifierMode): ModifierMode {
  if (currentMode === 'off') {
    return 'oneshot'
  }

  if (currentMode === 'oneshot') {
    return 'locked'
  }

  return 'off'
}

export function getLongPressModifierMode(currentMode: ModifierMode): ModifierMode {
  if (currentMode === 'locked') {
    return 'locked'
  }

  return 'locked'
}
