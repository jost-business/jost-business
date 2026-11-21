import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import type { LoginRequest } from '@jost/models';
import { AuthStore } from '@jost/shared';

@Component({
  selector: 'app-login-page',
  imports: [FormField, FormRoot],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthStore);

  /** Where to go after logging in; the auth guard puts the page that wanted a login here. */
  readonly returnUrl = input<string>();

  protected readonly credentials = signal<LoginRequest>({ email: '', password: '' });

  protected readonly loginForm = form(
    this.credentials,
    path => {
      required(path.email, { message: 'Enter your e-mail address.' });
      email(path.email, { message: 'This is not an e-mail address.' });
      required(path.password, { message: 'Enter your password.' });
    },
    {
      // Signal Forms wants the submission as a Promise; the Observable becomes one only here
      submission: {
        action: () =>
          firstValueFrom(
            this.auth.login(this.credentials()).pipe(
              map(() => {
                this.router.navigateByUrl(safeReturnUrl(this.returnUrl()));
                return undefined;
              }),
              catchError((error: Error) => {
                // Shown above the form, and the password is cleared for the next try
                this.loginForm.password().value.set('');
                return of({ kind: 'login', message: error.message });
              }),
            ),
          ),
      },
    },
  );

  protected logout(): void {
    this.auth.logout().subscribe();
  }
}

/** Only paths inside this app: a crafted link must not send someone to another site after login. */
function safeReturnUrl(url: string | undefined): string {
  return url?.startsWith('/') && !url.startsWith('//') ? url : '/dashboard';
}
