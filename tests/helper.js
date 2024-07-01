const loginWith = async (page, username, password) => {
    const loginForm = page.locator('form')
    const usernameField = loginForm.getByPlaceholder('Username')
    const passwordField = loginForm.getByPlaceholder('password')
    const submitBtn = loginForm.getByRole('button', { name: 'Login'})

    await usernameField.fill(username)
    await passwordField.fill(password)
    await submitBtn.click()
}

export { loginWith, }