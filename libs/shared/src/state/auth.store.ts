import { computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { catchError, map, type Observable, throwError } from 'rxjs';
import { signalStore, withComputed, withMethods, withProps } from '@ngrx/signals';
import type { LoginRequest, SessionDto } from '@jost/models';
import { API_BASE_URL } from '../services/api';

/**
 * Who is logged in. The session itself lives in an httpOnly cookie that this
 * code never sees; the store only asks the API whose session it is.
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },

  withProps(() => {
    const apiBaseUrl = inject(API_BASE_URL);
    return {
      _apiBaseUrl: apiBaseUrl,
      _http: inject(HttpClient),
      _session: httpResource<SessionDto>(() => `${apiBaseUrl}/auth/session`),
    };
  }),

  withComputed(({ _session }) => ({
    user: computed(() => (_session.hasValue() ? _session.value().user : null)),
    /** False until the API has answered whether there is a session. */
    isResolved: computed(() => _session.status() !== 'loading' && _session.status() !== 'idle'),
  })),

  withComputed(({ user }) => ({
    isLoggedIn: computed(() => user() !== null),
  })),

  withMethods(store => ({
    /**
     * Logs in once subscribed to; the API answers with the session cookie.
     * Fails with an Error whose message can be shown to the user.
     */
    login(credentials: LoginRequest): Observable<void> {
      return store._http.post<SessionDto>(`${store._apiBaseUrl}/auth/login`, credentials).pipe(
        map(session => store._session.set(session)),
        catchError(error => throwError(() => new Error(loginErrorMessage(error), { cause: error }))),
      );
    },

    /** Logs out once subscribed to. */
    logout(): Observable<void> {
      return store._http
        .post(`${store._apiBaseUrl}/auth/logout`, null)
        .pipe(map(() => store._session.set({ user: null })));
    },

    /**
     * Forgets the user locally, for example when the API answered 401 because
     * the session expired.
     */
    sessionEnded(): void {
      store._session.set({ user: null });
    },
  })),
);

function loginErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Login failed.';
  switch (error.status) {
    case 401:
      return 'Wrong e-mail or password.';
    case 429:
      return 'Too many attempts. Please wait a minute.';
    case 0:
      return 'No connection to the server.';
    default:
      return 'Login failed. Please try again.';
  }
}
