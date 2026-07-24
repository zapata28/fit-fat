import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { ApiService } from "./api.service";

export const authGuard: CanActivateFn = async () => {
  const api = inject(ApiService);
  const router = inject(Router);
  try {
    await api.me();
    return true;
  } catch {
    return router.parseUrl("/login");
  }
};
