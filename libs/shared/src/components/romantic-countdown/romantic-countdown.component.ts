import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CountdownComponent } from 'ui-countdown';

@Component({
  selector: 'lib-romantic-countdown',
  standalone: true,
  imports: [CountdownComponent],
  templateUrl: './romantic-countdown.component.html',
  styleUrl: './romantic-countdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RomanticCountdownComponent {
  readonly targetDate = input.required<Date>();
  readonly showSeconds = input<boolean>(false);
  readonly version = input<string>('');
}
