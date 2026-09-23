import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RomanticCountdownComponent } from '@jost/shared';
import { TravelService } from '@jost/shared';
import { APP_VERSION } from './version';
import type { Trip } from '@jost/shared';

const API = 'https://jost.business/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RomanticCountdownComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  target: Date = new Date(); // Will be set in ngOnInit
  trip: Trip | null = null;
  readonly version = APP_VERSION;

  get destinationCity(): string {
    return this.trip?.destination.split(',')[0].trim() || '';
  }

  get destinationCountry(): string {
    const parts = this.trip?.destination.split(',') || [];
    return parts.length > 1 ? parts[1].trim() : '';
  }

  constructor(private travelService: TravelService) {}

  ngOnInit(): void {
    // Get the first upcoming trip (next adventure)
    const now = new Date();
    for (const year of this.travelService.travelYears) {
      for (const trip of year.trips) {
        if (trip.from > now) {
          this.target = trip.from;
          this.trip = trip;
          return;
        }
      }
    }
    // Fallback if no upcoming trip found
    this.target = new Date(2026, 9, 23, 16, 5);

    this.trackAppOpen();
    this.initNotifications();
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
    }).catch(() => {});
  }

  private async initNotifications(): Promise<void> {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    const now = new Date();
    const isToday = now.toDateString() === this.target.toDateString();
    if (isToday && Notification.permission === 'granted') {
      new Notification('✈️ Today is the day!', {
        body: 'Casablanca is waiting for you both! 💕',
        icon: '/icons/icon-192x192.png',
      });
    }
  }
}
