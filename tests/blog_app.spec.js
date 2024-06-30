const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174')
  })

  test('Login form is shown', async ({ page }) => {
    const loginForm = page.locator('form')
    const username = loginForm.getByPlaceholder('Username')
    const password = loginForm.getByPlaceholder('password')
    const submitBtn = loginForm.getByRole('button', { name: 'Login'})

    await expect(loginForm).toBeVisible()
    await expect(username).toBeVisible()
    await expect(password).toBeVisible()
    await expect(submitBtn).toBeVisible()
  })
})