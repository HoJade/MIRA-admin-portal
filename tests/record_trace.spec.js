import { test, expect } from '@playwright/test';
// import the configuration
import { trace } from '../playwright.config'
import { mira_admin, username, password } from '../config/credential'


// set-up the tracing for all the tests in this file
let context
let page
let isTracingStarted = false    // track if tracking has been started

test.beforeAll(async ({ browser }) => {
    context = await browser.newContext()

    // only start tracing if it is not 'on' and it hasn't been started yet 
    // if (trace !== 'on')
    if (isTracingStarted = false) {
        try {
            await context.tracing.start(
                {
                    snapshots: true,      // snapshot --> every actions: Action | Before | After
                    screenshots: true     // screenshot --> the screen capture during the tracing
                })
            isTracingStarted = true     // set flag to true
        } catch (error) {
            console.error('Error starting tracing:', error)

        }
    }

    // only create a new page if tracing has started
    if (isTracingStarted) {
        page = await context.newPage()
    }
})
// stop the tracing for all the tests in this file, and give the location and name of the trace file
test.afterAll(async () => {
    // only stop tracing if it was started
    if (isTracingStarted) {
        try {
            await context.tracing.stop({ path: './trace-viewer/record_trace.zip' })
            isTracingStarted = false        // reset the flag
        } catch (error) {
            console.error('Error stopping tracing:', error)
        }

    }

})


test('login_success', async ({ page }) => {
    // land to MIRA Admin portal login page
    await page.goto(mira_admin);
    await expect(page.getByRole('img')).toBeVisible();

    // Username
    await expect(page.locator('#mat-mdc-form-field-label-0')).toContainText('Username');
    await expect(page.locator('xpath=//span[@class="mat-mdc-form-field-required-marker mdc-floating-label--required ng-tns-c2608167813-1 ng-star-inserted"]')).toBeVisible();
    await page.getByLabel('Username').click();
    await page.getByLabel('Username').fill(username);

    // Password
    await expect(page.locator('#mat-mdc-form-field-label-2')).toContainText('Password');
    await expect(page.locator('xpath=//span[@class="mat-mdc-form-field-required-marker mdc-floating-label--required ng-tns-c2608167813-2 ng-star-inserted"]')).toBeVisible();
    await page.getByLabel('Password').click();
    await page.getByLabel('Password').fill(password);
    await page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button').click();

    // check password input
    const revealedPassword = await page.inputValue('#password')
    expect(revealedPassword).toBe(password)

    // Sign-in
    await page.getByRole('button', { name: 'Sign in' }).click();

    // land to MIRA Admin portal main landing page
    await expect(page.locator('app-home').getByRole('img')).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('paragraph')).toContainText('Welcome');
});