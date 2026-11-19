import { Component, input, output } from '@angular/core';
import { CountdownComponent } from 'ui-countdown';

@Component({
  selector: 'lib-romantic-countdown',
  imports: [CountdownComponent],
  templateUrl: './romantic-countdown.component.html',
  styleUrl: './romantic-countdown.component.scss',
})
export class RomanticCountdownComponent {
  readonly targetDate = input.required<Date>();
  readonly showSeconds = input<boolean>(false);
  readonly version = input<string>('');
  readonly arrived = output<void>();
}
