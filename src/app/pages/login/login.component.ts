import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { ApiService } from "../../core/api.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="screen">
      <form class="card" (ngSubmit)="submit()">
        <div class="brand">
          <span class="dumbbell">🏋</span>
          <h1>FIT-FAT</h1>
        </div>
        <div class="fields">
          <label>
            <span class="field-label">Usuario</span>
            <input class="input" name="username" [(ngModel)]="username" autocomplete="username" required />
          </label>
          <label>
            <span class="field-label">Contraseña</span>
            <input class="input" type="password" name="password" [(ngModel)]="password" autocomplete="current-password" required />
          </label>
          <p *ngIf="error" class="error">{{ error }}</p>
          <button class="btn-primary" type="submit" [disabled]="loading">{{ loading ? "Entrando..." : "Entrar" }}</button>
        </div>
        <p class="switch">¿No tienes cuenta? <a routerLink="/register">Regístrate</a></p>
      </form>
    </div>
  `,
  styles: [`
    .screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--iron); }
    .card { width: 320px; padding: 28px; }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; justify-content: center; }
    .dumbbell { font-size: 24px; }
    h1 { font-family: var(--font-head); font-size: 24px; text-transform: uppercase; margin: 0; }
    .fields { display: flex; flex-direction: column; gap: 12px; }
    label { display: flex; flex-direction: column; gap: 4px; }
    .error { color: var(--rust); font-size: 12.5px; margin: 0; }
    .btn-primary { justify-content: center; margin-top: 6px; }
    .switch { font-size: 12.5px; text-align: center; margin-top: 16px; color: var(--ink-soft); }
    .switch a { color: var(--rust); font-weight: 600; }
  `],
})
export class LoginComponent {
  username = "";
  password = "";
  error = "";
  loading = false;

  constructor(private api: ApiService, private router: Router) {}

  async submit() {
    this.error = "";
    this.loading = true;
    try {
      await this.api.login(this.username, this.password);
      this.router.navigateByUrl("/");
    } catch (err: any) {
      this.error = err?.error?.error || "Error al iniciar sesión";
    } finally {
      this.loading = false;
    }
  }
}
