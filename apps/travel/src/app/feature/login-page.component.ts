import { Component, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import type { LoginRequest } from '@jost/models';
import { AuthStore, isSafeReturnUrl } from '@jost/shared';

@Component({
  selector: 'app-login-page',
  imports: [FormField, FormRoot],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  protected readonly auth = inject(AuthStore);

  /**
   * Where to go after logging in, a path on this site like /travel/trips/new
   * or /playground/signals. The auth guards and the header put it here.
   */
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
                this.goBack();
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

  /**
   * Back to the page that asked for the login. It may belong to this app
   * (router navigation) or to another app on the site (full page load).
   */
  private goBack(): void {
    const url = this.returnUrl();
    if (!isSafeReturnUrl(url)) {
      this.router.navigateByUrl('/dashboard');
      return;
    }
    // This app's base href: "/travel/" in production, "/" on the dev server
    const base = this.location.prepareExternalUrl('/');
    if (url.startsWith(base)) {
      this.router.navigateByUrl('/' + url.slice(base.length));
    } else {
      window.location.assign(url);
    }
  }
}
