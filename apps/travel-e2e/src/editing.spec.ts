import type { NewTripRequest, TripDto, UserDto } from '@jost/models';
import { expect, test, TRIPS } from './fixtures';

const USER: UserDto = { id: 'u1', email: 'me@example.com', name: 'Me' };

test('logs in, creates a trip and finds it in the gallery', async ({ page }) => {
  // A small stand-in for the API that remembers the login and new trips
  let user: UserDto | null = null;
  const trips: TripDto[] = [...TRIPS];
  await page.route('**/api/auth/session', route => route.fulfill({ json: { user } }));
  await page.route('**/api/auth/login', async route => {
    const { password } = route.request().postDataJSON();
    if (password !== 'correct horse battery') return route.fulfill({ status: 401, json: {} });
    user = USER;
    return route.fulfill({ json: { user } });
  });
  await page.route('**/api/trips/availability?*', route => {
    const id = new URL(route.request().url()).searchParams.get('id');
    return route.fulfill({ json: { available: !trips.some(t => t.id === id) } });
  });
  await page.route('**/api/trips', async route => {
    if (route.request().method() !== 'POST') return route.fulfill({ json: trips });
    const body: NewTripRequest = route.request().postDataJSON();
    const trip: TripDto = { ...body, photos: [] };
    trips.push(trip);
    return route.fulfill({ status: 201, json: trip });
  });

  // The editor is behind the login: visitors land on the login page
  await page.goto('/trips/new');
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Ftrips%2Fnew$/);

  await page.getByLabel('E-mail').fill('me@example.com');
  await page.getByLabel('Password').fill('wrong');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Wrong e-mail or password.');

  await page.getByLabel('Password').fill('correct horse battery');
  await page.getByRole('button', { name: 'Log in' }).click();

  // Back where the guard sent us away from
  await expect(page.getByRole('heading', { name: 'New trip' })).toBeVisible();

  await page.getByLabel('Id').fill('2030-03-peru');
  await page.getByLabel('Destination').click();
  await expect(page.getByText('There already is a trip with this id.')).toBeVisible();

  await page.getByLabel('Id').fill('2031-02-lisbon');
  await page.getByLabel('Destination').fill('Lisbon, Portugal');
  await page.getByLabel('Departure').fill('2031-02-01T10:00');
  await page.getByLabel('Return').fill('2031-02-08T18:30');
  await page.getByRole('button', { name: 'Create trip' }).click();

  // A saved trip is shown in the gallery, like a click on it in the dashboard
  await expect(page).toHaveURL(/\/gallery\?trip=2031-02-lisbon$/);
  await expect(page.getByRole('heading', { name: 'Lisbon, Portugal' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit trip' })).toBeVisible();
});

test('a logged-in user adds a photo to a trip and deletes it again', async ({ page }) => {
  const turkey = TRIPS.find(trip => trip.id === '2025-10-turkey');
  if (!turkey) throw new Error('The fixtures have no Turkey trip');
  let photos = [...turkey.photos];
  await page.route('**/api/auth/session', route => route.fulfill({ json: { user: USER } }));
  await page.route('**/api/trips', route => route.fulfill({ json: TRIPS.map(t => (t.id === turkey.id ? { ...t, photos } : t)) }));
  await page.route('**/api/trips/2025-10-turkey/photos', async route => {
    photos = [...photos, 'new-photo.webp'];
    await route.fulfill({ status: 201, json: { ...turkey, photos } });
  });
  await page.route('**/api/trips/2025-10-turkey/photos/*', async route => {
    expect(route.request().method()).toBe('DELETE');
    photos = photos.filter(name => !route.request().url().endsWith(`/${name}`));
    await route.fulfill({ json: { ...turkey, photos } });
  });
  await page.goto('/gallery?trip=2025-10-turkey');
  await expect(page.getByRole('button', { name: /Open photo/ })).toHaveCount(3);

  await page.getByLabel(/Add photos/).setInputFiles({ name: 'beach.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('jpeg') });
  await expect(page.getByRole('button', { name: /Open photo/ })).toHaveCount(4);

  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete photo 4' }).click({ force: true });
  await expect(page.getByRole('button', { name: /Open photo/ })).toHaveCount(3);
});
