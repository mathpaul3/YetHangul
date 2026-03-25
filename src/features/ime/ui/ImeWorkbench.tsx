import { useEffect, useRef, useState } from 'react'
import packageJson from '../../../../package.json'
import { INPUT_SYMBOL_IDS } from '@/engine/tables/inputSymbolTable'
import { useImeWorkbench } from '@/features/ime/hooks/useImeWorkbench'
import { getEditorSurfaceTouchBehavior } from '@/features/ime/services/editorSurface'
import { detectPreferredKeyboardMode } from '@/features/ime/services/keyboardMode'

const preferredMode = detectPreferredKeyboardMode()
const REPOSITORY_URL = 'https://github.com/mathpaul3/YetHangul'
const AUTHOR_URL = 'https://github.com/mathpaul3'
const HELP_OVERLAY_DISMISSED_KEY = 'yethangul-help-overlay-dismissed'
const APP_VERSION = packageJson.version
const SHIFT_RULES = [
  ['Shift + ㄱ', 'ᄁ', '쌍기역'],
  ['Shift + ㄴ', 'ᄔ', '쌍니은'],
  ['Shift + ㄷ', 'ᄄ', '쌍디귿'],
  ['Shift + ㄹ', 'ᄙ', '쌍리을'],
  ['Shift + ㅁ', 'ᅟᅠퟠ', '쌍미음'],
  ['Shift + ㅂ', 'ᄈ', '쌍비읍'],
  ['Shift + ㅅ', 'ᄊ', '쌍시옷'],
  ['Shift + ㅇ', 'ᅇ', '쌍이응'],
  ['Shift + ㅈ', 'ᄍ', '쌍지읒'],
  ['Shift + ㅌ', 'ꥹ', '쌍티읕'],
  ['Shift + ㅎ', 'ᅘ', '쌍히읗'],
  ['Shift + ᅙ', 'ꥼ', '쌍여린히읗'],
  ['Shift + ᆞ', 'ᆢ', '쌍아래아'],
  ['Shift + ㅗ', 'ᆂ', 'ㅗ + ㅗ'],
  ['Shift + ㅜ', 'ᆍ', 'ㅜ + ㅜ'],
  ['Shift + ㅡ', 'ᆖ', 'ㅡ + ㅡ'],
  ['Shift + ㅣ', 'ퟄ', 'ㅣ + ㅣ'],
] as const

const CTRL_RULES = [
  ['L Ctrl + ㅅ', 'ᄼ', '치두음 시옷'],
  ['R Ctrl + ㅅ', 'ᄾ', '정치음 시옷'],
  ['L Ctrl + ㅆ', 'ᄽ', '치두음 쌍시옷'],
  ['R Ctrl + ㅆ', 'ᄿ', '정치음 쌍시옷'],
  ['Ctrl + ㅇ', 'ᅌ', '옛이응'],
  ['L Ctrl + ㅈ', 'ᅎ', '치두음 지읒'],
  ['R Ctrl + ㅈ', 'ᅐ', '정치음 지읒'],
  ['L Ctrl + ㅉ', 'ᅏ', '치두음 쌍지읒'],
  ['R Ctrl + ㅉ', 'ᅑ', '정치음 쌍지읒'],
  ['Shift + ㅊ', 'ᅀ', '반치음'],
  ['L Ctrl + ㅊ', 'ᅔ', '치두음 치읓'],
  ['R Ctrl + ㅊ', 'ᅕ', '정치음 치읓'],
  ['Ctrl + ㅎ', 'ᅙ', '여린 히읗'],
  ['Ctrl + ㅏ', 'ᆞ', '아래아'],
  ['Ctrl + Space(초성)', 'ᅟ', '한글초성채움문자'],
  ['Ctrl + Space(중성)', 'ᅠ', '한글중성채움문자'],
  ['Ctrl + .', '〮', '거성'],
  ['Ctrl + ;', '〯', '상성'],
] as const

const keyboardRows = {
  number: [
    ['1', '1'],
    ['2', '2'],
    ['3', '3'],
    ['4', '4'],
    ['5', '5'],
    ['6', '6'],
    ['7', '7'],
    ['8', '8'],
    ['9', '9'],
    ['0', '0'],
    ['Backspace', 'backspace'],
  ],
  top: [
    ['ㅂ', INPUT_SYMBOL_IDS.BIEUP],
    ['ㅈ', INPUT_SYMBOL_IDS.CIEUC],
    ['ㄷ', INPUT_SYMBOL_IDS.DIGEUT],
    ['ㄱ', INPUT_SYMBOL_IDS.GIYEOK],
    ['ㅅ', INPUT_SYMBOL_IDS.SIOS],
    ['ㅛ', INPUT_SYMBOL_IDS.YO],
    ['ㅕ', INPUT_SYMBOL_IDS.YEO],
    ['ㅑ', INPUT_SYMBOL_IDS.YA],
    ['ㅐ', INPUT_SYMBOL_IDS.AE],
    ['ㅔ', INPUT_SYMBOL_IDS.E],
    ['Enter', 'enter'],
  ],
  middle: [
    ['ㅁ', INPUT_SYMBOL_IDS.MIEUM],
    ['ㄴ', INPUT_SYMBOL_IDS.NIEUN],
    ['ㅇ', INPUT_SYMBOL_IDS.IEUNG],
    ['ㄹ', INPUT_SYMBOL_IDS.RIEUL],
    ['ㅎ', INPUT_SYMBOL_IDS.HIEUH],
    ['ㅗ', INPUT_SYMBOL_IDS.O],
    ['ㅓ', INPUT_SYMBOL_IDS.EO],
    ['ㅏ', INPUT_SYMBOL_IDS.A],
    ['ㅣ', INPUT_SYMBOL_IDS.I],
    [';', 'semicolon'],
  ],
  bottom: [
    ['L Shift', 'leftShift'],
    ['ㅋ', INPUT_SYMBOL_IDS.KHIEUKH],
    ['ㅌ', INPUT_SYMBOL_IDS.THIEUTH],
    ['ㅊ', INPUT_SYMBOL_IDS.CHIEUCH],
    ['ㅍ', INPUT_SYMBOL_IDS.PHIEUPH],
    ['ㅠ', INPUT_SYMBOL_IDS.YU],
    ['ㅜ', INPUT_SYMBOL_IDS.U],
    ['ㅡ', INPUT_SYMBOL_IDS.EU],
    ['.', 'period'],
    ['R Shift', 'rightShift'],
  ],
  nav: [
    ['L Ctrl', 'leftCtrl'],
    ['R Ctrl', 'rightCtrl'],
    ['Space', 'space'],
    ['Home', 'home'],
    ['End', 'end'],
    ['←', 'arrowLeft'],
    ['→', 'arrowRight'],
  ],
  compact: [
    ['L Ctrl', 'leftCtrl'],
    ['R Ctrl', 'rightCtrl'],
    ['L Shift', 'leftShift'],
    ['R Shift', 'rightShift'],
    ['Home', 'home'],
    ['End', 'end'],
    ['←', 'arrowLeft'],
    ['→', 'arrowRight'],
  ],
} as const

const modifierLabels = {
  leftCtrl: 'L Ctrl',
  rightCtrl: 'R Ctrl',
  leftShift: 'L Shift',
  rightShift: 'R Shift',
} as const

const SHIFT_DISPLAY_MAP: Record<string, string> = {
  'ㄱ': 'ᄁ',
  'ㄴ': 'ᄔ',
  'ㄷ': 'ᄄ',
  'ㄹ': 'ᄙ',
  'ㅁ': 'ᅟᅠퟠ',
  'ㅂ': 'ᄈ',
  'ㅅ': 'ᄊ',
  'ㅇ': 'ᅇ',
  'ㅈ': 'ᄍ',
  'ㅐ': 'ㅒ',
  'ㅔ': 'ㅖ',
  'ㅊ': 'ᅀ',
  'ㅌ': 'ꥹ',
  'ㅎ': 'ᅘ',
  'ㅗ': 'ᆂ',
  'ㅜ': 'ᆍ',
  'ㅡ': 'ᆖ',
  'ㅣ': 'ퟄ',
}

const LEFT_CTRL_DISPLAY_MAP: Record<string, string> = {
  'ㅅ': 'ᄼ',
  'ㅈ': 'ᅎ',
  'ㅊ': 'ᅔ',
  'ㅇ': 'ᅌ',
  'ㅎ': 'ᅙ',
  'ㅏ': 'ᆞ',
  '.': '〮',
  ';': '〯',
}

const RIGHT_CTRL_DISPLAY_MAP: Record<string, string> = {
  'ㅅ': 'ᄾ',
  'ㅈ': 'ᅐ',
  'ㅊ': 'ᅕ',
  'ㅇ': 'ᅌ',
  'ㅎ': 'ᅙ',
  'ㅏ': 'ᆞ',
  '.': '〮',
  ';': '〯',
}

const LEFT_CTRL_SHIFT_DISPLAY_MAP: Record<string, string> = {
  'ㅅ': 'ᄽ',
  'ㅈ': 'ᅏ',
  'ㅊ': 'ᅀ',
  'ㅎ': 'ꥼ',
  'ㅏ': 'ᆢ',
}

const RIGHT_CTRL_SHIFT_DISPLAY_MAP: Record<string, string> = {
  'ㅅ': 'ᄿ',
  'ㅈ': 'ᅑ',
  'ㅊ': 'ᅀ',
  'ㅎ': 'ꥼ',
  'ㅏ': 'ᆢ',
}

export function ImeWorkbench() {
  const rootRef = useRef<HTMLElement | null>(null)
  const nativeKeyboardRef = useRef<HTMLTextAreaElement | null>(null)
  const [renderMode, setRenderMode] = useState<'composed' | 'decomposed'>('composed')
  const [showHelpOverlay, setShowHelpOverlay] = useState(false)
  const [isKeyboardExpanded, setIsKeyboardExpanded] = useState(preferredMode === 'hardware')
  const [helpSections, setHelpSections] = useState({
    principles: true,
    shift: true,
    ctrl: true,
  })
  const editorSurfaceTouchBehavior = getEditorSurfaceTouchBehavior()
  const nativeKeyboardEnabled = preferredMode !== 'hardware'
  const {
    engineState,
    hardwareModifierState,
    pressedVisualKeys,
    copyFeedback,
    renderedUnits,
    renderedCaretIndex,
    renderedText,
    selectionRange,
    handleVirtualBackspacePointerDown,
    clearBackspaceRepeat,
    handleVirtualNavigationPointerDown,
    clearNavigationRepeat,
    dispatchNormalizedInputEvent,
    handleCaretPlacement,
    handleSelectionEnd,
    handlePointerCancel,
    handleSelectionEnter,
    handleSelectionStart,
    handleEditorSurfacePointerMove,
    handleKeyDown,
    handleKeyUp,
    handleEditorFocus,
    handleEditorBlur,
    handlePaste,
    handleCopy,
    copyAllText,
    copySelectionText,
    handleBeforeInput,
    handleCompositionStart,
    handleCompositionEnd,
  } = useImeWorkbench()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const dismissed = window.localStorage.getItem(HELP_OVERLAY_DISMISSED_KEY)
    setShowHelpOverlay(dismissed !== 'true')
  }, [])

  function closeHelpOverlay() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HELP_OVERLAY_DISMISSED_KEY, 'true')
    }

    setShowHelpOverlay(false)
  }

  function getModifierVisualClass(key: keyof typeof modifierLabels) {
    const mode = engineState.modifierState[key]
    const hardwarePressed = hardwareModifierState[key] === true

    if (mode === 'locked') {
      return 'modifier-locked'
    }

    if (mode !== 'off' || hardwarePressed) {
      return 'modifier-active'
    }

    return ''
  }

  function getKeycapClass(label: string) {
    return pressedVisualKeys[label] ? 'keycap-pressed' : ''
  }

  function getDisplayedKeyLabel(label: string, action: number | string) {
    if (
      action === 'backspace' ||
      action === 'enter' ||
      action === 'leftCtrl' ||
      action === 'rightCtrl' ||
      action === 'leftShift' ||
      action === 'rightShift' ||
      action === 'arrowLeft' ||
      action === 'arrowRight' ||
      action === 'home' ||
      action === 'end'
    ) {
      return label
    }

    const leftCtrlActive =
      engineState.modifierState.leftCtrl !== 'off' || hardwareModifierState.leftCtrl === true
    const rightCtrlActive =
      engineState.modifierState.rightCtrl !== 'off' || hardwareModifierState.rightCtrl === true
    const shiftActive =
      engineState.modifierState.leftShift !== 'off' ||
      engineState.modifierState.rightShift !== 'off' ||
      hardwareModifierState.leftShift === true ||
      hardwareModifierState.rightShift === true

    if (leftCtrlActive && shiftActive) {
      return LEFT_CTRL_SHIFT_DISPLAY_MAP[label] ?? LEFT_CTRL_DISPLAY_MAP[label] ?? SHIFT_DISPLAY_MAP[label] ?? label
    }

    if (rightCtrlActive && shiftActive) {
      return RIGHT_CTRL_SHIFT_DISPLAY_MAP[label] ?? RIGHT_CTRL_DISPLAY_MAP[label] ?? SHIFT_DISPLAY_MAP[label] ?? label
    }

    if (leftCtrlActive) {
      return LEFT_CTRL_DISPLAY_MAP[label] ?? label
    }

    if (rightCtrlActive) {
      return RIGHT_CTRL_DISPLAY_MAP[label] ?? label
    }

    if (shiftActive) {
      return SHIFT_DISPLAY_MAP[label] ?? label
    }

    return label
  }

  function renderEditorUnit(unit: string) {
    if (renderMode === 'decomposed') {
      return <span className="editor-decomposed-unit">{Array.from(unit).join(' ')}</span>
    }

    return unit
  }

  function preventVirtualKeyboardFocus(event: React.PointerEvent<HTMLElement>) {
    event.preventDefault()
  }

  function focusInputSurface() {
    if (nativeKeyboardEnabled) {
      nativeKeyboardRef.current?.focus({ preventScroll: true })
      return
    }

    rootRef.current?.focus()
  }

  function renderCopyIcon(type: 'all' | 'selection') {
    const label = type === 'all' ? '전체 복사' : '선택 복사'

    return (
      <span aria-hidden="true" className="icon-copy">
        {type === 'all' ? '⧉' : '⎘'}
        <span className="sr-only">{label}</span>
      </span>
    )
  }

  function renderHelpIcon() {
    return (
      <span aria-hidden="true" className="icon-help">
        ?
      </span>
    )
  }

  function renderKeyLabel(label: string, keyClassName = '') {
    const isCompactShift =
      keyClassName.includes('keycap-compact') &&
      (label === 'L Shift' || label === 'R Shift')

    if (isCompactShift) {
      return label
    }

    const iconMap: Record<string, string> = {
      Backspace: '⌫',
      Enter: '↵',
      'L Shift': '⇧',
      'R Shift': '⇧',
    }

    return iconMap[label] ?? label
  }

  function renderKeyboardAction(
    label: string,
    action: number | string,
    keyClassName = '',
  ) {
    const displayedLabel = getDisplayedKeyLabel(label, action)

    if (action === 'backspace') {
      return (
        <button
          className={`keycap keycap-utility keycap-backspace ${getKeycapClass(label)} ${keyClassName}`.trim()}
          data-key-label={label}
          key={label}
          type="button"
          onPointerCancel={clearBackspaceRepeat}
          onPointerDown={(event) => {
            preventVirtualKeyboardFocus(event)
            handleVirtualBackspacePointerDown()
            focusInputSurface()
          }}
          onPointerLeave={clearBackspaceRepeat}
          onPointerUp={clearBackspaceRepeat}
        >
          {renderKeyLabel(displayedLabel, keyClassName)}
        </button>
      )
    }

    if (action === 'enter') {
      return (
        <button
          className={`keycap keycap-utility keycap-enter ${getKeycapClass(label)} ${keyClassName}`.trim()}
          data-key-label={label}
          key={label}
          type="button"
          onClick={() => {
            dispatchNormalizedInputEvent({
              type: 'utility',
              utilityKey: 'enter',
              directText: '\n',
            })
            focusInputSurface()
          }}
          onPointerDown={preventVirtualKeyboardFocus}
        >
          {renderKeyLabel(displayedLabel, keyClassName)}
        </button>
      )
    }

    if (action === 'semicolon' || action === 'period' || action === 'space') {
      const utilityKey =
        action === 'semicolon'
          ? 'semicolon'
          : action === 'period'
            ? 'period'
            : 'space'

      return (
        <button
          className={`keycap keycap-utility ${action === 'space' ? 'keycap-space' : ''} ${getKeycapClass(label)} ${keyClassName}`.trim()}
          data-key-label={label}
          key={label}
          type="button"
          onClick={() => {
            dispatchNormalizedInputEvent({
              type: 'utility',
              utilityKey,
            })
            focusInputSurface()
          }}
          onPointerDown={preventVirtualKeyboardFocus}
        >
          {renderKeyLabel(displayedLabel, keyClassName)}
        </button>
      )
    }

    if (
      action === 'leftCtrl' ||
      action === 'rightCtrl' ||
      action === 'leftShift' ||
      action === 'rightShift'
    ) {
      return (
        <button
          className={`keycap keycap-utility keycap-modifier ${getModifierVisualClass(action)} ${getKeycapClass(label)} ${keyClassName}`.trim()}
          data-key-label={label}
          data-modifier-key={action}
          data-modifier-mode={engineState.modifierState[action]}
          key={label}
          type="button"
          onClick={() => {
            dispatchNormalizedInputEvent({
              type: 'modifier',
              modifierKey: action,
              visualKeyLabel: label,
            })
            focusInputSurface()
          }}
          onPointerDown={preventVirtualKeyboardFocus}
        >
          {renderKeyLabel(displayedLabel, keyClassName)}
        </button>
      )
    }

    if (
      action === 'arrowLeft' ||
      action === 'arrowRight' ||
      action === 'home' ||
      action === 'end'
    ) {
      return (
        <button
          className={`keycap keycap-utility ${getKeycapClass(label)} ${keyClassName}`.trim()}
          data-key-label={label}
          key={label}
          type="button"
          onClick={(event) => {
            if ((action === 'arrowLeft' || action === 'arrowRight') && event.detail !== 0) {
              return
            }

            dispatchNormalizedInputEvent({
              type: 'navigation',
              direction: action,
            })
            focusInputSurface()
          }}
          onPointerCancel={
            action === 'arrowLeft' || action === 'arrowRight' ? clearNavigationRepeat : undefined
          }
          onPointerDown={(event) => {
            preventVirtualKeyboardFocus(event)

            if (action === 'arrowLeft' || action === 'arrowRight') {
              handleVirtualNavigationPointerDown(action)
            }

            focusInputSurface()
          }}
          onPointerLeave={
            action === 'arrowLeft' || action === 'arrowRight' ? clearNavigationRepeat : undefined
          }
          onPointerUp={
            action === 'arrowLeft' || action === 'arrowRight' ? clearNavigationRepeat : undefined
          }
        >
          {renderKeyLabel(displayedLabel, keyClassName)}
        </button>
      )
    }

    if (typeof action === 'string') {
      return (
        <button
          className={`keycap ${getKeycapClass(label)} ${keyClassName}`.trim()}
          data-key-label={label}
          key={label}
          type="button"
          onClick={() => {
            dispatchNormalizedInputEvent({
              type: 'literal',
              text: action,
              visualKeyLabel: label,
              directText: action,
            })
            focusInputSurface()
          }}
          onPointerDown={preventVirtualKeyboardFocus}
        >
          {renderKeyLabel(displayedLabel, keyClassName)}
        </button>
      )
    }

    return (
      <button
        className={`keycap ${getKeycapClass(label)} ${keyClassName}`.trim()}
        data-key-label={label}
        key={label}
        type="button"
        onClick={() => {
          dispatchNormalizedInputEvent({
            type: 'symbol',
            symbolId: action,
            visualKeyLabel: label,
          })
          focusInputSurface()
        }}
        onPointerDown={preventVirtualKeyboardFocus}
      >
        {renderKeyLabel(displayedLabel, keyClassName)}
      </button>
    )
  }

  function toggleHelpSection(section: keyof typeof helpSections) {
    setHelpSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }))
  }

  const syllableCount = renderedUnits.length
  const decomposedCount = Array.from(renderedText).length
  const selectionLabel =
    selectionRange == null ? '없음' : `${selectionRange.start}-${selectionRange.end}`

  return (
    <>
      <main
        ref={rootRef}
        className="page-shell"
        onBeforeInput={handleBeforeInput}
        onBlur={handleEditorBlur}
        onCompositionEnd={handleCompositionEnd}
        onCompositionStart={handleCompositionStart}
        onCopy={handleCopy}
        onFocus={handleEditorFocus}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={handlePaste}
        onPointerCancel={handlePointerCancel}
        onPointerMoveCapture={handleEditorSurfacePointerMove}
        onPointerUp={() => {
          handleSelectionEnd()
          if (nativeKeyboardEnabled) {
            focusInputSurface()
          }
        }}
        tabIndex={0}
      >
        <textarea
          aria-hidden="true"
          autoCapitalize="off"
          autoCorrect="off"
          className="native-keyboard-proxy"
          defaultValue=""
          inputMode="text"
          onBeforeInput={handleBeforeInput}
          onBlur={handleEditorBlur}
          onCompositionEnd={handleCompositionEnd}
          onCompositionStart={handleCompositionStart}
          onFocus={handleEditorFocus}
          onInput={(event) => {
            event.currentTarget.value = ''
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onPaste={handlePaste}
          ref={nativeKeyboardRef}
          spellCheck={false}
          tabIndex={nativeKeyboardEnabled ? 0 : -1}
        />
        <header className="topnav">
          <div className="brand-copy brand-copy-with-logo">
            <img alt="옛한글 입력기 로고" className="topnav-logo" src="/yethangul-logo.png" />
            <strong>옛한글 입력기</strong>
            <span>현대 한글 자모 입력 방식만으로 옛한글을 조합하는 웹 입력기입니다.</span>
          </div>
        </header>

        <section className="workspace-grid" id="workspace">
          <div className="panel editor-panel">
            <div className="meta-row">
              <div className="meta-row-main">
                <span className="badge" data-testid="preferred-mode" data-mode={preferredMode}>
                  글자 수 {syllableCount} / {decomposedCount}
                </span>
                <span className="badge">선택 {selectionLabel}</span>
                <div className="toggle-group" role="tablist" aria-label="보기 전환">
                  <button
                    className={`toggle-chip ${renderMode === 'composed' ? 'toggle-chip-active' : ''}`}
                    type="button"
                    onClick={() => setRenderMode('composed')}
                  >
                    일반 보기
                  </button>
                  <button
                    className={`toggle-chip ${renderMode === 'decomposed' ? 'toggle-chip-active' : ''}`}
                    type="button"
                    onClick={() => setRenderMode('decomposed')}
                  >
                    분해 보기
                  </button>
                </div>
                <button
                  aria-label="전체 복사"
                  className="badge badge-button badge-icon-button"
                  type="button"
                  onClick={() => void copyAllText()}
                >
                  {renderCopyIcon('all')}
                </button>
                <button
                  aria-label="선택 복사"
                  className="badge badge-button badge-icon-button"
                  disabled={selectionRange == null}
                  type="button"
                  onClick={() => void copySelectionText()}
                >
                  {renderCopyIcon('selection')}
                </button>
              </div>
              <div className="meta-row-help">
                <button
                  aria-label="도움말 열기"
                  className="badge badge-button badge-help-button"
                  type="button"
                  onClick={() => setShowHelpOverlay(true)}
                >
                  {renderHelpIcon()}
                  <span>도움말</span>
                </button>
              </div>
            </div>

            <output className="sr-only" data-testid="rendered-text-value">
              {renderedText.length > 0 ? renderedText : '\u00A0'}
            </output>

            <div
              className="editor-output editor-surface"
              data-testid="editor-surface"
              style={editorSurfaceTouchBehavior}
            >
              {renderedUnits.length === 0 ? (
                <button
                  className="editor-boundary editor-boundary-root"
                  data-editor-boundary-index={0}
                  type="button"
                  onClick={() => {
                    handleCaretPlacement(0)
                    focusInputSurface()
                  }}
                  onPointerDown={(event) => event.preventDefault()}
                >
                  <span className={`caret ${renderedCaretIndex === 0 ? 'caret-visible' : ''}`} />
                  <span className="editor-placeholder">입력 결과가 여기에 표시됩니다.</span>
                </button>
              ) : (
                <>
                  <button
                    className="editor-boundary"
                    type="button"
                    onClick={() => {
                      handleCaretPlacement(0)
                      focusInputSurface()
                    }}
                    onPointerDown={(event) => event.preventDefault()}
                  >
                    <span className={`caret ${renderedCaretIndex === 0 ? 'caret-visible' : ''}`} />
                  </button>
                  {renderedUnits.map((unit: string, index: number) => {
                    const isSelected =
                      selectionRange != null &&
                      index >= selectionRange.start &&
                      index < selectionRange.end

                    if (unit === '\n') {
                      return (
                        <span
                          className={`editor-unit editor-unit-linebreak ${isSelected ? 'editor-unit-selected' : ''}`}
                          data-editor-unit-index={index}
                          key={`${unit}-${index}`}
                          onPointerDown={(event) => {
                            event.preventDefault()
                            handleSelectionStart(index)
                          }}
                          onPointerEnter={() => handleSelectionEnter(index)}
                          onPointerMove={() => handleSelectionEnter(index)}
                        >
                          <span aria-hidden="true" className="editor-linebreak">
                            <br />
                          </span>
                          <button
                            className="editor-boundary editor-boundary-linebreak"
                            data-editor-boundary-index={index + 1}
                            type="button"
                            onClick={() => {
                              handleCaretPlacement(index + 1)
                              focusInputSurface()
                            }}
                            onPointerDown={(event) => event.preventDefault()}
                          >
                            <span
                              className={`caret ${renderedCaretIndex === index + 1 ? 'caret-visible' : ''}`}
                            />
                          </button>
                        </span>
                      )
                    }

                    return (
                      <span
                        className={`editor-unit ${unit === '\n' ? 'editor-unit-linebreak' : ''} ${isSelected ? 'editor-unit-selected' : ''}`}
                        data-editor-unit-index={index}
                        key={`${unit}-${index}`}
                        onPointerDown={(event) => {
                          event.preventDefault()
                          handleSelectionStart(index)
                        }}
                        onPointerEnter={() => handleSelectionEnter(index)}
                        onPointerMove={() => handleSelectionEnter(index)}
                      >
                        {renderEditorUnit(unit)}
                        <button
                          className="editor-boundary"
                          data-editor-boundary-index={index + 1}
                          type="button"
                          onClick={() => {
                            handleCaretPlacement(index + 1)
                            focusInputSurface()
                          }}
                          onPointerDown={(event) => event.preventDefault()}
                        >
                          <span
                            className={`caret ${renderedCaretIndex === index + 1 ? 'caret-visible' : ''}`}
                          />
                        </button>
                      </span>
                    )
                  })}
                </>
              )}
            </div>
          </div>

          <aside className="panel control-panel">
            <div className="stack">
              <div className="keyboard-heading">
                <div>
                  <strong>Keyboard</strong>
                  <p>QWERTY 배열 기반의 키보드입니다.</p>
                </div>
                <button
                  aria-expanded={isKeyboardExpanded}
                  className="keyboard-toggle"
                  type="button"
                  onClick={() => setIsKeyboardExpanded((previous) => !previous)}
                >
                  <span aria-hidden="true">{isKeyboardExpanded ? '⌃' : '⌄'}</span>
                  <span>{isKeyboardExpanded ? '접기' : '펼치기'}</span>
                </button>
              </div>

              <div
                className={`keyboard-shell ${isKeyboardExpanded ? '' : 'keyboard-shell-collapsed'}`.trim()}
                data-testid="keyboard-shell"
                data-keyboard-expanded={isKeyboardExpanded}
              >
                {isKeyboardExpanded ? (
                  <>
                    <div className="keyboard-row keyboard-row-number" data-testid="keyboard-row-number">
                      {keyboardRows.number.map(([label, action]) =>
                        renderKeyboardAction(label, action),
                      )}
                    </div>

                    <div className="keyboard-row keyboard-row-1" data-testid="keyboard-row-1">
                      {keyboardRows.top.map(([label, action]) => renderKeyboardAction(label, action))}
                    </div>

                    <div className="keyboard-row keyboard-row-2" data-testid="keyboard-row-2">
                      {keyboardRows.middle.map(([label, action]) =>
                        renderKeyboardAction(label, action),
                      )}
                    </div>

                    <div className="keyboard-row keyboard-row-shift" data-testid="keyboard-row-shift">
                      {keyboardRows.bottom.map(([label, action]) =>
                        renderKeyboardAction(label, action),
                      )}
                    </div>

                    <div className="keyboard-row keyboard-row-bottom" data-testid="keyboard-row-bottom">
                      {keyboardRows.nav.map(([label, action]) =>
                        renderKeyboardAction(label, action),
                      )}
                    </div>
                  </>
                ) : (
                  <div className="keyboard-row keyboard-row-collapsed" data-testid="keyboard-row-collapsed">
                    {keyboardRows.compact.map(([label, action]) =>
                      renderKeyboardAction(label, action, 'keycap-compact'),
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>

        <footer className="footer">
          <a href={AUTHOR_URL} rel="noreferrer" target="_blank">
            @mathpaul3
          </a>
          <span>|</span>
          <a
            aria-label="YetHangul GitHub repository"
            className="footer-repo-link"
            href={REPOSITORY_URL}
            rel="noreferrer"
            target="_blank"
          >
            <svg aria-hidden="true" className="github-mark" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.5 0-.24-.01-1.03-.01-1.87-2.78.62-3.37-1.21-3.37-1.21-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.58 2.35 1.13 2.92.87.09-.67.35-1.13.64-1.39-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.33 9.33 0 0 1 12 6.84c.85 0 1.7.12 2.49.36 1.9-1.33 2.74-1.05 2.74-1.05.56 1.42.21 2.47.11 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.33 4.8-4.56 5.06.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.84 0 .28.18.6.69.5A10.25 10.25 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <span>|</span>
          <span>Apache-2.0 License</span>
          <span>|</span>
          <span>{`v${APP_VERSION}`}</span>
        </footer>
      </main>

      {copyFeedback ? <div className="copy-toast">{copyFeedback}</div> : null}

      {showHelpOverlay ? (
        <div className="modal-backdrop" role="presentation" onClick={closeHelpOverlay}>
          <div
            aria-labelledby="help-overlay-title"
            aria-modal="true"
            className="rule-modal help-overlay"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="rule-modal-header">
              <strong id="help-overlay-title">입력 도움말</strong>
              <button className="rule-modal-close" type="button" onClick={closeHelpOverlay}>
                닫기
              </button>
            </div>
            <div className="help-overlay-body">
              <section className="help-section">
                <button
                  className="help-accordion"
                  type="button"
                  onClick={() => toggleHelpSection('principles')}
                >
                  <strong>병서 원리 기반으로 초성·중성·종성을 순차 조합</strong>
                  <span>{helpSections.principles ? '접기' : '예시 보기'}</span>
                </button>
                <div className={`help-accordion-panel ${helpSections.principles ? 'help-accordion-panel-open' : ''}`}>
                  <div className="help-accordion-panel-inner">
                    <p className="help-description">현대 한글처럼 자모를 순서대로 입력하면 조합 가능한 음절로 자동 승격합니다.</p>
                    <div className="help-example-surface">
                      <strong className="help-example-title">예시</strong>
                      <ul className="help-example-list">
                        <li><code>ㅂ + ㅅ + ㄱ + ㅜ + ㄹ</code> → <code>ᄢᅮᆯ</code></li>
                        <li><code>ㄱ + ㅠ + ㅏ + ㄴ</code> → <code>ᄀᆎᆫ</code></li>
                        <li><code>ㅌ + ㅣ + ㅑ + ㄴ</code> → <code>ᄐᆙᆫ</code></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="help-section">
                <button
                  className="help-accordion"
                  type="button"
                  onClick={() => toggleHelpSection('shift')}
                >
                  <strong>Shift + 문자 = 쌍자모</strong>
                  <span>{helpSections.shift ? '접기' : '전체 보기'}</span>
                </button>
                <div className={`help-accordion-panel ${helpSections.shift ? 'help-accordion-panel-open' : ''}`}>
                  <div className="help-accordion-panel-inner">
                    <p className="help-description">Shift를 사용해 기본 자모를 쌍자음·쌍모음 계열로 확장합니다.</p>
                    <div className="rule-table-wrap">
                      <table className="rule-table">
                        <thead>
                          <tr>
                            <th>입력</th>
                            <th>출력</th>
                            <th>설명</th>
                          </tr>
                        </thead>
                        <tbody>
                          {SHIFT_RULES.map(([input, output, description]) => (
                            <tr key={input}>
                              <td>{input}</td>
                              <td>{output}</td>
                              <td>{description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              <section className="help-section">
                <button
                  className="help-accordion"
                  type="button"
                  onClick={() => toggleHelpSection('ctrl')}
                >
                  <strong>Ctrl + 문자 = 자형 변환 (반치음은 Shift 예외)</strong>
                  <span>{helpSections.ctrl ? '접기' : '전체 보기'}</span>
                </button>
                <div className={`help-accordion-panel ${helpSections.ctrl ? 'help-accordion-panel-open' : ''}`}>
                  <div className="help-accordion-panel-inner">
                    <p className="help-description">Ctrl을 사용해 치두음, 아래아, 방점, 채움문자 등 자형 변환을 적용합니다.</p>
                    <div className="rule-table-wrap">
                      <table className="rule-table">
                        <thead>
                          <tr>
                            <th>입력</th>
                            <th>출력</th>
                            <th>설명</th>
                          </tr>
                        </thead>
                        <tbody>
                          {CTRL_RULES.map(([input, output, description]) => (
                            <tr className={input === 'Shift + ㅊ' ? 'rule-row-highlight' : ''} key={input}>
                              <td>{input}</td>
                              <td>{output}</td>
                              <td>{description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
