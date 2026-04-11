import { Route } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@jost/shared';

@Component({
  selector: 'app-travel-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './travel.component.html',
  styleUrl: './travel.component.scss',
})
class TravelListComponent {
  trips = [
    { date: '2026-05-10', destination: 'Paris, France', status: 'Upcoming' },
    { date: '2026-03-15', destination: 'Tokyo, Japan', status: 'Completed' },
    { date: '2026-01-20', destination: 'New York, USA', status: 'Completed' },
  ];

  constructor(public authService: AuthService) {}
}

export const TRAVEL_ROUTES: Route[] = [
  {
    path: '',
    component: TravelListComponent,
  },
];
