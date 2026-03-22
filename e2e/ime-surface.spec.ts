import { expect, test } from '@playwright/test'

const desktopProjects = new Set(['chromium-desktop'])
const mobileProjects = new Set(['mobile-chromium', 'mobile-small-chromium'])

async function clickKey(page: Parameters<typeof test>[0]['page'], label: string) {
  await page.locator(`[data-key-label="${label}"]`).first().click()
}

async function expectRenderedText(page: Parameters<typeof test>[0]['page'], text: string) {
  await expect(page.getByTestId('rendered-text-value')).toHaveText(text)
}

test('preferred mode matches project surface expectations', async ({ page }, testInfo) => {
  await page.goto('/')

  const mode = await page.getByTestId('preferred-mode').getAttribute('data-mode')

  if (desktopProjects.has(testInfo.project.name)) {
    await expect(page.getByTestId('preferred-mode')).toContainText('hardware')
    await expect(mode).toBe('hardware')
    return
  }

  if (testInfo.project.name === 'tablet-chromium') {
    await expect(page.getByTestId('preferred-mode')).toContainText('auto')
    await expect(mode).toBe('auto')
    return
  }

  if (mobileProjects.has(testInfo.project.name)) {
    await expect(page.getByTestId('preferred-mode')).toContainText('onscreen')
    await expect(mode).toBe('onscreen')
  }
})

test('mobile surfaces keep stable rows and visible compact state feedback', async ({ page }, testInfo) => {
  test.skip(!mobileProjects.has(testInfo.project.name))

  await page.goto('/')

  await expect(page.getByTestId('keyboard-row-number')).toBeVisible()
  await expect(page.getByTestId('keyboard-row-1')).toBeVisible()
  await expect(page.getByTestId('keyboard-row-2')).toBeVisible()
  await expect(page.getByTestId('keyboard-row-shift')).toBeVisible()
  await expect(page.getByTestId('keyboard-row-bottom')).toBeVisible()
  await expect(page.locator('.compact-state-rail')).toBeVisible()

  for (const label of ['L Shift', 'ㅋ', 'ㅠ', 'L Ctrl', 'Space', 'Enter', 'Backspace']) {
    await expect(page.locator(`[data-key-label="${label}"]`).first()).toBeVisible()
  }
})

test('on-screen keyboard keeps parity for modifier cycle, composition, enter, and delete', async ({ page }) => {
  await page.goto('/')

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

  await page.goto('/')

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
  await page.goto('/')

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
