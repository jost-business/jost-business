import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import type { Trip } from '@jost/models';
import { PhotoGalleryComponent } from './photo-gallery.component';

const TRIP: Trip = {
  id: '2030-03-peru',
  destination: 'Lima, Peru',
  from: new Date('2030-03-01T10:00:00.000Z'),
  to: new Date('2030-03-08T10:00:00.000Z'),
  photos: ['a.webp', 'b.webp', 'c.webp'].map(name => ({ name, url: `/api/photos/2030-03-peru/${name}`, labels: [] })),
  labelOrder: [],
};

describe('PhotoGalleryComponent', () => {
  function show(heading?: string, deletable = false) {
    const fixture = TestBed.createComponent(PhotoGalleryComponent);
    fixture.componentRef.setInput('trip', TRIP);
    if (heading) fixture.componentRef.setInput('heading', heading);
    fixture.componentRef.setInput('deletable', deletable);
    fixture.autoDetectChanges();
    return fixture.componentInstance;
  }

  const lightboxSrc = () => document.querySelector<HTMLImageElement>('.lightbox-image')?.getAttribute('src');

  it('shows a tile per photo under the heading', async () => {
    show('Lima March 2030');

    await expect.element(page.getByRole('heading', { name: 'Lima March 2030' })).toBeVisible();
    expect(page.getByRole('button', { name: /Open photo/ }).elements()).toHaveLength(3);
  });

  it('opens a photo, pages with the arrow keys round the ends, and closes with Escape', async () => {
    show();
    await expect.element(page.getByRole('heading', { name: 'Photos' })).toBeVisible();

    await page.getByRole('button', { name: 'Open photo 3' }).click();
    await vi.waitFor(() => expect(lightboxSrc()).toContain('c.webp'));

    await userEvent.keyboard('{ArrowRight}');
    await vi.waitFor(() => expect(lightboxSrc()).toContain('a.webp'));

    await userEvent.keyboard('{ArrowLeft}');
    await vi.waitFor(() => expect(lightboxSrc()).toContain('c.webp'));

    await userEvent.keyboard('{Escape}');
    await vi.waitFor(() => expect(lightboxSrc()).toBeUndefined());
  });

  it('closes with its close button or a tap on the photo, as there is no Escape on a phone', async () => {
    show();

    await page.getByRole('button', { name: 'Open photo 1' }).click();
    await page.getByRole('button', { name: 'Close photo' }).click();
    await vi.waitFor(() => expect(lightboxSrc()).toBeUndefined());

    await page.getByRole('button', { name: 'Open photo 2' }).click();
    await vi.waitFor(() => expect(lightboxSrc()).toContain('b.webp'));
    document.querySelector<HTMLImageElement>('.lightbox-image')?.click();
    await vi.waitFor(() => expect(lightboxSrc()).toBeUndefined());

    // The arrows page instead of closing
    await page.getByRole('button', { name: 'Open photo 1' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await vi.waitFor(() => expect(lightboxSrc()).toContain('b.webp'));
  });

  it('has no delete buttons unless asked to', async () => {
    show();
    await expect.element(page.getByRole('button', { name: 'Open photo 1' })).toBeVisible();

    expect(page.getByRole('button', { name: /Delete photo/ }).elements()).toHaveLength(0);
  });

  it('asks the page to delete a photo instead of deleting it itself', async () => {
    const gallery = show(undefined, true);
    const requested: string[] = [];
    gallery.deleteRequested.subscribe(photo => requested.push(photo.name));

    await page.getByRole('button', { name: 'Delete photo 2' }).click();

    expect(requested).toEqual(['b.webp']);
    expect(page.getByRole('button', { name: /Open photo/ }).elements()).toHaveLength(3);
  });

  it('lets the photos be dragged only when sortable', async () => {
    const fixture = TestBed.createComponent(PhotoGalleryComponent);
    fixture.componentRef.setInput('trip', TRIP);
    fixture.autoDetectChanges();
    await expect.element(page.getByRole('button', { name: 'Open photo 1' })).toBeVisible();
    const grid = () => document.querySelector('.gallery-grid');
    expect(grid()?.classList).toContain('cdk-drop-list-disabled');

    fixture.componentRef.setInput('sortable', true);
    await fixture.whenStable();
    expect(grid()?.classList).not.toContain('cdk-drop-list-disabled');
  });

  it('reports the new order after a drop, without changing the trip itself', () => {
    const gallery = show();
    const orders: string[][] = [];
    gallery.reordered.subscribe(photos => orders.push(photos.map(photo => photo.name)));

    gallery.dropped({ previousIndex: 0, currentIndex: 2 } as CdkDragDrop<unknown>);
    gallery.dropped({ previousIndex: 1, currentIndex: 1 } as CdkDragDrop<unknown>);

    expect(orders).toEqual([['b.webp', 'c.webp', 'a.webp']]);
    expect(TRIP.photos.map(photo => photo.name)).toEqual(['a.webp', 'b.webp', 'c.webp']);
  });
});

describe('PhotoGalleryComponent selecting photos', () => {
  function showSelecting() {
    const fixture = TestBed.createComponent(PhotoGalleryComponent);
    const labelled: Trip = { ...TRIP, photos: TRIP.photos.map((p, i) => (i === 0 ? { ...p, labels: ['Dakhla Club'] } : p)) };
    fixture.componentRef.setInput('trip', labelled);
    fixture.componentRef.setInput('selecting', true);
    fixture.componentRef.setInput('sortable', true);
    fixture.componentRef.setInput('deletable', true);
    fixture.autoDetectChanges();
    return fixture.componentInstance;
  }

  it('marks photos instead of opening them, and shows their labels', async () => {
    const gallery = showSelecting();

    await page.getByRole('button', { name: 'Select photo 1' }).click();
    await page.getByRole('button', { name: 'Select photo 3' }).click();

    expect(gallery.selected()).toEqual(['a.webp', 'c.webp']);
    await expect.element(page.getByRole('button', { name: 'Select photo 1' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(page.getByText('Dakhla Club')).toBeVisible();
    expect(document.querySelector('.lightbox-backdrop')).toBeNull();
    // No deleting or dragging while marking
    expect(page.getByRole('button', { name: /Delete photo/ }).elements()).toHaveLength(0);
    expect(document.querySelector('.gallery-grid')?.classList).toContain('cdk-drop-list-disabled');

    await page.getByRole('button', { name: 'Select photo 1' }).click();
    expect(gallery.selected()).toEqual(['c.webp']);
  });

  it('marks a range with shift-click', async () => {
    const gallery = showSelecting();

    await page.getByRole('button', { name: 'Select photo 1' }).click();
    await userEvent.keyboard('{Shift>}');
    await page.getByRole('button', { name: 'Select photo 3' }).click();
    await userEvent.keyboard('{/Shift}');

    expect(gallery.selected()).toEqual(['a.webp', 'b.webp', 'c.webp']);
  });
});
