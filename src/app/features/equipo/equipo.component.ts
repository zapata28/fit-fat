import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import { TeamMember, ShareTarget } from "../../core/models";
import { fmtDate, normalize } from "../../core/utils";
import { MiniCalendarComponent } from "../../shared/mini-calendar.component";

@Component({
  selector: "app-equipo",
  standalone: true,
  imports: [CommonModule, FormsModule, MiniCalendarComponent],
  template: `
    <div>
      <div class="section-title">
        <h2>Equipo</h2>
        <button class="btn-ghost" (click)="loadAll()">Actualizar</button>
      </div>

      <p *ngIf="error" class="error">{{ error }}</p>

      <div class="card share-card">
        <div class="share-head" (click)="showShare = !showShare">
          <span class="chevron" [class.open]="showShare">›</span>
          <p class="share-title">¿Quién puede verte a ti?</p>
          <span class="shared-count" *ngIf="sharedList.length > 0">{{ sharedList.length }}</span>
        </div>

        <div class="share-body" *ngIf="showShare">
          <p class="hint">Busca y agrega a las personas que quieres que te vean en su pestaña Equipo. Nadie más podrá ver tus datos.</p>

          <div class="chips" *ngIf="sharedList.length > 0">
            <span class="chip" *ngFor="let t of sharedList">
              {{ t.username }}
              <button type="button" class="chip-x" (click)="toggleShare(t)" [disabled]="busyId === t.id" title="Quitar">✕</button>
            </span>
          </div>

          <div class="search-wrap">
            <input
              class="input"
              placeholder="Buscar usuario..."
              [(ngModel)]="searchTerm"
            />
            <div class="search-results" *ngIf="searchTerm.trim() && matches.length > 0">
              <button type="button" class="result-row" *ngFor="let t of matches" (click)="addShare(t)" [disabled]="busyId === t.id">
                {{ t.username }}
              </button>
            </div>
            <p class="no-results" *ngIf="searchTerm.trim() && matches.length === 0">Sin resultados.</p>
          </div>

          <p *ngIf="shareTargets === null" class="muted">Cargando...</p>
          <p *ngIf="shareTargets && shareTargets.length === 0" class="muted">Aún no hay más usuarios registrados.</p>
        </div>
      </div>

      <p *ngIf="team === null" class="muted top-gap">Cargando equipo...</p>
      <p *ngIf="team && team.length === 0" class="muted top-gap">Nadie te ha compartido su equipo todavía (aparte de ti).</p>

      <div class="list top-gap" *ngIf="team && team.length > 0">
        <div class="card member" *ngFor="let m of team">
          <div class="member-head">
            <button type="button" class="member-toggle" (click)="toggleExpand(m.username)">
              <span class="chevron" [class.open]="expanded === m.username">›</span>
              <h3>{{ m.username }}<span class="me-badge" *ngIf="m.isMe">tú</span></h3>
            </button>
            <button type="button" class="btn-ghost cal-toggle" (click)="toggleCalendar(m.username)">
              📅 {{ openCalendar === m.username ? "Ocultar" : "Calendario" }}
            </button>
          </div>

          <app-mini-calendar *ngIf="openCalendar === m.username" [dates]="m.trainingDates" class="mini-cal-wrap"></app-mini-calendar>

          <div class="cols" *ngIf="expanded === m.username">
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

    .share-card { padding: 0; }
    .share-head { display: flex; align-items: center; gap: 10px; padding: 14px 16px; cursor: pointer; }
    .share-title { margin: 0; font-family: var(--font-head); font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; flex: 1; }
    .shared-count { font-size: 11px; background: var(--iron); color: #F1ECDD; border-radius: 10px; padding: 1px 8px; }
    .share-body { padding: 0 16px 16px; border-top: 1px dashed var(--paper-line); padding-top: 14px; }
    .hint { margin: 0 0 12px; font-size: 12px; color: var(--ink-soft); }

    .chevron { display: inline-block; transition: transform 0.15s; font-size: 16px; color: var(--ink-soft); }
    .chevron.open { transform: rotate(90deg); }

    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .chip {
      display: inline-flex; align-items: center; gap: 6px; font-size: 12px;
      background: var(--paper-card); border: 1.5px solid var(--paper-line); border-radius: 14px; padding: 4px 6px 4px 12px;
    }
    .chip-x { background: none; border: none; color: var(--rust); cursor: pointer; padding: 0; font-size: 11px; }

    .search-wrap { position: relative; margin-bottom: 4px; }
    .search-results {
      position: absolute; top: 100%; left: 0; right: 0; z-index: 5; margin-top: 4px;
      background: var(--paper-card); border: 1.5px solid var(--paper-line); border-radius: 6px; overflow: hidden;
      box-shadow: 0 6px 18px rgba(0,0,0,0.12); max-height: 200px; overflow-y: auto;
    }
    .result-row {
      display: block; width: 100%; text-align: left; background: none; border: none; padding: 9px 12px;
      font-size: 13px; cursor: pointer; color: var(--ink);
    }
    .result-row:hover { background: rgba(178,59,46,0.08); }
    .no-results { font-size: 12px; color: var(--ink-soft); margin: 6px 2px 0; }

    .list { display: flex; flex-direction: column; gap: 16px; }
    .member { padding: 16px; }
    .member-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; gap: 8px; }
    .member-toggle { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; }
    .cal-toggle { font-size: 11px; padding: 5px 10px; }
    h3 { font-family: var(--font-head); font-size: 17px; text-transform: uppercase; margin: 0; display: flex; align-items: center; gap: 8px; }
    .me-badge { font-size: 10px; background: var(--iron); color: #F1ECDD; padding: 2px 6px; border-radius: 3px; letter-spacing: 0.04em; }
    .mini-cal-wrap { display: block; margin-bottom: 14px; padding: 10px; background: var(--paper-card); border: 1.5px solid var(--paper-line); border-radius: 6px; }
    .cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--paper-line); }
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
  expanded: string | null = null;
  showShare = false;
  searchTerm = "";
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

  get sharedList(): ShareTarget[] {
    return (this.shareTargets || []).filter((t) => t.shared);
  }

  get matches(): ShareTarget[] {
    const q = normalize(this.searchTerm);
    if (!q) return [];
    return (this.shareTargets || []).filter((t) => !t.shared && normalize(t.username).includes(q));
  }

  toggleCalendar(username: string) {
    this.openCalendar = this.openCalendar === username ? null : username;
  }

  toggleExpand(username: string) {
    this.expanded = this.expanded === username ? null : username;
  }

  async addShare(t: ShareTarget) {
    await this.toggleShare(t);
    this.searchTerm = "";
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
