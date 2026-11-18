import { Component, OnInit, ChangeDetectionStrategy, HostListener, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RomanticCountdownComponent, TogetherCardComponent } from '@jost/shared';
import { TravelService } from '@jost/shared';
import { APP_VERSION } from './version';
import type { Trip } from '@jost/shared';

const API = 'https://jost.business/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DatePipe, RomanticCountdownComponent, TogetherCardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly travelService = inject(TravelService);

  trip: Trip | null = null;
  readonly version = APP_VERSION;

  together = false;

  get destinationCity(): string {
    return this.trip ? this.travelService.getCity(this.trip) : '';
  }

  get destinationCountry(): string {
    return this.trip ? this.travelService.getCountry(this.trip) : '';
  }

  ngOnInit(): void {
    this.refreshTrip();
    this.trackAppOpen();
    this.initNotifications();
  }

  /** Called by the countdown when it reaches zero, so the together card replaces it right away. */
  onCountdownArrived(): void {
    this.refreshTrip();
  }

  /** A PWA usually comes back from the background rather than reloading, so re-evaluate the trip then. */
  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.visibilityState === 'visible') this.refreshTrip();
  }

  private refreshTrip(): void {
    const next = this.travelService.getCurrentOrNextTrip();
    this.trip = next ?? null;
    this.together = !!next && this.travelService.isInProgress(next);
  }

  private trackAppOpen(): void {
    fetch(`${API}/pwa/notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'app_open',
        user_agent: navigator.userAgent,
        timestamp: new Date(),
      }),
    }).catch(() => {
      // Tracking is best-effort; never let it break the page
    });
  }

  private async initNotifications(): Promise<void> {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    const isToday = !!this.trip && new Date().toDateString() === this.trip.from.toDateString();
    if (isToday && Notification.permission === 'granted') {
      new Notification('✈️ Today is the day!', {
        body: `${this.destinationCity} is waiting for you both! 💕`,
        // Relative, so it resolves under the /countdown/ base href
        icon: 'icons/icon-192x192.png',
      });
    }
  }
}
