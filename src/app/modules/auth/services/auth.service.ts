import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginPayload } from '@app/core/models/auth.model';
import { NotificationService } from '@app/core/ui/notifications/notification.service';
import { AuthStore } from '@modules/auth/data/auth.store';
import { AuthService as OpenApiAuthService, LoginResponseDTO } from '@openapi';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(OpenApiAuthService);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly notify = inject(NotificationService);

  public login(payload: LoginPayload): Observable<void> {
    return this.api.login({ loginRequestDTO: payload } as any).pipe(
      tap((res: LoginResponseDTO) => {
        const anyRes = res as any;

        const accessToken: string | undefined = anyRes.accessToken ?? anyRes.token;
        const user = anyRes.user;

        if (!accessToken || !user) {
          throw new Error('Invalid login response: missing token/user');
        }

        this.authStore.setSession({
          accessToken,
          tokenType: anyRes.tokenType ?? 'Bearer',
          expiresIn: anyRes.expiresIn ?? 3600,
          user,
        });
      }),
      map(() => void 0),
      catchError(() => {
        this.notify.error('auth.snackbar.loginFailed');
        return EMPTY;
      })
    );
  }

  public logout(): void {
    this.authStore.clearSession();
    this.router.navigateByUrl('/');
  }
}
