import { DOCUMENT, DestroyRef, Injectable, inject, signal } from '@angular/core';

/**
 * The current time as a signal, so anything computed from it updates when the
 * time moves on. It does not tick on its own: it refreshes when the page
 * becomes visible again, and whoever knows when the time matters next can
 * wake it exactly then with refreshAt() instead of polling.
 */
@Injectable({ providedIn: 'root' })
export class Clock {
  private readonly current = signal(Date.now());
  private wakeUp?: ReturnType<typeof setTimeout>;

  /** Milliseconds since the epoch, as of the last refresh. */
  readonly now = this.current.asReadonly();

  constructor() {
    const document = inject(DOCUMENT);
    // A PWA mostly comes back from the background instead of reloading
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') this.refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    inject(DestroyRef).onDestroy(() => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearTimeout(this.wakeUp);
    });
  }

  refresh(): void {
    this.current.set(Date.now());
  }

  /** Refreshes once at the given instant, replacing any earlier request. */
  refreshAt(instant: number): void {
    clearTimeout(this.wakeUp);
    // setTimeout overflows above ~24.8 days; waking early just schedules again
    const delay = Math.min(Math.max(instant - Date.now(), 0), 2 ** 31 - 1);
    this.wakeUp = setTimeout(() => this.refresh(), delay);
  }
}
