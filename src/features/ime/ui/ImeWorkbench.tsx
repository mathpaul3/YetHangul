import { useRef, useState } from 'react'
import { INPUT_SYMBOL_IDS } from '@/engine/tables/inputSymbolTable'
import { YetHangulLogo } from '@/features/branding/YetHangulLogo'
import { useImeWorkbench } from '@/features/ime/hooks/useImeWorkbench'
import { getEditorSurfaceTouchBehavior } from '@/features/ime/services/editorSurface'
import { detectPreferredKeyboardMode } from '@/features/ime/services/keyboardMode'

const preferredMode = detectPreferredKeyboardMode()
const REPOSITORY_URL = 'https://github.com/mathpaul3/yet-hangul'
const VERSION = '0.1.0'
const LICENSE = 'Apache-2.0'

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
    ['Enter', 'enter'],
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
    [';', 'semicolon'],
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
  const editorSurfaceTouchBehavior = getEditorSurfaceTouchBehavior()
  const {
    engineState,
    hardwareModifierState,
    pressedVisualKeys,
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
    if (unit === '\n') {
      return (
        <span aria-hidden="true" className="editor-linebreak">
          <br />
        </span>
      )
    }

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

  const characterCount = Array.from(renderedText).length
  const selectionLabel =
    selectionRange == null ? '없음' : `${selectionRange.start}-${selectionRange.end}`

  return (
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
      <header className="topnav panel">
        <a aria-label="YetHangul 홈" className="brand-link" href="#workspace">
          <YetHangulLogo compact />
          <div className="brand-copy">
            <strong>YetHangul</strong>
            <span>옛한글 입력기, 이후 중세국어 사전으로 확장 예정</span>
          </div>
        </a>
        <nav aria-label="서비스 탐색" className="topnav-links">
          <a href="#workspace">입력기</a>
          <a href="#service-notes">원칙</a>
          <span className="topnav-pill">사전 확장 준비중</span>
        </nav>
      </header>

      <section className="workspace-grid" id="workspace">
        <div className="panel editor-panel">
          <div className="meta-row">
            <span className="badge" data-testid="preferred-mode" data-mode={preferredMode}>
              글자 수 {characterCount}
            </span>
            <span className="badge">선택 {selectionLabel}</span>
            <button
              className={`badge badge-button ${renderMode === 'composed' ? 'badge-active' : ''}`}
              type="button"
              onClick={() => setRenderMode('composed')}
            >
              일반 보기
            </button>
            <button
              className={`badge badge-button ${renderMode === 'decomposed' ? 'badge-active' : ''}`}
              type="button"
              onClick={() => setRenderMode('decomposed')}
            >
              분해 보기
            </button>
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
                <strong>{preferredMode === 'onscreen' ? 'Mobile keyboard' : 'QWERTY layout'}</strong>
                <p>하드웨어와 같은 순서로 배열한 60% 기준 자판입니다.</p>
              </div>
              <YetHangulLogo />
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
                        {label}
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
                      {label}
                    </button>
                  )
                })}
              </div>

              <div className="keyboard-row keyboard-row-1" data-testid="keyboard-row-1">
                {keyboardRows.top.map(([label, action]) => (
                  <button
                    className={`keycap ${getKeycapClass(label)}`}
                    data-key-label={label}
                    key={label}
                    type="button"
                    onClick={() => {
                      handleInput(action, label)
                      restoreEditorFocus()
                    }}
                    onPointerDown={preventVirtualKeyboardFocus}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="keyboard-row keyboard-row-2" data-testid="keyboard-row-2">
                {keyboardRows.middle.map(([label, action]) => {
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
                        {label}
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
                      {label}
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
                        {label}
                      </button>
                    )
                  }

                  if (action === 'period' || action === 'semicolon') {
                    return (
                      <button
                        className={`keycap keycap-utility ${getKeycapClass(label)}`}
                        data-key-label={label}
                        key={label}
                        type="button"
                        onClick={() => {
                          handleUtilityInput(action)
                          restoreEditorFocus()
                        }}
                        onPointerDown={preventVirtualKeyboardFocus}
                      >
                        {label}
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
                      {label}
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
                        {label}
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
                        {label}
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
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="panel info-panel" id="service-notes">
        <div className="notes-grid">
          <div className="stack">
            <strong>기반 원칙</strong>
            <div className="note-card">병서 원리 기반으로 초성·중성·종성을 순차 조합합니다.</div>
            <div className="note-card">Shift + 문자는 정의된 전체 쌍자모 table에 따라 승격합니다.</div>
            <div className="note-card">Ctrl + 문자는 정의된 전체 자형 변환 table에 따라 바뀝니다.</div>
          </div>
          <div className="stack">
            <strong>부가 기능</strong>
            <div className="note-card">Shift / Ctrl은 `none → oneshot → locked` 순서로 고정할 수 있습니다.</div>
            <div className="note-card">일반 보기와 분해 보기를 오가며 결과를 바로 확인할 수 있습니다.</div>
            <div className="note-card">입력 단계 기준 undo, 선택 복사, 줄 단위 편집을 함께 지원합니다.</div>
          </div>
        </div>
      </section>

      <footer className="footer panel">
        <div className="footer-row">
          <a href={REPOSITORY_URL} rel="noreferrer" target="_blank">
            GitHub
          </a>
          <span>개선 사항 / 문의 사항은 Issue로 남겨주세요.</span>
        </div>
        <div className="footer-row footer-row-secondary">
          <span>Made by mathpaul3</span>
          <span>Version {VERSION}</span>
          <span>License {LICENSE}</span>
        </div>
      </footer>
    </main>
  )
}
