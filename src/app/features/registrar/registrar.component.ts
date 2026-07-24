import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import { Routine, WorkoutSession, SessionExercise, ExerciseSet } from "../../core/models";
import { todayStr, uid, weekKey, fmtDate } from "../../core/utils";
import { ExerciseIllustrationComponent } from "../../shared/exercise-illustration.component";

interface DraftExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

@Component({
  selector: "app-registrar",
  standalone: true,
  imports: [CommonModule, FormsModule, ExerciseIllustrationComponent],
  template: `
    <div>
      <div class="section-title"><h2>Registrar sesión</h2></div>

      <div class="top-fields">
        <label>
          <span class="field-label">Fecha</span>
          <input type="date" class="input" style="width:160px" [(ngModel)]="date" />
        </label>
        <label>
          <span class="field-label">Rutina (opcional)</span>
          <select class="input" style="width:220px" [ngModel]="routineId" (ngModelChange)="loadFromRoutine($event)">
            <option value="">Sesión libre</option>
            <option *ngFor="let r of routines" [value]="r.id">{{ r.name }}</option>
          </select>
        </label>
      </div>

      <div class="exercises">
        <div class="card ex-card" *ngFor="let ex of exercises">
          <div class="ex-head">
            <app-exercise-illustration [name]="ex.name" [size]="40"></app-exercise-illustration>
            <input class="input name" placeholder="Nombre del ejercicio" [ngModel]="ex.name" (ngModelChange)="ex.name = $event" />
            <div class="max-info">
              <span *ngIf="maxByExercise[ex.name.trim()]">máx histórico: {{ maxByExercise[ex.name.trim()].weight }} kg</span>
              <span *ngIf="weeklyMaxByExercise[ex.name.trim()]">máx esta semana: {{ weeklyMaxByExercise[ex.name.trim()] }} kg</span>
            </div>
            <button class="icon-btn" (click)="removeExercise(ex.id)">🗑</button>
          </div>
          <div class="sets">
            <div class="set-row" *ngFor="let s of ex.sets; let i = index">
              <span class="set-label">Serie {{ i + 1 }}</span>
              <input class="input w80" type="number" placeholder="kg" [ngModel]="s.weight" (ngModelChange)="s.weight = $event" />
              <span class="x">x</span>
              <input class="input w70" type="number" placeholder="reps" [ngModel]="s.reps" (ngModelChange)="s.reps = $event" />
              <span class="stamp" *ngIf="isPR(ex, s)">Récord</span>
              <button class="icon-btn push-right" (click)="removeSet(ex, i)">✕</button>
            </div>
            <button class="btn-ghost small-top" (click)="addSet(ex)">+ Serie</button>
          </div>
        </div>
      </div>

      <div class="save-row">
        <button class="btn-ghost" (click)="addFreeExercise()">+ Ejercicio</button>
        <button class="btn-primary" [disabled]="exercises.length === 0 || saving" (click)="saveSession()">
          {{ saving ? "Guardando..." : "Guardar sesión" }}
        </button>
        <span *ngIf="savedFlash" class="flash">SESIÓN GUARDADA</span>
      </div>

      <div class="history" *ngIf="sortedSessions.length > 0">
        <p class="hist-title">Historial</p>
        <div class="hist-list">
          <div class="card hist-item" *ngFor="let s of sortedSessions">
            <div class="hist-head" (click)="toggleExpand(s.id)">
              <span class="chevron" [class.open]="expanded === s.id">›</span>
              <strong>{{ fmtDate(s.date) }}</strong>
              <span class="muted">{{ s.routine_name || "Sesión libre" }}</span>
              <span class="muted push-right">{{ s.exercises.length }} ejerc.</span>
              <button class="icon-btn" (click)="removeSession(s.id); $event.stopPropagation()">🗑</button>
            </div>
            <div class="hist-body" *ngIf="expanded === s.id">
              <div *ngFor="let ex of s.exercises" class="hist-ex">
                <strong>{{ ex.name }}</strong>: {{ formatSets(ex) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .top-fields { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .top-fields label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
    .exercises { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
    .ex-card { padding: 14px; }
    .ex-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .ex-head .name { flex: 1; font-family: var(--font-head); font-size: 14px; }
    .max-info { display: flex; flex-direction: column; align-items: flex-end; font-size: 10.5px; color: var(--ink-soft); white-space: nowrap; }
    .sets { display: flex; flex-direction: column; gap: 6px; }
    .set-row { display: flex; align-items: center; gap: 8px; border-radius: 4px; padding: 2px 4px; }
    .set-row:hover { background: rgba(178,59,46,0.05); }
    .set-label { font-size: 11px; color: var(--ink-soft); width: 46px; }
    .w80 { width: 80px; }
    .w70 { width: 70px; }
    .x { font-size: 12px; color: var(--ink-soft); }
    .push-right { margin-left: auto; }
    .small-top { align-self: flex-start; margin-top: 4px; }
    .save-row { display: flex; gap: 10px; align-items: center; }
    .flash { font-size: 12px; color: var(--rust); font-family: var(--font-head); letter-spacing: 0.05em; }
    .history { margin-top: 32px; }
    .hist-title { font-family: var(--font-head); font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 10px; border-top: 2px solid var(--ink); padding-top: 16px; }
    .hist-list { display: flex; flex-direction: column; gap: 6px; }
    .hist-item { }
    .hist-head { display: flex; align-items: center; gap: 10px; padding: 9px 12px; cursor: pointer; }
    .chevron { display: inline-block; transition: transform 0.15s; font-size: 16px; color: var(--ink-soft); }
    .chevron.open { transform: rotate(90deg); }
    .muted { font-size: 12px; color: var(--ink-soft); }
    .hist-body { border-top: 1px dashed var(--paper-line); padding: 10px 14px 12px 34px; }
    .hist-ex { font-size: 12.5px; margin-bottom: 6px; }
  `],
})
export class RegistrarComponent {
  @Input() routines: Routine[] = [];
  @Input() sessions: WorkoutSession[] = [];
  @Output() sessionsChange = new EventEmitter<WorkoutSession[]>();

  date = todayStr();
  routineId = "";
  exercises: DraftExercise[] = [];
  saving = false;
  savedFlash = false;
  expanded: string | null = null;
  fmtDate = fmtDate;

  constructor(private api: ApiService) {}

  loadFromRoutine(id: string) {
    this.routineId = id;
    const routine = this.routines.find((r) => r.id === id);
    if (!routine) {
      this.exercises = [];
      return;
    }
    this.exercises = routine.exercises.map((ex) => ({
      id: uid(),
      name: ex.name,
      sets: Array.from({ length: Math.max(1, parseInt(String(ex.targetSets), 10) || 1) }, () => ({
        weight: "",
        reps: ex.targetReps || "",
      })),
    }));
  }

  addFreeExercise() {
    this.exercises = [...this.exercises, { id: uid(), name: "", sets: [{ weight: "", reps: "" }] }];
  }
  removeExercise(id: string) {
    this.exercises = this.exercises.filter((e) => e.id !== id);
  }
  addSet(ex: DraftExercise) {
    ex.sets = [...ex.sets, { weight: "", reps: "" }];
  }
  removeSet(ex: DraftExercise, idx: number) {
    ex.sets = ex.sets.filter((_, i) => i !== idx);
  }

  get maxByExercise(): Record<string, { weight: number; date: string }> {
    const max: Record<string, { weight: number; date: string }> = {};
    for (const s of [...this.sessions].sort((a, b) => a.date.localeCompare(b.date))) {
      for (const ex of s.exercises) {
        for (const set of ex.sets) {
          const w = parseFloat(String(set.weight));
          if (!isFinite(w)) continue;
          if (!max[ex.name] || w > max[ex.name].weight) max[ex.name] = { weight: w, date: s.date };
        }
      }
    }
    return max;
  }

  get weeklyMaxByExercise(): Record<string, number> {
    const thisWeek = weekKey(this.date);
    const m: Record<string, number> = {};
    for (const s of this.sessions) {
      if (weekKey(s.date) !== thisWeek) continue;
      for (const ex of s.exercises) {
        for (const set of ex.sets) {
          const w = parseFloat(String(set.weight));
          if (!isFinite(w)) continue;
          if (!m[ex.name] || w > m[ex.name]) m[ex.name] = w;
        }
      }
    }
    return m;
  }

  isPR(ex: DraftExercise, set: ExerciseSet): boolean {
    const prevMax = this.maxByExercise[ex.name.trim()];
    const w = parseFloat(String(set.weight));
    return !!(prevMax && isFinite(w) && w > prevMax.weight);
  }

  async saveSession() {
    const cleaned: SessionExercise[] = this.exercises
      .filter((e) => e.name.trim())
      .map((e) => ({ name: e.name.trim(), sets: e.sets.filter((s) => s.weight !== "" || s.reps !== "") }))
      .filter((e) => e.sets.length > 0);
    if (cleaned.length === 0) return;

    this.saving = true;
    try {
      const routine = this.routines.find((r) => r.id === this.routineId);
      const created = await this.api.createSession({
        date: this.date,
        routineId: this.routineId || null,
        routineName: routine ? routine.name : null,
        exercises: cleaned,
      });
      this.sessionsChange.emit([created, ...this.sessions]);
      this.exercises = [];
      this.routineId = "";
      this.savedFlash = true;
      setTimeout(() => (this.savedFlash = false), 2000);
    } finally {
      this.saving = false;
    }
  }

  get sortedSessions(): WorkoutSession[] {
    return [...this.sessions].sort((a, b) => b.date.localeCompare(a.date));
  }

  toggleExpand(id: string) {
    this.expanded = this.expanded === id ? null : id;
  }

  async removeSession(id: string) {
    await this.api.deleteSession(id);
    this.sessionsChange.emit(this.sessions.filter((s) => s.id !== id));
  }

  formatSets(ex: SessionExercise): string {
    return ex.sets.map((s) => `${s.weight || "–"}kg x${s.reps || "–"}`).join(", ");
  }
}
