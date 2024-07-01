const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

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
      await loginWith(page, 'mstflotfy', '123')
      await expect(page.getByText(`Hey, Mostafa Lotfy`)).toBeVisible()
      await expect(page.getByRole('button', { name: 'Log Out'})).toBeVisible()

      // shows no blogs intially 
      await expect(page.getByRole('button', { name: 'view'})).not.toBeVisible()
    })

    test('fails with wrong credentials', async({page}) => {
      await loginWith(page, 'mstflotfy', 'wrong')
      await expect(page.getByText(`Hey, Mostafa Lotfy`)).not.toBeVisible()
      await expect(page.getByRole('button', { name: 'Log Out'})).not.toBeVisible()
      await expect(page.getByText('wrong username or password')).toBeVisible()
    })
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mstflotfy', '123')
    })
    test('a new blog can be created', async ({ page }) => {
      const title = 'a test blog by playwright'
      await createBlog(page, title, 'mstflotfy', '/test-blog')
      await expect(page.getByRole('heading', { name: 'a test blog by playwright,' })).toBeVisible()
      const newBlog = page.getByText(title).locator('..')
      await expect(newBlog.getByRole('button', { name: 'view'})).toBeVisible()
      await expect(page.locator('div').filter({ hasText: /^Added a new blog post: 'a test blog by playwright' by mstflotfy$/ })).toBeVisible()
    })
  })

})
