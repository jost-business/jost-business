import { Directive, inject } from '@angular/core';
import { AuthStore } from '../state/auth.store';
import { loginHref } from '../state/login-page';

/**
 * What the desktop and the mobile header share about the login: the state,
 * and logging in and out from any page of any app.
 */
@Directive()
export abstract class HeaderAuth {
  protected readonly auth = inject(AuthStore);

  /**
   * Opens the login page and remembers the current page. Read on click, not
   * when rendering: the app around the header changes the URL on its own.
   */
  protected logIn(event: MouseEvent): void {
    // Let the browser handle Ctrl/Cmd-click and middle-click (new tab)
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    const { pathname, search } = window.location;
    window.location.assign(loginHref(pathname + search));
  }

  protected logOut(): void {
    this.auth.logout().subscribe();
  }
}
