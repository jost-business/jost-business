import { inject } from '@angular/core';
import { Location } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanMatchFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthStore } from './auth.store';
import { LOGIN_PAGE, loginHref } from './login-page';

/**
 * Lets a route match only for a logged-in user; everyone else is sent to
 * the login page and comes back to the page they wanted afterwards.
 *
 * canMatch rather than canActivate: a lazy route that does not match is
 * never downloaded.
 */
export const authGuard: CanMatchFn = (_route, segments) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const loginPage = inject(LOGIN_PAGE);
  // With the base href, so the login page can also send people back to another app
  const returnUrl = inject(Location).prepareExternalUrl('/' + segments.map(segment => segment.path).join('/'));

  // On a fresh page load the session question may still be on its way, so
  // wait for the first moment it is answered (right away if it already is)
  return toObservable(auth.isResolved).pipe(
    filter(Boolean),
    take(1),
    map(() => {
      if (auth.isLoggedIn()) return true;
      if ('route' in loginPage) return router.createUrlTree([loginPage.route], { queryParams: { returnUrl } });
      // The login page belongs to another app: leave this one
      window.location.assign(loginHref(returnUrl, loginPage.href));
      return false;
    }),
  );
};
