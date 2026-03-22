import { useRef } from 'react'
import { INPUT_SYMBOL_IDS } from '@/engine/tables/inputSymbolTable'
import { detectPreferredKeyboardMode } from '@/features/ime/services/keyboardMode'
import { useImeWorkbench } from '@/features/ime/hooks/useImeWorkbench'

const preferredMode = detectPreferredKeyboardMode()
const numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const
const keyboardRows = [
  [
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
  [
    ['ㅁ', INPUT_SYMBOL_IDS.MIEUM],
    ['ㄴ', INPUT_SYMBOL_IDS.NIEUN],
    ['ㅇ', INPUT_SYMBOL_IDS.IEUNG],
    ['ㄹ', INPUT_SYMBOL_IDS.RIEUL],
    ['ㅎ', INPUT_SYMBOL_IDS.HIEUH],
    ['ㅗ', INPUT_SYMBOL_IDS.O],
    ['ㅓ', INPUT_SYMBOL_IDS.EO],
    ['ㅏ', INPUT_SYMBOL_IDS.A],
    ['ㅣ', INPUT_SYMBOL_IDS.I],
  ],
] as const

const keyboardUtilityRows = {
  shift: [
    ['L Shift', 'leftShift'],
    ['ㅋ', INPUT_SYMBOL_IDS.KHIEUKH],
    ['ㅌ', INPUT_SYMBOL_IDS.THIEUTH],
    ['ㅊ', INPUT_SYMBOL_IDS.CHIEUCH],
    ['ㅍ', INPUT_SYMBOL_IDS.PHIEUPH],
    ['ㅠ', INPUT_SYMBOL_IDS.YU],
    ['ㅜ', INPUT_SYMBOL_IDS.U],
    ['ㅡ', INPUT_SYMBOL_IDS.EU],
    ['R Shift', 'rightShift'],
  ],
  bottom: [
    ['L Ctrl', 'leftCtrl'],
    ['R Ctrl', 'rightCtrl'],
    ['Space', 'space'],
    ['.', 'period'],
    [';', 'semicolon'],
    ['Enter', 'enter'],
    ['Backspace', 'backspace'],
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
  const {
    engineState,
    hardwareModifierState,
    pressedVisualKeys,
    renderedUnits,
    renderedCaretIndex,
    selectionRange,
    handleInput,
    handleVirtualBackspacePointerDown,
    clearBackspaceRepeat,
    handleLiteralInput,
    handleUtilityInput,
    handleModifierMainClick,
    handleCaretPlacement,
    handleSelectionEnd,
    handleSelectionEnter,
    handleSelectionStart,
    handleKeyDown,
    handleKeyUp,
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

  function preventVirtualKeyboardFocus(event: React.PointerEvent<HTMLElement>) {
    event.preventDefault()
  }

  function restoreEditorFocus() {
    rootRef.current?.focus()
  }

  return (
    <main
      ref={rootRef}
      className="page-shell"
      onPointerUp={handleSelectionEnd}
      onPointerCancel={handleSelectionEnd}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={handleEditorBlur}
      onCopy={handleCopy}
      onPaste={handlePaste}
      onBeforeInput={handleBeforeInput}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      tabIndex={0}
    >
      <section className="hero">
        <h1>YetHangul</h1>
        <p>
          현대 한글 자모 규칙을 바탕으로 옛한글을 입력하는 웹 입력기입니다.
          입력 엔진은 FSM, sparse transition table, undo log를 중심으로 구성합니다.
        </p>
      </section>

      <section className="workspace-grid">
        <div className="panel editor-panel">
          <div className="meta-row">
            <span className="badge">Preferred mode: {preferredMode}</span>
            <span className="badge">Units: {renderedUnits.length}</span>
            <span className="badge">Active state: {engineState.active.stateId}</span>
            <span className="badge">Undo depth: {engineState.undoStack.length}</span>
            <button className="badge badge-button" type="button" onClick={() => void copyAllText()}>
              Copy All
            </button>
            <button
              className="badge badge-button"
              disabled={selectionRange == null}
              type="button"
              onClick={() => void copySelectionText()}
            >
              Copy Selection
            </button>
          </div>
          <div className="editor-output editor-surface">
            {renderedUnits.length === 0 ? (
              <button
                className="editor-boundary editor-boundary-root"
                type="button"
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => handleCaretPlacement(0)}
              >
                <span className={`caret ${renderedCaretIndex === 0 ? 'caret-visible' : ''}`} />
                <span className="editor-placeholder">입력 결과가 여기에 표시됩니다.</span>
              </button>
            ) : (
              <>
                <button
                  className="editor-boundary"
                  type="button"
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => handleCaretPlacement(0)}
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
                      key={`${unit}-${index}`}
                      onPointerDown={(event) => {
                        event.preventDefault()
                        handleSelectionStart(index)
                      }}
                      onPointerEnter={() => handleSelectionEnter(index)}
                    >
                      {unit === '\n' ? <span className="editor-linebreak" aria-hidden="true"><br /></span> : unit}
                      <button
                        className="editor-boundary"
                        type="button"
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={() => handleCaretPlacement(index + 1)}
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
            <strong>{preferredMode === 'onscreen' ? 'Mobile keyboard' : 'QWERTY layout'}</strong>
            <div className="keyboard-shell">
              <div className="keyboard-row keyboard-row-number">
                {numberRow.map((digit) => (
                  <button
                    className={`keycap ${getKeycapClass(digit)}`}
                    key={digit}
                    type="button"
                    onPointerDown={preventVirtualKeyboardFocus}
                    onClick={() => {
                      handleLiteralInput(digit, digit)
                      restoreEditorFocus()
                    }}
                  >
                    {digit}
                  </button>
                ))}
              </div>
              {keyboardRows.map((row, rowIndex) => (
                <div className={`keyboard-row keyboard-row-${rowIndex + 1}`} key={rowIndex}>
                  {row.map(([label, symbolId]) => (
                    <button
                      className={`keycap ${getKeycapClass(label)}`}
                      key={label}
                      type="button"
                      onPointerDown={preventVirtualKeyboardFocus}
                      onClick={() => {
                        handleInput(symbolId, label)
                        restoreEditorFocus()
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ))}
              <div className="keyboard-row keyboard-row-shift">
                {keyboardUtilityRows.shift.map(([label, action]) => {
                  if (action === 'leftShift' || action === 'rightShift') {
                    return (
                      <div
                        className={`keycap-cluster ${getModifierVisualClass(action)} ${getKeycapClass(label)}`}
                        key={label}
                      >
                        <button
                          className="keycap-cluster-main"
                          type="button"
                          onPointerDown={preventVirtualKeyboardFocus}
                          onClick={() => {
                            handleModifierMainClick(action)
                            restoreEditorFocus()
                          }}
                        >
                          {label}
                        </button>
                      </div>
                    )
                  }

                  return (
                    <button
                      className={`keycap ${getKeycapClass(label)}`}
                      key={label}
                      type="button"
                      onPointerDown={preventVirtualKeyboardFocus}
                      onClick={() => {
                        handleInput(action, label)
                        restoreEditorFocus()
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <div className="keyboard-row keyboard-row-bottom">
                {keyboardUtilityRows.bottom.map(([label, action]) => {
                  if (action === 'leftCtrl' || action === 'rightCtrl') {
                    return (
                      <div
                        className={`keycap-cluster ${getModifierVisualClass(action)} ${getKeycapClass(label)}`}
                        key={label}
                      >
                        <button
                          className="keycap-cluster-main"
                          type="button"
                          onPointerDown={preventVirtualKeyboardFocus}
                          onClick={() => {
                            handleModifierMainClick(action)
                            restoreEditorFocus()
                          }}
                        >
                          {label}
                        </button>
                      </div>
                    )
                  }

                  if (
                    action === 'space' ||
                    action === 'period' ||
                    action === 'semicolon' ||
                    action === 'enter'
                  ) {
                    return (
                      <button
                        className={`keycap keycap-utility keycap-${action} ${getKeycapClass(label)}`}
                        key={label}
                        type="button"
                        onPointerDown={preventVirtualKeyboardFocus}
                        onClick={() => {
                          handleUtilityInput(action)
                          restoreEditorFocus()
                        }}
                      >
                        {label}
                      </button>
                    )
                  }

                  return (
                    <button
                      className={`keycap keycap-utility ${getKeycapClass(label)}`}
                      key={label}
                      type="button"
                      onPointerDown={(event) => {
                        preventVirtualKeyboardFocus(event)
                        handleVirtualBackspacePointerDown()
                        restoreEditorFocus()
                      }}
                      onPointerUp={clearBackspaceRepeat}
                      onPointerCancel={clearBackspaceRepeat}
                      onPointerLeave={clearBackspaceRepeat}
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

      <section className="panel info-panel">
        <div className="stack">
          <strong>Service notes</strong>
          <div className="mono">
            committed + active jamo ids are rendered through the Unicode mapper.
          </div>
          <div className="mono">history: {engineState.active.inputHistory.join(', ') || 'empty'}</div>
          <div className="mono">
            paste support: compatibility jamo, conjoining jamo, modern precomposed hangul
          </div>
          <div className="mono">hardware utilities: Ctrl+Space, Ctrl+., Ctrl+;, Enter newline</div>
          <div>1. 일반 자모(ㄱ-ㅎ, ㅏ-ㅣ)만 직접 입력</div>
          <div>{'2. L/R Ctrl, L/R Shift는 키보드에서 none -> oneshot -> locked 순환'}</div>
          <div>3. 모바일도 modifier + Space / . / ; 방식 유지</div>
          <div>4. Input-step undo and local reparse</div>
        </div>
      </section>
    </main>
  )
}
