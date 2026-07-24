import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { WorkoutSession, Measurement } from "../../core/models";
import { fmtDate, fmtMonth, fmtWeek, monthKey, weekKey } from "../../core/utils";
import { LineChartComponent, ChartPoint } from "../../shared/line-chart.component";

@Component({
  selector: "app-resumen",
  standalone: true,
  imports: [CommonModule, FormsModule, LineChartComponent],
  template: `
    <div>
      <div class="section-title"><h2>Resumen</h2></div>

      <div class="stats-grid">
        <div class="card stat">
          <p class="stat-label">Peso actual</p>
          <p class="stat-value">{{ latestWeight ? latestWeight + ' kg' : '—' }}</p>
          <p class="stat-sub" *ngIf="weightDelta">{{ +weightDelta! > 0 ? '+' : '' }}{{ weightDelta }} kg</p>
        </div>
        <div class="card stat">
          <p class="stat-label">Sesiones</p>
          <p class="stat-value">{{ sessions.length }}</p>
          <p class="stat-sub">registradas</p>
        </div>
        <div class="card stat">
          <p class="stat-label">Mediciones</p>
          <p class="stat-value">{{ measurements.length }}</p>
          <p class="stat-sub">registradas</p>
        </div>
      </div>

      <div class="card chart-card">
        <p class="chart-title">Peso corporal por mes</p>
        <app-line-chart [points]="monthlyWeightPoints" color="var(--rust)" emptyMessage="Registra tu peso al menos dos meses seguidos para ver la tendencia."></app-line-chart>
      </div>

      <div class="card chart-card">
        <div class="chart-header">
          <p class="chart-title">Progreso semanal por ejercicio</p>
          <select *ngIf="exerciseNames.length" class="input select" [(ngModel)]="selectedExercise">
            <option *ngFor="let n of exerciseNames" [value]="n">{{ n }}</option>
          </select>
        </div>
        <app-line-chart [points]="weeklyPoints" color="var(--iron)" [emptyMessage]="exerciseNames.length === 0 ? 'Registra sesiones para ver el progreso por ejercicio.' : 'Necesitas al menos dos semanas registradas de este ejercicio.'"></app-line-chart>
      </div>

      <div class="two-col">
        <div>
          <p class="col-title">Últimos récords</p>
          <p *ngIf="prs.length === 0" class="muted">Aún sin récords registrados.</p>
          <div *ngFor="let p of prs" class="pr-row">
            <span>{{ p.name }}</span>
            <span><strong>{{ p.weight }} kg</strong> 🏅</span>
          </div>
        </div>
        <div>
          <p class="col-title">Sesiones recientes</p>
          <p *ngIf="sortedSessions.length === 0" class="muted">Aún no registras sesiones.</p>
          <div *ngFor="let s of sortedSessions.slice(0, 5)" class="session-row">
            <strong>{{ fmtDate(s.date) }}</strong> — {{ s.routine_name || 'Sesión libre' }} · {{ s.exercises.length }} ejerc.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .stat { padding: 12px 14px; }
    .stat-label { margin: 0; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); font-family: var(--font-head); }
    .stat-value { margin: 4px 0 0; font-size: 24px; font-weight: 600; }
    .stat-sub { margin: 0; font-size: 11px; color: var(--ink-soft); }
    .chart-card { padding: 16px 8px 8px; margin-bottom: 24px; }
    .chart-title { margin: 0 0 8px 16px; font-family: var(--font-head); font-size: 12px; letter-spacing: 0.06em; color: var(--ink-soft); text-transform: uppercase; }
    .chart-header { display: flex; align-items: center; justify-content: space-between; margin: 0 16px 8px; }
    .select { width: 180px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .col-title { font-family: var(--font-head); font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 10px; }
    .muted { font-size: 13px; color: var(--ink-soft); }
    .pr-row, .session-row { font-size: 13px; border-bottom: 1px dashed var(--paper-line); padding-bottom: 6px; margin-bottom: 8px; }
    .pr-row { display: flex; align-items: center; justify-content: space-between; }
  `],
})
export class ResumenComponent {
  @Input() sessions: WorkoutSession[] = [];
  @Input() measurements: Measurement[] = [];

  fmtDate = fmtDate;
  selectedExercise = "";

  get monthlyWeightPoints(): ChartPoint[] {
    const byMonth: Record<string, { date: string; weight: number }> = {};
    for (const m of this.measurements) {
      if (m.weight === null || m.weight === undefined) continue;
      const k = monthKey(m.date);
      if (!byMonth[k] || m.date > byMonth[k].date) byMonth[k] = { date: m.date, weight: Number(m.weight) };
    }
    return Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => ({ label: fmtMonth(k), value: v.weight }));
  }

  private get sortedMeasurements(): Measurement[] {
    return [...this.measurements].sort((a, b) => a.date.localeCompare(b.date));
  }

  get latestWeight(): number | null {
    const arr = this.sortedMeasurements;
    return (arr[arr.length - 1]?.weight as number) ?? null;
  }

  get weightDelta(): string | null {
    const arr = this.sortedMeasurements;
    const latest = arr[arr.length - 1];
    const prev = arr[arr.length - 2];
    if (latest?.weight && prev?.weight) return (Number(latest.weight) - Number(prev.weight)).toFixed(1);
    return null;
  }

  get sortedSessions(): WorkoutSession[] {
    return [...this.sessions].sort((a, b) => b.date.localeCompare(a.date));
  }

  get prs(): { name: string; weight: number; date: string }[] {
    const list: { name: string; weight: number; date: string }[] = [];
    const seen: Record<string, number> = {};
    for (const sess of [...this.sessions].sort((a, b) => a.date.localeCompare(b.date))) {
      for (const ex of sess.exercises) {
        for (const set of ex.sets) {
          const w = parseFloat(String(set.weight));
          if (!isFinite(w)) continue;
          if (!seen[ex.name] || w > seen[ex.name]) {
            seen[ex.name] = w;
            list.push({ name: ex.name, weight: w, date: sess.date });
          }
        }
      }
    }
    return list.slice(-5).reverse();
  }

  get exerciseNames(): string[] {
    const names = new Set<string>();
    this.sessions.forEach((s) => s.exercises.forEach((e) => names.add(e.name)));
    const arr = Array.from(names).sort();
    if (!this.selectedExercise && arr.length) this.selectedExercise = arr[0];
    return arr;
  }

  get weeklyPoints(): ChartPoint[] {
    if (!this.selectedExercise) return [];
    const byWeek: Record<string, number> = {};
    for (const s of this.sessions) {
      const k = weekKey(s.date);
      for (const ex of s.exercises) {
        if (ex.name !== this.selectedExercise) continue;
        for (const set of ex.sets) {
          const w = parseFloat(String(set.weight));
          if (!isFinite(w)) continue;
          if (!byWeek[k] || w > byWeek[k]) byWeek[k] = w;
        }
      }
    }
    return Object.entries(byWeek)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => ({ label: fmtWeek(k), value: v }));
  }
}
