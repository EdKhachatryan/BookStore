import { computed, effect, Injectable, signal } from '@angular/core';
import { AuthUser, LoginResponse } from '@app/core/models/auth.model';

const LS_TOKEN = 'mxs.auth.token';
const LS_USER = 'mxs.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _token = signal<string | null>(this.readToken());
  private readonly _user = signal<AuthUser | null>(this.readUser());

  public readonly token = computed(() => this._token());
  public readonly user = computed(() => this._user());

  public readonly isLoggedIn = computed(() => !!this._token() && !!this._user());

  public readonly canManageBooks = computed(() => this.isLoggedIn());

  public constructor() {
    effect(() => {
      const t = this._token();
      if (t) localStorage.setItem(LS_TOKEN, t);
      else localStorage.removeItem(LS_TOKEN);
    });

    effect(() => {
      const u = this._user();
      if (u) localStorage.setItem(LS_USER, JSON.stringify(u));
      else localStorage.removeItem(LS_USER);
    });
  }

  public setSession(res: LoginResponse): void {
    this._token.set(res.accessToken);
    this._user.set(res.user);
  }

  public clearSession(): void {
    this._token.set(null);
    this._user.set(null);
  }

  private readToken(): string | null {
    return localStorage.getItem(LS_TOKEN);
  }

  private readUser(): AuthUser | null {
    const raw = localStorage.getItem(LS_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
