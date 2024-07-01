const loginWith = async (page, username, password) => {
    const loginForm = page.locator('form')
    const usernameField = loginForm.getByPlaceholder('Username')
    const passwordField = loginForm.getByPlaceholder('password')
    const submitBtn = loginForm.getByRole('button', { name: 'Login'})

    await usernameField.fill(username)
    await passwordField.fill(password)
    await submitBtn.click()
}

const createBlog = async (page, title, author, url) => {
    await page.getByRole('button', { name: 'New Blog'}).click()
    await page.getByText('Create Blog').waitFor()
    await page.getByPlaceholder('Title').fill(title)
    await page.getByPlaceholder('Author').fill(author)
    await page.getByPlaceholder('URL').fill(url)
    await page.getByRole('button', { name: 'Create' }).click()
}

export { loginWith, createBlog}