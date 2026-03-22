import { describe, expect, it } from 'vitest'
import {
  getLongPressModifierMode,
  getNextModifierMode,
} from '@/features/ime/services/modifierInteraction'

describe('modifierInteraction', () => {
  it('cycles modifier mode in the expected order', () => {
    expect(getNextModifierMode('off')).toBe('oneshot')
    expect(getNextModifierMode('oneshot')).toBe('locked')
    expect(getNextModifierMode('locked')).toBe('off')
  })

  it('locks modifier mode on long press', () => {
    expect(getLongPressModifierMode('off')).toBe('locked')
    expect(getLongPressModifierMode('oneshot')).toBe('locked')
    expect(getLongPressModifierMode('locked')).toBe('locked')
  })
})
