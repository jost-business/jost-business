import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'About Me';
  days = 0;
  hours = 0;
  minutes = 0;
  private countdownSubscription?: Subscription;

  ngOnInit(): void {
    this.updateCountdown();
    // Update countdown every minute
    this.countdownSubscription = interval(60000).subscribe(() => {
      this.updateCountdown();
    });
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  private updateCountdown(): void {
    const targetDate = new Date('2026-04-01T16:05:00').getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference > 0) {
      this.days = Math.floor(difference / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    } else {
      // Countdown finished
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
    }
  }
}
