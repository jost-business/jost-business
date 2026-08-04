import {
  Component, OnInit, OnDestroy, input, computed, signal,
  ChangeDetectionStrategy
} from '@angular/core';

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  nights: number;
  arrived: boolean;
}

@Component({
  selector: 'lib-countdown',
  standalone: true,
  imports: [],
  templateUrl: './ui-countdown.html',
  styleUrl: './ui-countdown.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownComponent implements OnInit, OnDestroy {
  readonly targetDate = input.required<Date>();
  readonly showSeconds = input<boolean>(true);

  private timer?: ReturnType<typeof setInterval>;
  readonly now = signal(new Date());

  readonly state = computed((): CountdownState => {
    const diff = this.targetDate().getTime() - this.now().getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, nights: 0, arrived: true };
    return {
      days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      nights:  Math.floor((this.targetDate().getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)),
      arrived: false,
    };
  });

  ngOnInit(): void {
    this.timer = setInterval(() => this.now.set(new Date()), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
