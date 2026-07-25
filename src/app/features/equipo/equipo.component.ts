import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../core/api.service";
import { TeamMember, ShareTarget } from "../../core/models";
import { fmtDate } from "../../core/utils";
import { MiniCalendarComponent } from "../../shared/mini-calendar.component";

@Component({
  selector: "app-equipo",
  standalone: true,
  imports: [CommonModule, MiniCalendarComponent],
  template: `
    <div>
      <div class="section-title">
        <h2>Equipo</h2>
        <button class="btn-ghost" (click)="loadAll()">Actualizar</button>
      </div>

      <p *ngIf="error" class="error">{{ error }}</p>

      <div class="card share-card">
        <p class="share-title">¿Quién puede verte a ti?</p>
        <p class="hint">Marca a las personas que quieres que te vean en su pestaña Equipo. Nadie más podrá ver tus datos.</p>
        <p *ngIf="shareTargets === null" class="muted">Cargando...</p>
        <p *ngIf="shareTargets && shareTargets.length === 0" class="muted">Aún no hay más usuarios registrados.</p>
        <div class="share-list" *ngIf="shareTargets && shareTargets.length > 0">
          <label class="share-row" *ngFor="let t of shareTargets">
            <input type="checkbox" [checked]="t.shared" (change)="toggleShare(t)" [disabled]="busyId === t.id" />
            <span>{{ t.username }}</span>
          </label>
        </div>
      </div>

      <p *ngIf="team === null" class="muted top-gap">Cargando equipo...</p>
      <p *ngIf="team && team.length === 0" class="muted top-gap">Nadie te ha compartido su equipo todavía (aparte de ti).</p>

      <div class="list top-gap" *ngIf="team && team.length > 0">
        <div class="card member" *ngFor="let m of team">
          <div class="member-head">
            <h3>{{ m.username }}<span class="me-badge" *ngIf="m.isMe">tú</span></h3>
            <div class="head-right">
              <span class="muted">{{ m.sessionCount }} sesiones</span>
              <button type="button" class="btn-ghost cal-toggle" (click)="toggleCalendar(m.username)">
                📅 {{ openCalendar === m.username ? "Ocultar" : "Calendario" }}
              </button>
            </div>
          </div>

          <app-mini-calendar *ngIf="openCalendar === m.username" [dates]="m.trainingDates" class="mini-cal-wrap"></app-mini-calendar>

          <div class="cols">
            <div>
              <p class="col-label">Peso</p>
              <p class="value">{{ m.latestWeight ? m.latestWeight + " kg" : "—" }}</p>
              <p class="sub" *ngIf="m.latestDate">{{ fmtDate(m.latestDate) }}</p>
            </div>
            <div>
              <p class="col-label">Récords</p>
              <p *ngIf="m.prs.length === 0" class="value small muted">—</p>
              <p *ngFor="let p of m.prs.slice(0, 3)" class="value small">{{ p.name }}: <strong>{{ p.weight }} kg</strong></p>
            </div>
            <div>
              <p class="col-label">Sesiones recientes</p>
              <p *ngIf="m.recentSessions.length === 0" class="value small muted">—</p>
              <p *ngFor="let s of m.recentSessions" class="value small">{{ fmtDate(s.date) }} · {{ s.routineName || "Libre" }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .muted { color: var(--ink-soft); font-size: 13px; }
    .error { color: var(--rust); font-size: 13px; }
    .top-gap { margin-top: 20px; }
    .share-card { padding: 16px; }
    .share-title { margin: 0 0 4px; font-family: var(--font-head); font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; }
    .hint { margin: 0 0 12px; font-size: 12px; color: var(--ink-soft); }
    .share-list { display: flex; flex-direction: column; gap: 8px; }
    .share-row { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
    .list { display: flex; flex-direction: column; gap: 16px; }
    .member { padding: 16px; }
    .member-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
    .head-right { display: flex; align-items: center; gap: 10px; }
    .cal-toggle { font-size: 11px; padding: 5px 10px; }
    h3 { font-family: var(--font-head); font-size: 17px; text-transform: uppercase; margin: 0; display: flex; align-items: center; gap: 8px; }
    .me-badge { font-size: 10px; background: var(--iron); color: #F1ECDD; padding: 2px 6px; border-radius: 3px; letter-spacing: 0.04em; }
    .mini-cal-wrap { display: block; margin-bottom: 14px; padding: 10px; background: var(--paper-card); border: 1.5px solid var(--paper-line); border-radius: 6px; }
    .cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .col-label { font-size: 10.5px; color: var(--ink-soft); font-family: var(--font-head); text-transform: uppercase; margin: 0 0 4px; }
    .value { margin: 0; font-size: 15px; }
    .value.small { font-size: 12px; }
    .sub { margin: 0; font-size: 10.5px; color: var(--ink-soft); }
  `],
})
export class EquipoComponent implements OnInit {
  team: TeamMember[] | null = null;
  shareTargets: ShareTarget[] | null = null;
  busyId: string | null = null;
  error = "";
  openCalendar: string | null = null;
  fmtDate = fmtDate;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadAll();
  }

  async loadAll() {
    this.error = "";
    try {
      const [team, shares] = await Promise.all([this.api.getTeam(), this.api.getShareList()]);
      this.team = team;
      this.shareTargets = shares;
    } catch (err: any) {
      const msg = err?.error?.error;
      this.error = typeof msg === "string" ? msg : "No se pudo cargar el equipo. Revisa los logs de Vercel.";
    }
  }

  toggleCalendar(username: string) {
    this.openCalendar = this.openCalendar === username ? null : username;
  }

  async toggleShare(t: ShareTarget) {
    this.busyId = t.id;
    try {
      if (t.shared) {
        await this.api.revokeShare(t.id);
      } else {
        await this.api.grantShare(t.id);
      }
      t.shared = !t.shared;
    } finally {
      this.busyId = null;
    }
  }
}
