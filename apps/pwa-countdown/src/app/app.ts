import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL, RomanticCountdownComponent, TogetherCardComponent, TravelService } from '@jost/shared';
import { APP_VERSION } from './version';
import type { Trip } from '@jost/shared';

@Component({
  selector: 'app-root',
  imports: [DatePipe, RomanticCountdownComponent, TogetherCardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '(document:visibilitychange)': 'onVisibilityChange()',
  },
})
export class App implements OnInit {
  protected readonly travelService = inject(TravelService);
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  readonly version = APP_VERSION;

  /**
   * Which trip is current depends on the time, which is not a signal. Bumping
   * this when the time matters (the app comes back, the countdown hits zero)
   * makes the computeds below evaluate again.
   */
  private readonly checkedAt = signal(Date.now());

  readonly trip = computed<Trip | null>(() => {
    this.checkedAt();
    return this.travelService.getCurrentOrNextTrip() ?? null;
  });

  readonly together = computed(() => {
    this.checkedAt();
    const trip = this.trip();
    return !!trip && this.travelService.isInProgress(trip);
  });

  readonly destinationCity = computed(() => {
    const trip = this.trip();
    return trip ? this.travelService.getCity(trip) : '';
  });

  readonly destinationCountry = computed(() => {
    const trip = this.trip();
    return trip ? this.travelService.getCountry(trip) : '';
  });

  private notifiedTripId: string | null = null;
  private notificationPermission?: Promise<NotificationPermission>;

  constructor() {
    // A side effect, not derived state, so effect() is the right tool: once the
    // trips have arrived, greet a trip that starts today with a notification
    effect(() => {
      const trip = this.trip();
      if (trip && trip.id !== this.notifiedTripId && startsToday(trip)) {
        this.notifiedTripId = trip.id;
        void this.notifyTripDay(trip);
      }
    });
  }

  ngOnInit(): void {
    this.trackAppOpen();
    void this.askNotificationPermission();
  }

  /** Called by the countdown when it reaches zero, so the together card replaces it right away. */
  onCountdownArrived(): void {
    this.checkedAt.set(Date.now());
  }

  /** A PWA usually comes back from the background rather than reloading, so re-evaluate the trip then. */
  onVisibilityChange(): void {
    if (document.visibilityState === 'visible') this.checkedAt.set(Date.now());
  }

  private trackAppOpen(): void {
    this.http
      .post(`${this.apiBaseUrl}/pwa/notification`, {
        event: 'app_open',
        user_agent: navigator.userAgent,
        timestamp: new Date(),
      })
      .subscribe({
        error: () => {
          // Tracking is best-effort; never let it break the page
        },
      });
  }

  /** Asks at most once; later callers wait for the same answer. */
  private askNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return Promise.resolve('denied');
    this.notificationPermission ??=
      Notification.permission === 'default' ? Notification.requestPermission() : Promise.resolve(Notification.permission);
    return this.notificationPermission;
  }

  private async notifyTripDay(trip: Trip): Promise<void> {
    if ((await this.askNotificationPermission()) !== 'granted') return;
    new Notification('✈️ Today is the day!', {
      body: `${this.travelService.getCity(trip)} is waiting for you both! 💕`,
      // Relative, so it resolves under the /countdown/ base href
      icon: 'icons/icon-192x192.png',
    });
  }
}

function startsToday(trip: Trip): boolean {
  return new Date().toDateString() === trip.from.toDateString();
}
