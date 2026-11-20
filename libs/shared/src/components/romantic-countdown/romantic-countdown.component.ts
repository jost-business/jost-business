import { Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { CountdownComponent } from '@jost/ui/countdown';

@Component({
  selector: 'lib-romantic-countdown',
  imports: [CountdownComponent, NgOptimizedImage],
  templateUrl: './romantic-countdown.component.html',
  styleUrl: './romantic-countdown.component.scss',
})
export class RomanticCountdownComponent {
  readonly targetDate = input.required<Date>();
  readonly showSeconds = input<boolean>(false);
  readonly version = input<string>('');
  readonly arrived = output<void>();
}
