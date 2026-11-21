import { InjectionToken } from '@angular/core';

/**
 * Where the login page is. Every app shares one login, on the travel app;
 * the travel app itself reaches it with its router, the others with a full
 * page load.
 */
export type LoginPage =
  /** A route of this app. */
  | { route: string }
  /** A page of another app on the same site. */
  | { href: string };

export const LOGIN_PAGE = new InjectionToken<LoginPage>('LOGIN_PAGE', {
  providedIn: 'root',
  factory: () => ({ href: '/travel/login' }),
});

/**
 * The login page with the page to come back to afterwards. `returnUrl` is a
 * path on this site including the app's base href, like /playground/signals.
 */
export function loginHref(returnUrl: string, page = '/travel/login'): string {
  return `${page}?returnUrl=${encodeURIComponent(returnUrl)}`;
}

/**
 * Only paths on this site: a crafted link must not send someone to another
 * site after login. `//host` and `/\host` are both read as another host by
 * browsers.
 */
export function isSafeReturnUrl(url: string | undefined): url is string {
  return !!url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
}
