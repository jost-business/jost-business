import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import type { Trip } from '@jost/models';
import { PhotoGalleryComponent } from './photo-gallery.component';

const TRIP: Trip = {
  id: '2030-03-peru',
  destination: 'Lima, Peru',
  from: new Date('2030-03-01T10:00:00.000Z'),
  to: new Date('2030-03-08T10:00:00.000Z'),
  photos: ['a.webp', 'b.webp', 'c.webp'].map(name => ({ name, url: `/api/photos/2030-03-peru/${name}` })),
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
});
