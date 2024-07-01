const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // empty testing db
    await request.post('/api/testing/reset')
    // create new user
    await request.post('/api/users', {
      data: {
        name: 'Mostafa Lotfy',
        username: 'mstflotfy',
        password: '123'
      }
    })
    // open app
    await page.goto('/')
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

  describe('login', () => {
    test('succeeds with correct credentials', async({page}) => {
      loginWith(page, 'mstflotfy', '123')
      await expect(page.getByText(`Hey, Mostafa Lotfy`)).toBeVisible()
      await expect(page.getByRole('button', { name: 'Log Out'})).toBeVisible()
    })

    test('no blogs intially', async ({ page }) => {
      loginWith(page, 'mstflotfy', '123')
      await expect(page.getByText(`Hey, Mostafa Lotfy`)).toBeVisible()
      await expect(page.getByRole('button', { name: 'Log Out'})).toBeVisible()
      await expect(page.getByRole('button', { name: 'view'})).not.toBeVisible()
    })

    test('fails with wrong credentials', async({page}) => {
      loginWith(page, 'mstflotfy', 'wrong')
      await expect(page.getByText(`Hey, Mostafa Lotfy`)).not.toBeVisible()
      await expect(page.getByRole('button', { name: 'Log Out'})).not.toBeVisible()
      await expect(page.getByText('wrong username or password')).toBeVisible()
    })
  })

})
