import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '@modules/auth/data/auth.store';
import { AuthService } from '@modules/auth/services/auth.service';
import { catchError, throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);
  const auth = inject(AuthService);

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
