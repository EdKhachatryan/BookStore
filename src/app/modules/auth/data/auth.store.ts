import { computed, effect, Injectable, signal } from '@angular/core';
import { AuthUser, LoginResponse } from '@app/core/models/auth.model';

const LS_SESSION = 'mxs.auth.session';

type AuthSession = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _session = signal<AuthSession | null>(this.readSession());

  public readonly token = computed(() => this._session()?.accessToken ?? null);
  public readonly user = computed(() => this._session()?.user ?? null);

  public readonly isLoggedIn = computed(() => !!this._session()?.accessToken && !!this._session()?.user);

  public constructor() {
    effect(() => {
      const s = this._session();
      if (typeof localStorage === 'undefined') return;

      if (s) localStorage.setItem(LS_SESSION, JSON.stringify(s));
      else localStorage.removeItem(LS_SESSION);
    });
  }

  public setSession(res: LoginResponse): void {
    this._session.set({
      accessToken: res.accessToken,
      tokenType: res.tokenType ?? 'Bearer',
      expiresIn: res.expiresIn ?? 3600,
      user: res.user,
    });
  }

  public clearSession(): void {
    this._session.set(null);
  }

  private readSession(): AuthSession | null {
    if (typeof localStorage === 'undefined') return null;

    const raw = localStorage.getItem(LS_SESSION);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as AuthSession;
      if (!parsed?.accessToken || !parsed?.user) return null;
      return parsed;
    } catch {
      return null;
    }
  }
}
