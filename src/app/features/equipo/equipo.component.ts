import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../core/api.service";
import { TeamMember } from "../../core/models";
import { fmtDate } from "../../core/utils";

@Component({
  selector: "app-equipo",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="section-title">
        <h2>Equipo</h2>
        <button class="btn-ghost" (click)="load()">Actualizar</button>
      </div>

      <p *ngIf="team === null" class="muted">Cargando equipo...</p>
      <p *ngIf="team && team.length === 0" class="muted">Aún no hay nadie registrado.</p>

      <div class="list" *ngIf="team && team.length > 0">
        <div class="card member" *ngFor="let m of team">
          <div class="member-head">
            <h3>{{ m.username }}</h3>
            <span class="muted">{{ m.sessionCount }} sesiones</span>
          </div>
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
    .list { display: flex; flex-direction: column; gap: 16px; }
    .member { padding: 16px; }
    .member-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    h3 { font-family: var(--font-head); font-size: 17px; text-transform: uppercase; margin: 0; }
    .cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .col-label { font-size: 10.5px; color: var(--ink-soft); font-family: var(--font-head); text-transform: uppercase; margin: 0 0 4px; }
    .value { margin: 0; font-size: 15px; }
    .value.small { font-size: 12px; }
    .sub { margin: 0; font-size: 10.5px; color: var(--ink-soft); }
  `],
})
export class EquipoComponent implements OnInit {
  team: TeamMember[] | null = null;
  fmtDate = fmtDate;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.team = await this.api.getTeam();
  }
}
