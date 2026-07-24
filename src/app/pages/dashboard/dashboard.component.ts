import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { ApiService } from "../../core/api.service";
import { Routine, WorkoutSession, Measurement, ExercisePhoto } from "../../core/models";
import { ResumenComponent } from "../../features/resumen/resumen.component";
import { RutinasComponent } from "../../features/rutinas/rutinas.component";
import { RegistrarComponent } from "../../features/registrar/registrar.component";
import { MedidasComponent } from "../../features/medidas/medidas.component";
import { EquipoComponent } from "../../features/equipo/equipo.component";
import { CalendarioComponent } from "../../features/calendario/calendario.component";

type TabId = "resumen" | "rutinas" | "registrar" | "medidas" | "calendario" | "equipo";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, ResumenComponent, RutinasComponent, RegistrarComponent, MedidasComponent, CalendarioComponent, EquipoComponent],
  template: `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-inner">
          <div class="brand">
            <span class="dumbbell">🏋</span>
            <div>
              <h1>Fit Fat</h1>
              <p class="username">{{ username }}</p>
            </div>
          </div>
          <button class="btn-ghost logout" (click)="logout()">Salir</button>
        </div>
        <nav class="tabs">
          <button
            *ngFor="let t of tabs"
            class="tabbtn"
            [class.active]="tab === t.id"
            (click)="tab = t.id"
          >{{ t.label }}</button>
        </nav>
      </header>

      <main class="content">
        <p *ngIf="error" class="error">{{ error }}</p>
        <p *ngIf="!loaded" class="loading">Cargando...</p>
        <ng-container *ngIf="loaded">
          <app-resumen *ngIf="tab === 'resumen'" [sessions]="sessions" [measurements]="measurements"></app-resumen>
          <app-rutinas *ngIf="tab === 'rutinas'" [routines]="routines" (routinesChange)="routines = $event" [photos]="photos" (photosChange)="photos = $event"></app-rutinas>
          <app-registrar *ngIf="tab === 'registrar'" [routines]="routines" [sessions]="sessions" (sessionsChange)="sessions = $event" [photos]="photos" (photosChange)="photos = $event"></app-registrar>
          <app-medidas *ngIf="tab === 'medidas'" [measurements]="measurements" (measurementsChange)="measurements = $event"></app-medidas>
          <app-calendario *ngIf="tab === 'calendario'" [sessions]="sessions"></app-calendario>
          <app-equipo *ngIf="tab === 'equipo'"></app-equipo>
        </ng-container>
      </main>
    </div>
  `,
  styles: [`
    .shell { min-height: 100vh; }
    .topbar { background: var(--iron); padding: 18px 24px 0; }
    .topbar-inner { display: flex; align-items: center; justify-content: space-between; max-width: 960px; margin: 0 auto; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .dumbbell { font-size: 22px; }
    h1 { font-family: var(--font-head); font-weight: 600; font-size: 24px; letter-spacing: 0.04em; color: #F1ECDD; margin: 0; text-transform: uppercase; }
    .username { margin: 0; font-size: 11px; color: #B9C1C3; letter-spacing: 0.08em; }
    .logout { border-color: #B9C1C3; color: #F1ECDD; }
    .tabs { max-width: 960px; margin: 16px auto 0; display: flex; gap: 4px; flex-wrap: wrap; }
    .tabbtn {
      font-family: var(--font-head); text-transform: uppercase; letter-spacing: 0.05em; font-size: 13px;
      padding: 9px 16px; background: transparent; color: #DDE3E4; border: none; border-radius: 6px 6px 0 0; cursor: pointer;
    }
    .tabbtn.active { background: var(--paper); color: var(--ink); }
    .content { max-width: 960px; margin: 0 auto; padding: 28px 24px 60px; }
    .error { color: var(--rust); font-size: 13px; }
    .loading { color: var(--ink-soft); }
  `],
})
export class DashboardComponent implements OnInit {
  username = "";
  tab: TabId = "resumen";
  tabs: { id: TabId; label: string }[] = [
    { id: "resumen", label: "Resumen" },
    { id: "rutinas", label: "Rutinas" },
    { id: "registrar", label: "Registrar" },
    { id: "medidas", label: "Medidas" },
    { id: "calendario", label: "Calendario" },
    { id: "equipo", label: "Equipo" },
  ];

  routines: Routine[] = [];
  sessions: WorkoutSession[] = [];
  measurements: Measurement[] = [];
  photos: ExercisePhoto[] = [];
  loaded = false;
  error = "";

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit() {
    try {
      const me = await this.api.me();
      this.username = me.username;
      const [r, s, m, p] = await Promise.all([
        this.api.getRoutines(),
        this.api.getSessions(),
        this.api.getMeasurements(),
        this.api.getExercisePhotos(),
      ]);
      this.routines = r;
      this.sessions = s;
      this.measurements = m;
      this.photos = p;
    } catch (err: any) {
      this.error = err?.error?.error || "Error al cargar tus datos";
    } finally {
      this.loaded = true;
    }
  }

  async logout() {
    await this.api.logout();
    this.router.navigateByUrl("/login");
  }
}
