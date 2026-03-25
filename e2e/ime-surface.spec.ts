import { expect, test } from '@playwright/test'

const desktopProjects = new Set(['chromium-desktop'])
const mobileProjects = new Set(['mobile-chromium', 'mobile-small-chromium'])
const HELP_OVERLAY_DISMISSED_KEY = 'yethangul-help-overlay-dismissed'

async function gotoApp(page: Parameters<typeof test>[0]['page']) {
  await page.addInitScript((storageKey) => {
    window.localStorage.setItem(storageKey, 'true')
  }, HELP_OVERLAY_DISMISSED_KEY)
  await page.goto('/')
}

async function clickKey(page: Parameters<typeof test>[0]['page'], label: string) {
  await page.locator(`[data-key-label="${label}"]`).first().click()
}

async function ensureExpandedKeyboard(page: Parameters<typeof test>[0]['page']) {
  const keyboard = page.getByTestId('keyboard-shell')
  const expanded = await keyboard.getAttribute('data-keyboard-expanded')

  if (expanded !== 'true') {
    await page.getByRole('button', { name: /펼치기|접기/ }).click()
  }
}

async function expectRenderedText(page: Parameters<typeof test>[0]['page'], text: string) {
  await expect(page.getByTestId('rendered-text-value')).toHaveText(text)
}

async function dragEditorSelection(
  page: Parameters<typeof test>[0]['page'],
  startIndex: number,
  endIndex: number,
  pointerType: 'mouse' | 'touch',
) {
  await page.evaluate(
    ({ startIndex, endIndex, pointerType }) => {
      const startUnit = document.querySelector(`[data-editor-unit-index="${startIndex}"]`)
      const endUnit = document.querySelector(`[data-editor-unit-index="${endIndex}"]`)
      const surface = document.querySelector('[data-testid="editor-surface"]')

      if (!(startUnit instanceof HTMLElement) || !(endUnit instanceof HTMLElement) || !(surface instanceof HTMLElement)) {
        throw new Error('editor selection targets not found')
      }

      const init = {
        bubbles: true,
        pointerId: 1,
        pointerType,
        isPrimary: true,
        button: 0,
        buttons: 1,
      } satisfies PointerEventInit

      startUnit.dispatchEvent(new PointerEvent('pointerdown', init))
      endUnit.dispatchEvent(new PointerEvent('pointermove', init))
      endUnit.dispatchEvent(new PointerEvent('pointerenter', init))
      surface.dispatchEvent(new PointerEvent('pointerup', init))
    },
    { startIndex, endIndex, pointerType },
  )
}

test('preferred mode matches project surface expectations', async ({ page }, testInfo) => {
  await gotoApp(page)

  const mode = await page.getByTestId('preferred-mode').getAttribute('data-mode')

  if (desktopProjects.has(testInfo.project.name)) {
    await expect(mode).toBe('hardware')
    return
  }

  if (testInfo.project.name === 'tablet-chromium') {
    await expect(mode).toBe('auto')
    return
  }

  if (mobileProjects.has(testInfo.project.name)) {
    await expect(mode).toBe('onscreen')
  }
})

test('mobile surfaces keep stable rows and visible compact state feedback', async ({ page }, testInfo) => {
  test.skip(!mobileProjects.has(testInfo.project.name))

  await gotoApp(page)

  await expect(page.getByTestId('keyboard-row-collapsed')).toBeVisible()

  for (const label of ['L Shift', 'R Shift', 'L Ctrl', 'R Ctrl', 'Home', 'End', '←', '→']) {
    await expect(page.locator(`[data-key-label="${label}"]`).first()).toBeVisible()
  }

  await ensureExpandedKeyboard(page)

  await expect(page.getByTestId('keyboard-row-number')).toBeVisible()
  await expect(page.getByTestId('keyboard-row-1')).toBeVisible()
  await expect(page.getByTestId('keyboard-row-2')).toBeVisible()
  await expect(page.getByTestId('keyboard-row-shift')).toBeVisible()
  await expect(page.getByTestId('keyboard-row-bottom')).toBeVisible()

  for (const label of ['L Shift', 'ㅋ', 'ㅠ', 'L Ctrl', 'Space', 'Enter', 'Backspace']) {
    await expect(page.locator(`[data-key-label="${label}"]`).first()).toBeVisible()
  }
})

test('on-screen keyboard keeps parity for modifier cycle, composition, enter, and delete', async ({ page }) => {
  await gotoApp(page)
  await ensureExpandedKeyboard(page)

  const leftShift = page.locator('[data-modifier-key="leftShift"]').first()
  await expect(leftShift).toHaveAttribute('data-modifier-mode', 'off')
  await clickKey(page, 'L Shift')
  await expect(leftShift).toHaveAttribute('data-modifier-mode', 'oneshot')
  await clickKey(page, 'L Shift')
  await expect(leftShift).toHaveAttribute('data-modifier-mode', 'locked')
  await clickKey(page, 'L Shift')
  await expect(leftShift).toHaveAttribute('data-modifier-mode', 'off')

  await clickKey(page, 'ㅂ')
  await clickKey(page, 'ㅅ')
  await clickKey(page, 'ㄱ')
  await clickKey(page, 'ㅜ')
  await clickKey(page, 'ㄹ')
  await expectRenderedText(page, 'ᄢᅮᆯ')

  await clickKey(page, 'Enter')
  await expectRenderedText(page, 'ᄢᅮᆯ\n')

  await clickKey(page, 'Backspace')
  await expectRenderedText(page, 'ᄢᅮᆯ')
})

test('browser surface keeps composition and focus-regain enter flows aligned', async ({ page }, testInfo) => {
  test.skip(!desktopProjects.has(testInfo.project.name))

  await gotoApp(page)

  await page.locator('main').focus()
  await page.evaluate(() => {
    const root = document.querySelector('main')
    if (!(root instanceof HTMLElement)) {
      throw new Error('editor root not found')
    }

    root.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '간' }))
  })

  await page.locator('main').press('Enter')
  await page.locator('main').blur()
  await page.locator('main').focus()

  await page.evaluate(() => {
    const root = document.querySelector('main')
    if (!(root instanceof HTMLElement)) {
      throw new Error('editor root not found')
    }

    root.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '나' }))
  })

  await expectRenderedText(page, '간\n나')
})

test('editor surface keeps caret placement, replacement, and newline edits stable', async ({ page }) => {
  await gotoApp(page)
  await ensureExpandedKeyboard(page)

  await clickKey(page, 'ㄱ')
  await clickKey(page, 'ㅏ')
  await clickKey(page, 'ㄴ')
  await clickKey(page, 'Enter')
  await clickKey(page, 'ㄴ')
  await clickKey(page, 'ㅏ')
  await expectRenderedText(page, '간\n나')

  await page.locator('[data-editor-boundary-index="1"]').click()
  await clickKey(page, '1')
  await expectRenderedText(page, '간1\n나')

  const firstUnit = page.locator('[data-editor-unit-index="0"]')
  const secondUnit = page.locator('[data-editor-unit-index="1"]')
  await firstUnit.hover()
  await page.mouse.down()
  await secondUnit.hover()
  await page.mouse.up()
  await clickKey(page, '2')

  await expectRenderedText(page, '2\n나')
})

test('mixed paste keeps literal and supported text in original order', async ({ page }) => {
  await gotoApp(page)

  await page.locator('main').focus()
  await page.evaluate(() => {
    const root = document.querySelector('main')
    if (!(root instanceof HTMLElement)) {
      throw new Error('editor root not found')
    }

    const data = new DataTransfer()
    data.setData('text/plain', 'A간B')
    root.dispatchEvent(
      new ClipboardEvent('paste', {
        bubbles: true,
        clipboardData: data,
      }),
    )
  })

  await expectRenderedText(page, 'A간B')
})

test('mixed paste replaces the current selection through the same batch path', async ({ page }) => {
  await gotoApp(page)

  await page.locator('main').focus()
  await page.evaluate(() => {
    const root = document.querySelector('main')
    if (!(root instanceof HTMLElement)) {
      throw new Error('editor root not found')
    }

    root.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '간나' }))
  })

  const firstUnit = page.locator('[data-editor-unit-index="0"]')
  const secondUnit = page.locator('[data-editor-unit-index="1"]')
  await firstUnit.hover()
  await page.mouse.down()
  await secondUnit.hover()
  await page.mouse.up()

  await page.evaluate(() => {
    const root = document.querySelector('main')
    if (!(root instanceof HTMLElement)) {
      throw new Error('editor root not found')
    }

    const data = new DataTransfer()
    data.setData('text/plain', 'A간B')
    root.dispatchEvent(
      new ClipboardEvent('paste', {
        bubbles: true,
        clipboardData: data,
      }),
    )
  })

  await expectRenderedText(page, 'A간B')
})

test('desktop mixed sources keep mouse selection and onscreen replacement aligned', async ({ page }, testInfo) => {
  test.skip(!desktopProjects.has(testInfo.project.name))

  await gotoApp(page)
  await ensureExpandedKeyboard(page)

  await page.locator('main').focus()
  await page.evaluate(() => {
    const root = document.querySelector('main')
    if (!(root instanceof HTMLElement)) {
      throw new Error('editor root not found')
    }

    root.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '간나' }))
  })

  await expectRenderedText(page, '간나')

  await dragEditorSelection(page, 0, 1, 'mouse')

  await clickKey(page, '1')
  await expectRenderedText(page, '1')
})

test('mobile mixed sources keep touch selection, native composition, and onscreen delete aligned', async ({ page }, testInfo) => {
  test.skip(!mobileProjects.has(testInfo.project.name))

  await gotoApp(page)
  await ensureExpandedKeyboard(page)

  await page.locator('main').focus()
  await page.evaluate(() => {
    const root = document.querySelector('main')
    if (!(root instanceof HTMLElement)) {
      throw new Error('editor root not found')
    }

    root.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '간나' }))
  })

  await expectRenderedText(page, '간나')

  await dragEditorSelection(page, 0, 1, 'touch')

  await page.evaluate(() => {
    const root = document.querySelector('main')
    if (!(root instanceof HTMLElement)) {
      throw new Error('editor root not found')
    }

    root.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '다라' }))
  })

  await expectRenderedText(page, '다라')

  await clickKey(page, 'Backspace')
  await expectRenderedText(page, '다')
})

test('onscreen tone can be reapplied after backspace', async ({ page }) => {
  await gotoApp(page)
  await ensureExpandedKeyboard(page)

  await clickKey(page, 'ㄹ')
  await clickKey(page, 'ㅏ')
  await clickKey(page, 'ㅅ')
  await clickKey(page, 'L Ctrl')
  await clickKey(page, '.')
  await expectRenderedText(page, '랏〮')

  await clickKey(page, 'Backspace')
  await expectRenderedText(page, '랏')

  await clickKey(page, 'L Ctrl')
  await clickKey(page, '.')
  await expectRenderedText(page, '랏〮')
})

test('literal punctuation after a toned syllable only removes the punctuation on backspace', async ({ page }, testInfo) => {
  test.skip(!desktopProjects.has(testInfo.project.name))

  await gotoApp(page)
  await ensureExpandedKeyboard(page)

  await clickKey(page, 'ㄹ')
  await clickKey(page, 'ㅏ')
  await clickKey(page, 'L Ctrl')
  await clickKey(page, ';')
  await expectRenderedText(page, '라〯')

  await page.locator('main').focus()
  await page.keyboard.press('.')
  await expectRenderedText(page, '라〯.')

  await page.keyboard.press('Backspace')
  await expectRenderedText(page, '라〯')
})

test('onscreen ctrl and shift combinations do not duplicate sios output', async ({ page }) => {
  await gotoApp(page)
  await ensureExpandedKeyboard(page)

  await clickKey(page, 'L Ctrl')
  await clickKey(page, 'L Shift')
  await clickKey(page, 'ㅅ')
  await expectRenderedText(page, 'ᄽ')

  await clickKey(page, 'Backspace')
  await expectRenderedText(page, '')

  await clickKey(page, 'R Ctrl')
  await clickKey(page, 'R Shift')
  await clickKey(page, 'ㅅ')
  await expectRenderedText(page, 'ᄿ')
})

test('onscreen punctuation stays literal without ctrl and keycaps reflect active modifiers', async ({ page }) => {
  await gotoApp(page)
  await ensureExpandedKeyboard(page)

  await clickKey(page, '.')
  await expectRenderedText(page, '.')

  await clickKey(page, 'Backspace')
  await expectRenderedText(page, '')

  await clickKey(page, 'L Shift')
  await expect(page.locator('[data-key-label="ㅂ"]').first()).toHaveText('ᄈ')
  await expect(page.locator('[data-key-label="ㅅ"]').first()).toHaveText('ᄊ')
  await expect(page.locator('[data-key-label="ㅊ"]').first()).toHaveText('ᅀ')

  await clickKey(page, 'L Shift')
  await clickKey(page, 'L Shift')
  await clickKey(page, 'L Ctrl')
  await expect(page.locator('[data-key-label="ㅅ"]').first()).toHaveText('ᄼ')
  await expect(page.locator('[data-key-label="ㅈ"]').first()).toHaveText('ᅎ')

  await clickKey(page, 'L Shift')
  await expect(page.locator('[data-key-label="ㅅ"]').first()).toHaveText('ᄽ')
  await expect(page.locator('[data-key-label="ㅈ"]').first()).toHaveText('ᅏ')
})
