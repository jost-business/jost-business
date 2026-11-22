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
    const trip: TripDto = { ...body, photos: [], photoLabels: {}, labelOrder: [] };
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

test('a logged-in user drags a photo to a new place', async ({ page }) => {
  const turkey = TRIPS.find(trip => trip.id === '2025-10-turkey');
  if (!turkey) throw new Error('The fixtures have no Turkey trip');
  let saved: string[] | undefined;
  await page.route('**/api/auth/session', route => route.fulfill({ json: { user: USER } }));
  await page.route('**/api/trips/2025-10-turkey/photos', async route => {
    saved = route.request().postDataJSON().photos;
    await route.fulfill({ json: { ...turkey, photos: saved } });
  });
  await page.goto('/gallery?trip=2025-10-turkey');
  const tiles = page.locator('.gallery-image');
  await expect(tiles).toHaveCount(3);

  await page.getByRole('button', { name: 'Open photo 3' }).scrollIntoViewIfNeeded();
  // The CDK follows the pointer, so move in steps like a real hand would
  const from = await page.getByRole('button', { name: 'Open photo 1' }).boundingBox();
  const to = await page.getByRole('button', { name: 'Open photo 3' }).boundingBox();
  if (!from || !to) throw new Error('The photos are not on the screen');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 20 });
  await page.mouse.up();

  await expect.poll(() => saved).toEqual(['alanya_cable_car.jpeg', 'alanya_love.jpeg', 'alanya.jpeg']);
  await expect(tiles.first()).toHaveAttribute('src', /alanya_cable_car/);
  // A drag is not a click: no photo opened
  await expect(page.locator('.lightbox-backdrop')).toHaveCount(0);
});

test('a logged-in user labels photos and filters by the label', async ({ page }) => {
  const turkey = TRIPS.find(trip => trip.id === '2025-10-turkey');
  if (!turkey) throw new Error('The fixtures have no Turkey trip');
  let photoLabels: Record<string, string[]> = {};
  await page.route('**/api/auth/session', route => route.fulfill({ json: { user: USER } }));
  await page.route('**/api/trips/2025-10-turkey/photo-labels', async route => {
    const { label, add = [] } = route.request().postDataJSON();
    for (const name of add) photoLabels = { ...photoLabels, [name]: [label] };
    await route.fulfill({ json: { ...turkey, photoLabels } });
  });
  await page.goto('/gallery?trip=2025-10-turkey');

  await page.getByRole('button', { name: 'Select photos' }).click();
  await page.getByRole('button', { name: 'Select photo 1' }).click();
  await page.getByRole('button', { name: 'Select photo 3' }).click();
  await page.getByRole('combobox', { name: 'Label' }).fill('Dakhla Club');
  await page.getByRole('button', { name: 'Add label' }).click();
  await page.getByRole('button', { name: 'Done' }).click();

  const labels = page.getByRole('group', { name: 'Show photos labelled' });
  await labels.getByRole('button', { name: /Dakhla Club/ }).click();
  await expect(page).toHaveURL(/\/gallery\?trip=2025-10-turkey&label=Dakhla%20Club$/);
  await expect(page.getByRole('button', { name: /Open photo/ })).toHaveCount(2);

  await labels.getByRole('button', { name: 'All photos' }).click();
  await expect(page).toHaveURL(/\/gallery\?trip=2025-10-turkey$/);
  await expect(page.getByRole('button', { name: /Open photo/ })).toHaveCount(3);
});

test('with labels, all photos come in sections that are sorted on their own', async ({ page }) => {
  const turkey = TRIPS.find(trip => trip.id === '2025-10-turkey');
  if (!turkey) throw new Error('The fixtures have no Turkey trip');
  // alanya_cable_car.jpeg has no label and sits between the two hotel photos
  const labelled = { ...turkey, photoLabels: { 'alanya.jpeg': ['Dakhla Club'], 'alanya_love.jpeg': ['Dakhla Club'] } };
  let saved: string[] | undefined;
  await page.route('**/api/auth/session', route => route.fulfill({ json: { user: USER } }));
  await page.route('**/api/trips', route => route.fulfill({ json: TRIPS.map(t => (t.id === turkey.id ? labelled : t)) }));
  await page.route('**/api/trips/2025-10-turkey/photos', async route => {
    saved = route.request().postDataJSON().photos;
    await route.fulfill({ json: { ...labelled, photos: saved } });
  });
  await page.setViewportSize({ width: 1100, height: 1000 });
  await page.goto('/gallery?trip=2025-10-turkey');

  await expect(page.getByRole('heading', { level: 4 })).toHaveText([/Dakhla Club\s*2/, /Without label\s*1/]);
  await page.screenshot({ path: 'C:/Users/dains/AppData/Local/Temp/claude/ba077d8fe1140e8f/492b043d-a8d3-44f7-8566-65d3167d48a9/scratchpad/sections.png' });

  const first = await page.getByRole('button', { name: 'Open photo 1' }).first().boundingBox();
  const second = await page.getByRole('button', { name: 'Open photo 2' }).first().boundingBox();
  if (!first || !second) throw new Error('The photos are not on the screen');
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2);
  await page.mouse.down();
  await page.mouse.move(second.x + second.width * 0.75, second.y + second.height / 2, { steps: 20 });
  await page.mouse.up();

  await expect.poll(() => saved).toEqual(['alanya_love.jpeg', 'alanya_cable_car.jpeg', 'alanya.jpeg']);
});

test('a logged-in user drags a label to put its section first', async ({ page }) => {
  const turkey = TRIPS.find(trip => trip.id === '2025-10-turkey');
  if (!turkey) throw new Error('The fixtures have no Turkey trip');
  const labelled = { ...turkey, photoLabels: { 'alanya.jpeg': ['Beach'], 'alanya_love.jpeg': ['Dakhla Club'] } };
  let saved: string[] | undefined;
  await page.route('**/api/auth/session', route => route.fulfill({ json: { user: USER } }));
  await page.route('**/api/trips', route => route.fulfill({ json: TRIPS.map(t => (t.id === turkey.id ? labelled : t)) }));
  await page.route('**/api/trips/2025-10-turkey/label-order', async route => {
    saved = route.request().postDataJSON().labels;
    await route.fulfill({ json: { ...labelled, labelOrder: saved } });
  });
  await page.goto('/gallery?trip=2025-10-turkey');
  const sections = page.getByRole('heading', { level: 4 });
  await expect(sections).toHaveText([/Beach/, /Dakhla Club/, /Without label/]);

  const labels = page.getByRole('group', { name: 'Show photos labelled' });
  const from = await labels.getByRole('button', { name: /Dakhla Club/ }).boundingBox();
  const to = await labels.getByRole('button', { name: /Beach/ }).boundingBox();
  if (!from || !to) throw new Error('The labels are not on the screen');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + 4, to.y + to.height / 2, { steps: 15 });
  await page.mouse.up();

  await expect.poll(() => saved).toEqual(['Dakhla Club', 'Beach']);
  await expect(sections).toHaveText([/Dakhla Club/, /Beach/, /Without label/]);
  // A drag is not a click: no label got filtered
  await expect(page).toHaveURL(/\/gallery\?trip=2025-10-turkey$/);
});
