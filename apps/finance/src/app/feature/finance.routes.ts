import { Route } from '@angular/router';
import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AuthStore } from '@jost/shared';

@Component({
  selector: 'app-finance-list',
  imports: [CurrencyPipe],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss',
})
class FinanceListComponent {
  protected readonly auth = inject(AuthStore);

  readonly transactions = [
    { date: '2026-02-22', description: 'Salary', amount: 5000 },
    { date: '2026-02-20', description: 'Utilities', amount: -150 },
    { date: '2026-02-15', description: 'Groceries', amount: -200 },
  ];
}

export const FINANCE_ROUTES: Route[] = [
  {
    path: '',
    component: FinanceListComponent,
  },
];

