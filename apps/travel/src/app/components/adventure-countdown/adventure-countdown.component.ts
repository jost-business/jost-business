import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-adventure-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adventure-countdown.component.html',
  styleUrl: './adventure-countdown.component.scss',
})
export class AdventureCountdownComponent implements OnInit, OnDestroy {
  days = 0;
  hours = 0;
  minutes = 0;
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
    const targetDate = new Date('2026-06-10T16:05:00').getTime();
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference > 0) {
      this.days = Math.floor(difference / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    } else {
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
    }
  }
}
