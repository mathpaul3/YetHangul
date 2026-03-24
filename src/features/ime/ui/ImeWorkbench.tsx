import { useEffect, useRef, useState } from 'react'
import { INPUT_SYMBOL_IDS } from '@/engine/tables/inputSymbolTable'
import { useImeWorkbench } from '@/features/ime/hooks/useImeWorkbench'
import { getEditorSurfaceTouchBehavior } from '@/features/ime/services/editorSurface'
import { detectPreferredKeyboardMode } from '@/features/ime/services/keyboardMode'

const preferredMode = detectPreferredKeyboardMode()
const REPOSITORY_URL = 'https://github.com/mathpaul3/yet-hangul'
const AUTHOR_URL = 'https://github.com/mathpaul3'
const HELP_OVERLAY_DISMISSED_KEY = 'yethangul-help-overlay-dismissed'
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
} as const

const modifierLabels = {
  leftCtrl: 'L Ctrl',
  rightCtrl: 'R Ctrl',
  leftShift: 'L Shift',
  rightShift: 'R Shift',
} as const

export function ImeWorkbench() {
  const rootRef = useRef<HTMLElement | null>(null)
  const [renderMode, setRenderMode] = useState<'composed' | 'decomposed'>('composed')
  const [showHelpOverlay, setShowHelpOverlay] = useState(false)
  const [helpSections, setHelpSections] = useState({
    principles: true,
    shift: true,
    ctrl: true,
  })
  const editorSurfaceTouchBehavior = getEditorSurfaceTouchBehavior()
  const {
    engineState,
    hardwareModifierState,
    pressedVisualKeys,
    copyFeedback,
    renderedUnits,
    renderedCaretIndex,
    renderedText,
    selectionRange,
    handleInput,
    handleVirtualBackspacePointerDown,
    clearBackspaceRepeat,
    handleVirtualNavigationPointerDown,
    clearNavigationRepeat,
    handleLiteralInput,
    handleUtilityInput,
    handleNavigationInput,
    handleModifierMainClick,
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

  function renderEditorUnit(unit: string) {
    if (renderMode === 'decomposed') {
      return <span className="editor-decomposed-unit">{Array.from(unit).join(' ')}</span>
    }

    return unit
  }

  function preventVirtualKeyboardFocus(event: React.PointerEvent<HTMLElement>) {
    event.preventDefault()
  }

  function restoreEditorFocus() {
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

  function renderKeyLabel(label: string) {
    const iconMap: Record<string, string> = {
      Backspace: '⌫',
      Enter: '↵',
      'L Shift': '⇧',
      'R Shift': '⇧',
    }

    return iconMap[label] ?? label
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
        onPointerUp={handleSelectionEnd}
        tabIndex={0}
      >
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
              <button
                aria-label="도움말 열기"
                className="badge badge-button"
                type="button"
                onClick={() => setShowHelpOverlay(true)}
              >
                도움말
              </button>
            </div>

            {copyFeedback ? <div className="copy-toast">{copyFeedback}</div> : null}

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
                  onClick={() => handleCaretPlacement(0)}
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
                    onClick={() => handleCaretPlacement(0)}
                    onPointerDown={(event) => event.preventDefault()}
                  >
                    <span className={`caret ${renderedCaretIndex === 0 ? 'caret-visible' : ''}`} />
                  </button>
                  {renderedUnits.map((unit, index) => {
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
                            onClick={() => handleCaretPlacement(index + 1)}
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
                          onClick={() => handleCaretPlacement(index + 1)}
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
              </div>

              <div className="keyboard-shell" data-testid="keyboard-shell">
                <div className="keyboard-row keyboard-row-number" data-testid="keyboard-row-number">
                  {keyboardRows.number.map(([label, action]) => {
                    if (action === 'backspace') {
                      return (
                        <button
                          className={`keycap keycap-utility keycap-backspace ${getKeycapClass(label)}`}
                          data-key-label={label}
                          key={label}
                          type="button"
                          onPointerCancel={clearBackspaceRepeat}
                          onPointerDown={(event) => {
                            preventVirtualKeyboardFocus(event)
                            handleVirtualBackspacePointerDown()
                            restoreEditorFocus()
                          }}
                          onPointerLeave={clearBackspaceRepeat}
                          onPointerUp={clearBackspaceRepeat}
                        >
                          {renderKeyLabel(label)}
                        </button>
                      )
                    }

                    return (
                      <button
                        className={`keycap ${getKeycapClass(label)}`}
                        data-key-label={label}
                        key={label}
                        type="button"
                        onClick={() => {
                          handleLiteralInput(action, label)
                          restoreEditorFocus()
                        }}
                        onPointerDown={preventVirtualKeyboardFocus}
                      >
                        {renderKeyLabel(label)}
                      </button>
                    )
                  })}
                </div>

                <div className="keyboard-row keyboard-row-1" data-testid="keyboard-row-1">
                  {keyboardRows.top.map(([label, action]) => {
                    if (action === 'enter') {
                      return (
                        <button
                          className={`keycap keycap-utility keycap-enter ${getKeycapClass(label)}`}
                          data-key-label={label}
                          key={label}
                          type="button"
                          onClick={() => {
                            handleUtilityInput('enter')
                            restoreEditorFocus()
                          }}
                          onPointerDown={preventVirtualKeyboardFocus}
                        >
                          {renderKeyLabel(label)}
                        </button>
                      )
                    }

                    return (
                      <button
                        className={`keycap ${getKeycapClass(label)}`}
                        data-key-label={label}
                        key={label}
                        type="button"
                        onClick={() => {
                          handleInput(action as number, label)
                          restoreEditorFocus()
                        }}
                        onPointerDown={preventVirtualKeyboardFocus}
                      >
                        {renderKeyLabel(label)}
                      </button>
                    )
                  })}
                </div>

                <div className="keyboard-row keyboard-row-2" data-testid="keyboard-row-2">
                  {keyboardRows.middle.map(([label, action]) => {
                    if (action === 'semicolon') {
                      return (
                        <button
                          className={`keycap keycap-utility ${getKeycapClass(label)}`}
                          data-key-label={label}
                          key={label}
                          type="button"
                          onClick={() => {
                            handleUtilityInput('semicolon')
                            restoreEditorFocus()
                          }}
                          onPointerDown={preventVirtualKeyboardFocus}
                        >
                          {renderKeyLabel(label)}
                        </button>
                      )
                    }

                    return (
                      <button
                        className={`keycap ${getKeycapClass(label)}`}
                        data-key-label={label}
                        key={label}
                        type="button"
                        onClick={() => {
                          handleInput(action as number, label)
                          restoreEditorFocus()
                        }}
                        onPointerDown={preventVirtualKeyboardFocus}
                      >
                        {renderKeyLabel(label)}
                      </button>
                    )
                  })}
                </div>

                <div className="keyboard-row keyboard-row-shift" data-testid="keyboard-row-shift">
                  {keyboardRows.bottom.map(([label, action]) => {
                    if (action === 'leftShift' || action === 'rightShift') {
                      return (
                        <button
                          className={`keycap keycap-utility keycap-modifier ${getModifierVisualClass(action)} ${getKeycapClass(label)}`}
                          data-key-label={label}
                          data-modifier-key={action}
                          data-modifier-mode={engineState.modifierState[action]}
                          key={label}
                          type="button"
                          onClick={() => {
                            handleModifierMainClick(action)
                            restoreEditorFocus()
                          }}
                          onPointerDown={preventVirtualKeyboardFocus}
                        >
                          {renderKeyLabel(label)}
                        </button>
                      )
                    }

                    if (action === 'period') {
                      return (
                        <button
                          className={`keycap keycap-utility ${getKeycapClass(label)}`}
                          data-key-label={label}
                          key={label}
                          type="button"
                          onClick={() => {
                            handleUtilityInput('period')
                            restoreEditorFocus()
                          }}
                        onPointerDown={preventVirtualKeyboardFocus}
                      >
                          {renderKeyLabel(label)}
                        </button>
                      )
                    }

                    return (
                      <button
                        className={`keycap ${getKeycapClass(label)}`}
                        data-key-label={label}
                        key={label}
                        type="button"
                        onClick={() => {
                          handleInput(action as number, label)
                          restoreEditorFocus()
                        }}
                        onPointerDown={preventVirtualKeyboardFocus}
                      >
                        {renderKeyLabel(label)}
                      </button>
                    )
                  })}
                </div>

                <div className="keyboard-row keyboard-row-bottom" data-testid="keyboard-row-bottom">
                  {keyboardRows.nav.map(([label, action]) => {
                    if (action === 'leftCtrl' || action === 'rightCtrl') {
                      return (
                        <button
                          className={`keycap keycap-utility keycap-modifier ${getModifierVisualClass(action)} ${getKeycapClass(label)}`}
                          data-key-label={label}
                          data-modifier-key={action}
                          data-modifier-mode={engineState.modifierState[action]}
                          key={label}
                          type="button"
                          onClick={() => {
                            handleModifierMainClick(action)
                            restoreEditorFocus()
                          }}
                          onPointerDown={preventVirtualKeyboardFocus}
                        >
                          {renderKeyLabel(label)}
                        </button>
                      )
                    }

                    if (action === 'space') {
                      return (
                        <button
                          className={`keycap keycap-utility keycap-space ${getKeycapClass(label)}`}
                          data-key-label={label}
                          key={label}
                          type="button"
                          onClick={() => {
                            handleUtilityInput('space')
                            restoreEditorFocus()
                          }}
                          onPointerDown={preventVirtualKeyboardFocus}
                        >
                          {renderKeyLabel(label)}
                        </button>
                      )
                    }

                    return (
                      <button
                        className={`keycap keycap-utility ${getKeycapClass(label)}`}
                        data-key-label={label}
                        key={label}
                        type="button"
                        onClick={(event) => {
                          if ((action === 'arrowLeft' || action === 'arrowRight') && event.detail !== 0) {
                            return
                          }

                          handleNavigationInput(action as 'arrowLeft' | 'arrowRight' | 'home' | 'end')
                          restoreEditorFocus()
                        }}
                        onPointerCancel={
                          action === 'arrowLeft' || action === 'arrowRight'
                            ? clearNavigationRepeat
                            : undefined
                        }
                        onPointerDown={(event) => {
                          preventVirtualKeyboardFocus(event)

                          if (action === 'arrowLeft' || action === 'arrowRight') {
                            handleVirtualNavigationPointerDown(action)
                          }

                          restoreEditorFocus()
                        }}
                        onPointerLeave={
                          action === 'arrowLeft' || action === 'arrowRight'
                            ? clearNavigationRepeat
                            : undefined
                        }
                        onPointerUp={
                          action === 'arrowLeft' || action === 'arrowRight'
                            ? clearNavigationRepeat
                            : undefined
                        }
                      >
                        {renderKeyLabel(label)}
                      </button>
                    )
                  })}
                </div>
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
        </footer>
      </main>

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
                {helpSections.principles ? (
                  <div className="help-principles">
                    <div className="note-card">현대 한글처럼 자모를 순서대로 입력하면 조합 가능한 음절로 자동 승격합니다.</div>
                    <div className="note-card">예: `ㅂ + ㅅ + ㄱ + ㅜ + ㄹ → ᄢᅮᆯ`</div>
                    <div className="note-card">예: `ㄱ + ㅠ + ㅏ + ㄴ → ᄀᆎᆫ`</div>
                  </div>
                ) : null}
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
                {helpSections.shift ? (
                  <>
                    <p className="rule-modal-description">Shift + 자음/모음 ⇨ 쌍자음/쌍모음</p>
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
                  </>
                ) : null}
              </section>

              <section className="help-section">
                <button
                  className="help-accordion"
                  type="button"
                  onClick={() => toggleHelpSection('ctrl')}
                >
                  <strong>Ctrl + 문자 = 자형 변환</strong>
                  <span>{helpSections.ctrl ? '접기' : '전체 보기'}</span>
                </button>
                {helpSections.ctrl ? (
                  <>
                    <p className="rule-modal-description">Ctrl + 자음/모음 ⇨ 자형 변환 (반치음ᅀ 예외)</p>
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
                            <tr key={input}>
                              <td>{input}</td>
                              <td>{output}</td>
                              <td>{description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : null}
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
