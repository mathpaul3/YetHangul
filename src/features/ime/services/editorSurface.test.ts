import { describe, expect, it } from 'vitest'
import { getEditorSurfaceTouchBehavior } from '@/features/ime/services/editorSurface'

describe('editor surface touch behavior', () => {
  it('suppresses browser pan and scroll gestures on the editor surface', () => {
    expect(getEditorSurfaceTouchBehavior()).toEqual({
      touchAction: 'none',
      overscrollBehavior: 'contain',
    })
  })
})
