import { expect, test, TRIPS } from './fixtures';

test.describe('travel app', () => {
  test('opens a completed trip from the dashboard and comes back', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('row', { name: /Casablanca.*in 31 days/ })).toBeVisible();

    await page.getByRole('row', { name: /Lima/ }).click();

    await expect(page).toHaveURL(/\/trip\/2030-03-peru$/);
    await expect(page.getByRole('heading', { name: 'Lima, Peru' })).toBeVisible();

    await page.getByRole('button', { name: /Back to overview/ }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('filters the dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('row', { name: /Casablanca/ })).toBeVisible();

    await page.getByRole('button', { name: 'Completed' }).click();

    await expect(page.getByRole('row', { name: /Casablanca/ })).toBeHidden();
    await expect(page.getByRole('row', { name: /Lima/ })).toBeVisible();
  });

  test('deep-links to a trip page with its own content and a deferred gallery', async ({ page }) => {
    await page.goto('/trip/2025-10-turkey');

    await expect(page.getByRole('heading', { name: 'Alanya, Turkey' })).toBeVisible();
    await expect(page.getByText('Road Trip')).toBeVisible();

    await page.locator('.gallery-placeholder, .photo-gallery').first().scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: /Open photo/ })).toHaveCount(3);

    await page.getByRole('button', { name: 'Open photo 2' }).click();
    await expect(page.locator('.lightbox-image')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.lightbox-image')).toBeHidden();
  });

  test('says so for a trip that does not exist', async ({ page }) => {
    await page.goto('/trip/nowhere');

    await expect(page.getByText('Trip not found.')).toBeVisible();
  });
});

test.describe('when the API fails once', () => {
  test.use({
    // eslint-disable-next-line no-empty-pattern -- Playwright fixture with no dependencies
    tripsApi: async ({}, use) => {
      let calls = 0;
      await use(route =>
        ++calls === 1 ? route.fulfill({ status: 503, body: 'down' }) : route.fulfill({ json: TRIPS }),
      );
    },
  });

  test('offers a retry that recovers', async ({ page }) => {
    await page.goto('/dashboard');
    const alert = page.getByRole('alert');
    await expect(alert).toContainText('The trips could not be loaded.');

    await page.getByRole('button', { name: 'Try again' }).click();

    await expect(page.getByRole('row', { name: /Lima/ })).toBeVisible();
    await expect(alert).toBeHidden();
  });
});
