import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  API_BASE_URL,
  RomanticCountdownComponent,
  TogetherCardComponent,
  TripsStore,
  isTripInProgress,
  tripCity,
  tripCountry,
} from '@jost/shared';
import { APP_VERSION } from './version';
import type { Trip } from '@jost/shared';

@Component({
  selector: 'app-root',
  imports: [DatePipe, RomanticCountdownComponent, TogetherCardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly store = inject(TripsStore);
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  readonly version = APP_VERSION;

  // Both depend on the time; the store's clock signal re-evaluates them when it matters
  readonly trip = computed<Trip | null>(() => this.store.currentOrNextTrip() ?? null);

  readonly together = computed(() => {
    const trip = this.trip();
    return !!trip && isTripInProgress(trip, this.store.now());
  });

  readonly destinationCity = computed(() => {
    const trip = this.trip();
    return trip ? tripCity(trip) : '';
  });

  readonly destinationCountry = computed(() => {
    const trip = this.trip();
    return trip ? tripCountry(trip) : '';
  });

  private notifiedTripId: string | null = null;
  private notificationPermission?: Promise<NotificationPermission>;

  constructor() {
    // A side effect, not derived state, so effect() is the right tool: greet a
    // trip that starts today, also when the app stays open past midnight
    effect(() => {
      const trip = this.trip();
      if (trip && trip.id !== this.notifiedTripId && startsOn(trip, this.store.now())) {
        this.notifiedTripId = trip.id;
        void this.notifyTripDay(trip);
      }
    });
  }

  ngOnInit(): void {
    this.trackAppOpen();
    void this.askNotificationPermission();
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
      body: `${tripCity(trip)} is waiting for you both! 💕`,
      // Relative, so it resolves under the /countdown/ base href
      icon: 'icons/icon-192x192.png',
    });
  }
}

function startsOn(trip: Trip, day: number): boolean {
  return new Date(day).toDateString() === trip.from.toDateString();
}
