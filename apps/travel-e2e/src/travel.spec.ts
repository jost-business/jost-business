import { expect, test, TRIPS } from './fixtures';

test.describe('travel app', () => {
  test('opens a completed trip from the dashboard in the gallery and comes back', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('row', { name: /Casablanca.*in 31 days/ })).toBeVisible();

    await page.getByRole('row', { name: /Alanya/ }).click();

    // The gallery opens with the trip's filter already set
    await expect(page).toHaveURL(/\/gallery\?trip=2025-10-turkey$/);
    await expect(page.getByRole('button', { name: 'Alanya October 2025' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: 'Alanya, Turkey' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Open photo/ })).toHaveCount(3);

    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('filters the gallery by trip, with the filter in the URL', async ({ page }) => {
    await page.goto('/gallery');

    // Only trips with photos get a filter; "All" groups the photos by trip
    const filters = page.getByRole('group', { name: 'Show photos of' }).getByRole('button');
    await expect(filters).toHaveText(['All', 'Alanya October 2025']);
    await expect(page.getByRole('heading', { name: 'Alanya October 2025' })).toBeVisible();

    await filters.filter({ hasText: 'Alanya' }).click();
    await expect(page).toHaveURL(/\/gallery\?trip=2025-10-turkey$/);
    await expect(page.getByRole('heading', { name: 'Alanya, Turkey' })).toBeVisible();

    await filters.filter({ hasText: 'All' }).click();
    await expect(page).toHaveURL(/\/gallery$/);
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
