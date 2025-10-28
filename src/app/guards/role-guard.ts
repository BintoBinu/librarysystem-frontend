import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data?.['role'];
  const userRole = auth.currentUser?.role;

  if (auth.isLoggedIn() && userRole === expectedRole) {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};
