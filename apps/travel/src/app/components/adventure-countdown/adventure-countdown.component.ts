import { Component, OnInit, OnDestroy, input } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Trip } from '@jost/shared';

@Component({
  selector: 'app-adventure-countdown',
  standalone: true,
  imports: [],
  templateUrl: './adventure-countdown.component.html',
  styleUrl: './adventure-countdown.component.scss',
})
export class AdventureCountdownComponent implements OnInit, OnDestroy {
  readonly trip = input<Trip>();
  days = 0;
  hours = 0;
  minutes = 0;
  nights = 0;
  private countdownSubscription?: Subscription;

  ngOnInit(): void {
    this.updateCountdown();
    this.countdownSubscription = interval(60000).subscribe(() => {
      this.updateCountdown();
    });
  }

  ngOnDestroy(): void {
    this.countdownSubscription?.unsubscribe();
  }

  private updateCountdown(): void {
    const trip = this.trip();
    if (!trip) {
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.nights = 0;
      return;
    }
    const targetDate = trip.from.getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference > 0) {
      this.days = Math.floor(difference / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      this.nights = Math.floor((targetDate - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
    } else {
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.nights = 0;
    }
  }
}
