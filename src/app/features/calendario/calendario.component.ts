import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkoutSession, SessionExercise, ExercisePhoto } from "../../core/models";
import { fmtDate, todayStr } from "../../core/utils";
import { findPhoto } from "../../core/exercise-library";
import { ExerciseIllustrationComponent } from "../../shared/exercise-illustration.component";

type DayStatus = "trained" | "missed" | "future" | null;

interface DayCell {
  date: string | null; // null = padding cell (outside this month)
  day: number | null;
  isToday: boolean;
  status: DayStatus;
  sessions: WorkoutSession[];
}

const MESES_LARGO = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

@Component({
  selector: "app-calendario",
  standalone: true,
  imports: [CommonModule, ExerciseIllustrationComponent],
  template: `
    <div>
      <div class="section-title">
        <h2>Calendario</h2>
        <div class="nav">
          <button class="btn-ghost" (click)="prevMonth()">‹</button>
          <span class="month-label">{{ monthLabel }}</span>
          <button class="btn-ghost" (click)="nextMonth()">›</button>
          <button class="btn-ghost" (click)="goToday()">Hoy</button>
        </div>
      </div>

      <div class="legend-mini">
        <span class="legend-item"><span class="legend-dot legend-dot-green"></span> Entrenaste</span>
        <span class="legend-item"><span class="legend-dot legend-dot-red"></span> No entrenaste</span>
      </div>

      <div class="card grid-card">
        <div class="dow-row">
          <span *ngFor="let d of dow">{{ d }}</span>
        </div>
        <div class="days-grid">
          <div
            *ngFor="let cell of cells"
            class="day"
            [class.empty]="!cell.date"
            [class.today]="cell.isToday"
            [class.selected]="cell.date && cell.date === selectedDate"
            (click)="cell.date && selectDay(cell.date)"
          >
            <span class="day-num" *ngIf="cell.day">{{ cell.day }}</span>
            <span class="dot dot-green" *ngIf="cell.status === 'trained'"></span>
            <span class="dot dot-red" *ngIf="cell.status === 'missed'"></span>
          </div>
        </div>
      </div>

      <div class="detail-wrap" *ngIf="selectedDate">
        <p class="detail-title">{{ fmtDate(selectedDate) }}</p>
        <p *ngIf="selectedSessions.length === 0" class="muted">No entrenaste este día.</p>
        <div *ngFor="let s of selectedSessions" class="session-block">
          <p class="session-name">{{ s.routine_name || "Sesión libre" }}</p>
          <div class="card ex-row" *ngFor="let ex of s.exercises">
            <app-exercise-illustration [name]="ex.name" [size]="36" [photoUrl]="photoUrlFor(ex.name)" [editable]="false"></app-exercise-illustration>
            <span class="ex-name">{{ ex.name }}</span>
            <span class="ex-weight">{{ formatMaxWeight(ex.sets) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav { display: flex; align-items: center; gap: 8px; }
    .month-label { font-family: var(--font-head); font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; min-width: 140px; text-align: center; }
    .legend-mini { display: flex; gap: 16px; margin-bottom: 12px; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink-soft); }
    .legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
    .legend-dot-green { background: #4C7A3E; }
    .legend-dot-red { background: var(--rust); }
    .grid-card { padding: 16px; margin-bottom: 20px; }
    .dow-row { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 6px; }
    .dow-row span { text-align: center; font-size: 10.5px; color: var(--ink-soft); font-family: var(--font-head); text-transform: uppercase; letter-spacing: 0.04em; }
    .days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
    .day {
      aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      border-radius: 6px; border: 1.5px solid var(--paper-line); cursor: pointer; position: relative;
      font-size: 12.5px; background: var(--paper-card);
    }
    .day.empty { border-color: transparent; cursor: default; background: transparent; }
    .day.today { border-color: var(--iron); border-width: 2px; }
    .day.selected { background: var(--iron); color: #F1ECDD; }
    .dot { width: 6px; height: 6px; border-radius: 50%; position: absolute; bottom: 6px; }
    .dot-green { background: #4C7A3E; }
    .dot-red { background: var(--rust); }
    .day.selected .dot-green { background: #8FD17A; }
    .day.selected .dot-red { background: #F0A99A; }
    .detail-wrap { }
    .detail-title { font-family: var(--font-head); font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 10px; }
    .muted { color: var(--ink-soft); font-size: 13px; }
    .session-block { margin-bottom: 16px; }
    .session-name { margin: 0 0 8px; font-size: 12.5px; color: var(--ink-soft); font-family: var(--font-head); text-transform: uppercase; letter-spacing: 0.04em; }
    .ex-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 8px; }
    .ex-name { flex: 1; font-family: var(--font-head); font-size: 13.5px; }
    .ex-weight { font-family: var(--font-mono); font-size: 13px; color: var(--rust); font-weight: 600; white-space: nowrap; }
  `],
})
export class CalendarioComponent {
  @Input() sessions: WorkoutSession[] = [];
  @Input() photos: ExercisePhoto[] = [];

  viewYear = new Date().getFullYear();
  viewMonth = new Date().getMonth(); // 0-11
  selectedDate: string | null = null;
  dow = DIAS;
  fmtDate = fmtDate;

  get monthLabel(): string {
    return `${MESES_LARGO[this.viewMonth]} ${this.viewYear}`;
  }

  photoUrlFor(name: string): string | null {
    return findPhoto(name, this.photos);
  }

  private sessionsByDate(): Record<string, WorkoutSession[]> {
    const map: Record<string, WorkoutSession[]> = {};
    for (const s of this.sessions) {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    }
    return map;
  }

  get cells(): DayCell[] {
    const map = this.sessionsByDate();
    const today = todayStr();
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const firstDow = (first.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();

    const cells: DayCell[] = [];
    for (let i = 0; i < firstDow; i++) cells.push({ date: null, day: null, isToday: false, status: null, sessions: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const daySessions = map[date] || [];
      let status: DayStatus;
      if (date > today) status = "future";
      else status = daySessions.length > 0 ? "trained" : "missed";
      cells.push({ date, day: d, isToday: date === today, status, sessions: daySessions });
    }
    return cells;
  }

  get selectedSessions(): WorkoutSession[] {
    if (!this.selectedDate) return [];
    return this.sessions.filter((s) => s.date === this.selectedDate);
  }

  prevMonth() {
    this.viewMonth--;
    if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
  }
  nextMonth() {
    this.viewMonth++;
    if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
  }
  goToday() {
    const d = new Date();
    this.viewYear = d.getFullYear();
    this.viewMonth = d.getMonth();
    this.selectedDate = todayStr();
  }

  selectDay(date: string) {
    this.selectedDate = this.selectedDate === date ? null : date;
  }

  formatMaxWeight(sets: { weight: string | number; reps: string | number }[]): string {
    const weights = sets.map((s) => parseFloat(String(s.weight))).filter((w) => isFinite(w));
    if (weights.length === 0) return "–";
    return `${Math.max(...weights)} kg`;
  }
}
