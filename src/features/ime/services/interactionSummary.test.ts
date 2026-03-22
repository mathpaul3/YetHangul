import { describe, expect, it } from 'vitest'
import type { ModifierState } from '@/engine/core/types'
import { buildCompactSurfaceSummary } from '@/features/ime/services/interactionSummary'

const emptyModifiers: ModifierState = {
  leftCtrl: 'off',
  rightCtrl: 'off',
  leftShift: 'off',
  rightShift: 'off',
}

describe('interaction summary', () => {
  it('describes an empty selection compactly', () => {
    const summary = buildCompactSurfaceSummary(null, emptyModifiers)

    expect(summary.selectionLabel).toBe('Sel none')
    expect(summary.activeModifiers).toEqual([])
  })

  it('lists only active modifiers in a stable order', () => {
    const summary = buildCompactSurfaceSummary(
      { start: 2, end: 5 },
      {
        leftCtrl: 'locked',
        rightCtrl: 'off',
        leftShift: 'oneshot',
        rightShift: 'off',
      },
    )

    expect(summary.selectionLabel).toBe('Sel 2-5')
    expect(summary.activeModifiers).toEqual([
      { key: 'leftCtrl', label: 'L Ctrl', mode: 'locked' },
      { key: 'leftShift', label: 'L Shift', mode: 'oneshot' },
    ])
  })

  it('keeps the compact label readable for adjacent newline selections', () => {
    const summary = buildCompactSurfaceSummary(
      { start: 4, end: 4 },
      emptyModifiers,
    )

    expect(summary.selectionLabel).toBe('Sel 4-4')
  })
})
