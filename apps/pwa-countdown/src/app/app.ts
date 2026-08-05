import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CountdownComponent } from 'ui-countdown';
import { APP_VERSION } from './version';

const TARGET = new Date(2026, 7, 16, 16, 5); // August 16, 2026
const API = 'https://jost.business/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CountdownComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  readonly target = TARGET;
  readonly version = APP_VERSION;

  ngOnInit(): void {
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
    const isToday = now.toDateString() === TARGET.toDateString();
    if (isToday && Notification.permission === 'granted') {
      new Notification('✈️ Today is the day!', {
        body: 'Casablanca is waiting for you both! 💕',
        icon: '/icons/icon-192x192.png',
      });
    }
  }
}
