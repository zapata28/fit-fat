import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkoutSession } from "../../core/models";
import { fmtDate, todayStr } from "../../core/utils";

interface DayCell {
  date: string | null; // null = padding cell (outside this month)
  day: number | null;
  isToday: boolean;
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
  imports: [CommonModule],
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
            [class.selected]="cell.date === selectedDate"
            [class.has-session]="cell.sessions.length > 0"
            (click)="cell.date && selectDay(cell.date)"
          >
            <span class="day-num" *ngIf="cell.day">{{ cell.day }}</span>
            <span class="dot" *ngIf="cell.sessions.length > 0"></span>
          </div>
        </div>
      </div>

      <div class="card detail-card" *ngIf="selectedDate">
        <p class="detail-title">{{ fmtDate(selectedDate) }}</p>
        <div *ngIf="selectedSessions.length === 0" class="muted">No entrenaste este día.</div>
        <div *ngFor="let s of selectedSessions" class="session-block">
          <p class="session-name">{{ s.routine_name || "Sesión libre" }}</p>
          <div *ngFor="let ex of s.exercises" class="ex-line">
            <strong>{{ ex.name }}</strong>: {{ formatSets(ex.sets) }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav { display: flex; align-items: center; gap: 8px; }
    .month-label { font-family: var(--font-head); font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; min-width: 140px; text-align: center; }
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
    .day.has-session:not(.selected) { background: rgba(178,59,46,0.08); }
    .dot { width: 5px; height: 5px; border-radius: 50%; background: var(--rust); position: absolute; bottom: 6px; }
    .day.selected .dot { background: #F1ECDD; }
    .detail-card { padding: 16px; }
    .detail-title { font-family: var(--font-head); font-size: 14px; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 10px; }
    .muted { color: var(--ink-soft); font-size: 13px; }
    .session-block { margin-bottom: 12px; }
    .session-name { margin: 0 0 4px; font-size: 12.5px; color: var(--ink-soft); font-family: var(--font-head); text-transform: uppercase; letter-spacing: 0.04em; }
    .ex-line { font-size: 12.5px; margin-bottom: 4px; }
  `],
})
export class CalendarioComponent {
  @Input() sessions: WorkoutSession[] = [];

  viewYear = new Date().getFullYear();
  viewMonth = new Date().getMonth(); // 0-11
  selectedDate: string | null = null;
  dow = DIAS;
  fmtDate = fmtDate;

  get monthLabel(): string {
    return `${MESES_LARGO[this.viewMonth]} ${this.viewYear}`;
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
    for (let i = 0; i < firstDow; i++) cells.push({ date: null, day: null, isToday: false, sessions: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date, day: d, isToday: date === today, sessions: map[date] || [] });
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

  formatSets(sets: { weight: string | number; reps: string | number }[]): string {
    return sets.map((s) => `${s.weight || "–"}kg x${s.reps || "–"}`).join(", ");
  }
}
