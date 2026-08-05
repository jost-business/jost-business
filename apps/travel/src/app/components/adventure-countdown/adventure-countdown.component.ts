import { Component, input } from '@angular/core';
import { Trip } from '@jost/shared';
import { CountdownComponent } from 'ui-countdown';

@Component({
  selector: 'app-adventure-countdown',
  standalone: true,
  imports: [CountdownComponent],
  templateUrl: './adventure-countdown.component.html',
  styleUrl: './adventure-countdown.component.scss',
})
export class AdventureCountdownComponent {
  readonly trip = input<Trip>();
}
