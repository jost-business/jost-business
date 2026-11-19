import { InjectionToken } from '@angular/core';

/**
 * Where the API lives. Relative by default: in production nginx serves every
 * app and /api on the same origin, and locally the dev server proxies /api to
 * the API (see proxy.conf.json). Override it with a provider if that changes.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});
