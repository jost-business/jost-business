import { Route } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '@jost/shared';

@Component({
  selector: 'app-finance-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss',
})
class FinanceListComponent {
  displayedColumns = ['date', 'description', 'amount'];
  transactions = [
    { date: '2026-02-22', description: 'Salary', amount: 5000 },
    { date: '2026-02-20', description: 'Utilities', amount: -150 },
    { date: '2026-02-15', description: 'Groceries', amount: -200 },
  ];

  constructor(public authService: AuthService) {}
}

export const FINANCE_ROUTES: Route[] = [
  {
    path: '',
    component: FinanceListComponent,
  },
];

