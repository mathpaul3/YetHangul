import type { CSSProperties } from 'react'

export function getEditorSurfaceTouchBehavior(): CSSProperties {
  return {
    touchAction: 'none',
    overscrollBehavior: 'contain',
  }
}
