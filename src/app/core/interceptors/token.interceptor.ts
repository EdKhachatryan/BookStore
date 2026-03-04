import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '@modules/auth/data/auth.store';
import { AuthService } from '@modules/auth/services/auth.service';
import { catchError, throwError } from 'rxjs';

function isAuthLogin(url: string): boolean {
  return url.includes('/v1/auth/login');
}

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);
  const auth = inject(AuthService);

  if (isAuthLogin(req.url)) {
    return next(req);
  }

  const token = store.token();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err?.status === 401) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
