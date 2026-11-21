import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import type { Trip } from '@jost/models';
import { PhotoGalleryComponent } from './photo-gallery.component';

const TRIP: Trip = {
  id: '2030-03-peru',
  destination: 'Lima, Peru',
  from: new Date('2030-03-01T10:00:00.000Z'),
  to: new Date('2030-03-08T10:00:00.000Z'),
  photos: ['a.jpg', 'b.jpg', 'c.jpg'],
};

describe('PhotoGalleryComponent', () => {
  function show(heading?: string): void {
    const fixture = TestBed.createComponent(PhotoGalleryComponent);
    fixture.componentRef.setInput('trip', TRIP);
    if (heading) fixture.componentRef.setInput('heading', heading);
    fixture.autoDetectChanges();
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
    await vi.waitFor(() => expect(lightboxSrc()).toContain('c.jpg'));

    await userEvent.keyboard('{ArrowRight}');
    await vi.waitFor(() => expect(lightboxSrc()).toContain('a.jpg'));

    await userEvent.keyboard('{ArrowLeft}');
    await vi.waitFor(() => expect(lightboxSrc()).toContain('c.jpg'));

    await userEvent.keyboard('{Escape}');
    await vi.waitFor(() => expect(lightboxSrc()).toBeUndefined());
  });
});
