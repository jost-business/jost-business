import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanMatchFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthStore } from './auth.store';

/**
 * Lets a route match only for a logged-in user; everyone else is sent to
 * /login and comes back to the page they wanted afterwards.
 *
 * canMatch rather than canActivate: a lazy route that does not match is
 * never downloaded.
 */
export const authGuard: CanMatchFn = (_route, segments) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const returnUrl = '/' + segments.map(segment => segment.path).join('/');

  // On a fresh page load the session question may still be on its way, so
  // wait for the first moment it is answered (right away if it already is)
  return toObservable(auth.isResolved).pipe(
    filter(Boolean),
    take(1),
    map(() => auth.isLoggedIn() || router.createUrlTree(['/login'], { queryParams: { returnUrl } })),
  );
};
