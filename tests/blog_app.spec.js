const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')
const { title } = require('process')
const { waitForDebugger } = require('inspector')

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

    test('a blog can be liked', async ({ page }) => {
      const blog = {
        title: 'another blog by playwright',
        author: 'test author',
        url: '/blog-2'
      }
      await createBlog(page, blog.title, blog.author, blog.url)
      const blogDiv = page.getByRole('heading', { name: blog.title }).locator('..')
      // const blogDiv = page.getByText(blog.title).locator('..')
      await blogDiv.getByRole('button', { name: 'view'}).click()

      const likes = blogDiv.getByText('Likes: ')
      await blogDiv.getByRole('button', {name: 'Like'}).click()
      await expect(likes).toContainText('1')
      expect (await likes.evaluate(node => node.textContent)).toBe('Likes: 1Like')

      await blogDiv.getByRole('button', {name: 'Like'}).click()
      await expect(likes).toContainText('2')
      expect (await likes.evaluate(node => node.textContent)).toBe('Likes: 2Like')
    })

    test('ownwer can delete a blog', async ({ page }) => {
        const blog = {
          title: 'another blog by playwright 3',
          author: 'test author 2',
          url: '/blog-3'
        }
        await createBlog(page, blog.title, blog.author, blog.url)
        const blogDiv = page.getByRole('heading', { name: blog.title }).locator('..')
        await blogDiv.getByRole('button', { name: 'view'}).click()

        page.on('dialog', dialog => dialog.accept())
        await blogDiv.getByRole('button', { name: 'Delete Post'}).click()

        await expect(page.getByText(`Deleted ${blog.title}`)).toBeVisible()
        await expect(blogDiv).not.toBeVisible()
    })
  })


})
