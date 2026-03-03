import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NotificationService } from '@app/core/ui/notifications/notification.service';
import { AuthStore } from '@modules/auth/data/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const notify = inject(NotificationService);

  if (authStore.isLoggedIn()) {
    return true;
  }

  notify.warning('auth.loginRequired');
  return router.parseUrl('/');
};
