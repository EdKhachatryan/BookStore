import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginPayload } from '@app/core/models/auth.model';
import { NotificationService } from '@app/core/ui/notifications/notification.service';
import { AuthStore } from '@modules/auth/data/auth.store';
import { AuthService as OpenApiAuthService, LoginResponseDTO } from '@openapi';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

type LoginResponseCompat = LoginResponseDTO & {
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;

  token?: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(OpenApiAuthService);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly notify = inject(NotificationService);

  public login(payload: LoginPayload): Observable<void> {
    return this.api.login({ loginRequestDTO: payload } as any).pipe(
      map(res => this.normalizeLoginResponse(res as LoginResponseCompat)),
      tap(session => this.authStore.setSession(session)),
      map(() => void 0),
      catchError(err => {
        this.notify.error('auth.snackbar.loginFailed');
        return EMPTY;
      })
    );
  }

  public logout(): void {
    this.authStore.clearSession();
    this.router.navigateByUrl('/');
  }

  private normalizeLoginResponse(res: LoginResponseCompat) {
    const accessToken = res.accessToken ?? res.token;
    const user = (res as any).user;

    if (!accessToken || !user) {
      throw new Error('Invalid login response: missing token/user');
    }

    return {
      accessToken,
      tokenType: res.tokenType ?? 'Bearer',
      expiresIn: res.expiresIn ?? 3600,
      user,
    };
  }
}
