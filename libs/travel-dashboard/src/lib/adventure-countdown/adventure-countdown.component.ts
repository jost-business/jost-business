import { Component, input } from '@angular/core';
import { Trip } from '@jost/shared';
import { RomanticCountdownComponent } from '@jost/shared';

@Component({
  selector: 'app-adventure-countdown',
  standalone: true,
  imports: [RomanticCountdownComponent],
  templateUrl: './adventure-countdown.component.html',
  styleUrl: './adventure-countdown.component.scss',
})
export class AdventureCountdownComponent {
  readonly trip = input<Trip>();
}
