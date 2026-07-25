import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { todayStr } from "../core/utils";

interface MiniDayCell {
  date: string | null;
  day: number | null;
  isToday: boolean;
  trained: boolean;
}

const MESES_LARGO = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

@Component({
  selector: "app-mini-calendar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mini-cal">
      <div class="nav">
        <button type="button" class="nav-btn" (click)="prevMonth()">‹</button>
        <span class="label">{{ monthLabel }}</span>
        <button type="button" class="nav-btn" (click)="nextMonth()">›</button>
      </div>
      <div class="dow-row">
        <span *ngFor="let d of dow">{{ d }}</span>
      </div>
      <div class="days-grid">
        <div *ngFor="let cell of cells" class="day" [class.empty]="!cell.date" [class.today]="cell.isToday" [class.trained]="cell.trained">
          {{ cell.day || "" }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mini-cal { width: 100%; max-width: 220px; }
    .nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .nav-btn { background: none; border: none; cursor: pointer; font-size: 14px; color: var(--ink-soft); padding: 2px 6px; }
    .label { font-family: var(--font-head); font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink-soft); }
    .dow-row { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 3px; }
    .dow-row span { text-align: center; font-size: 9px; color: var(--ink-soft); }
    .days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
    .day {
      aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 10px;
      border-radius: 4px; background: var(--paper-card); border: 1px solid var(--paper-line); color: var(--ink-soft);
    }
    .day.empty { border-color: transparent; background: transparent; }
    .day.today { border-color: var(--iron); border-width: 1.5px; }
    .day.trained { background: #4C7A3E; color: #F1ECDD; border-color: #4C7A3E; font-weight: 600; }
  `],
})
export class MiniCalendarComponent {
  @Input() dates: string[] = [];

  viewYear = new Date().getFullYear();
  viewMonth = new Date().getMonth();

  get monthLabel(): string {
    return `${MESES_LARGO[this.viewMonth]} ${this.viewYear}`;
  }

  get cells(): MiniDayCell[] {
    const trainedSet = new Set(this.dates);
    const today = todayStr();
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const firstDow = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();

    const cells: MiniDayCell[] = [];
    for (let i = 0; i < firstDow; i++) cells.push({ date: null, day: null, isToday: false, trained: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date, day: d, isToday: date === today, trained: trainedSet.has(date) });
    }
    return cells;
  }

  prevMonth() {
    this.viewMonth--;
    if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
  }
  nextMonth() {
    this.viewMonth++;
    if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
  }

  dow = DIAS;
}
