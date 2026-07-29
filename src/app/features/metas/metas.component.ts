import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import { Goal, Measurement, WorkoutSession } from "../../core/models";
import { normalize, WeightUnit, kgToLb, lbToKg, fmtDate } from "../../core/utils";
import { EXERCISE_LIBRARY } from "../../core/exercise-library";

type GoalType = "weight" | "exercise";

@Component({
  selector: "app-metas",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="section-title"><h2>Metas</h2></div>
      <p class="hint">Ponte objetivos de peso corporal o de peso máximo en un ejercicio, y ve tu progreso hacia ellos.</p>

      <div class="card form-card">
        <div class="type-toggle">
          <button type="button" [class.active]="form.type === 'weight'" (click)="form.type = 'weight'">Peso corporal</button>
          <button type="button" [class.active]="form.type === 'exercise'" (click)="form.type = 'exercise'">Ejercicio</button>
        </div>
        <div class="form-grid">
          <label *ngIf="form.type === 'exercise'" class="full">
            <span class="field-label">Ejercicio</span>
            <input class="input" list="goal-exercise-suggestions" placeholder="Ej: Sentadilla" [(ngModel)]="form.exerciseName" />
          </label>
          <label>
            <span class="field-label">Objetivo</span>
            <input class="input" type="number" placeholder="0" [(ngModel)]="form.targetValue" />
          </label>
          <label>
            <span class="field-label">Unidad</span>
            <div class="unit-toggle">
              <button type="button" [class.active]="form.unit === 'kg'" (click)="form.unit = 'kg'">Kg</button>
              <button type="button" [class.active]="form.unit === 'lb'" (click)="form.unit = 'lb'">Lb</button>
            </div>
          </label>
          <label>
            <span class="field-label">Fecha objetivo (opcional)</span>
            <input class="input" type="date" [(ngModel)]="form.targetDate" />
          </label>
        </div>
        <p *ngIf="error" class="error">{{ error }}</p>
        <button class="btn-primary" [disabled]="!canSave || saving" (click)="addGoal()">
          {{ saving ? "Guardando..." : "+ Agregar meta" }}
        </button>
      </div>

      <p *ngIf="goals === null" class="muted top-gap">Cargando...</p>
      <p *ngIf="goals && goals.length === 0" class="muted top-gap">Aún no tienes metas — agrega una arriba.</p>

      <div class="list top-gap" *ngIf="goals && goals.length > 0">
        <div class="card goal-card" *ngFor="let g of goals">
          <div class="goal-head">
            <div>
              <strong>{{ g.type === "weight" ? "Peso corporal" : g.exercise_name }}</strong>
              <span class="goal-target">Meta: {{ g.target_value }} {{ g.unit }}</span>
            </div>
            <button class="icon-btn" (click)="removeGoal(g.id)" [disabled]="deletingId === g.id">
              {{ deletingId === g.id ? "…" : "🗑" }}
            </button>
          </div>
          <div class="progress-wrap">
            <div class="bar-track"><div class="bar-fill" [class.done]="progressFor(g).done" [style.width.%]="progressFor(g).pct"></div></div>
            <span class="progress-label">{{ progressFor(g).label }}</span>
          </div>
          <p class="goal-date" *ngIf="g.target_date">Para el {{ fmtDate(g.target_date) }}</p>
        </div>
      </div>
    </div>

    <datalist id="goal-exercise-suggestions">
      <option *ngFor="let ex of library" [value]="ex.label"></option>
    </datalist>
  `,
  styles: [`
    .hint { font-size: 12.5px; color: var(--ink-soft); margin-top: -8px; margin-bottom: 20px; }
    .form-card { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .type-toggle { display: flex; border: 1.5px solid var(--paper-line); border-radius: 6px; overflow: hidden; width: fit-content; }
    .type-toggle button {
      font-family: var(--font-head); font-size: 12px; text-transform: uppercase; letter-spacing: 0.03em;
      padding: 8px 16px; border: none; background: var(--paper-card); color: var(--ink-soft); cursor: pointer;
    }
    .type-toggle button.active { background: var(--iron); color: #F1ECDD; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 420px) {
      .form-grid { grid-template-columns: 1fr; }
    }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
    label.full { grid-column: 1 / -1; }
    .unit-toggle { display: flex; border: 1.5px solid var(--paper-line); border-radius: 6px; overflow: hidden; width: fit-content; }
    .unit-toggle button {
      font-family: var(--font-head); font-size: 11px; text-transform: uppercase; padding: 6px 12px;
      border: none; background: var(--paper-card); color: var(--ink-soft); cursor: pointer;
    }
    .unit-toggle button.active { background: var(--iron); color: #F1ECDD; }
    .error { color: var(--rust); font-size: 12.5px; margin: 0; }
    .top-gap { margin-top: 20px; }
    .muted { color: var(--ink-soft); font-size: 13px; }
    .list { display: flex; flex-direction: column; gap: 12px; }
    .goal-card { padding: 14px 16px; }
    .goal-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .goal-head strong { font-family: var(--font-head); font-size: 15px; display: block; }
    .goal-target { font-size: 11.5px; color: var(--ink-soft); }
    .progress-wrap { display: flex; align-items: center; gap: 10px; }
    .bar-track { flex: 1; height: 10px; border-radius: 5px; background: var(--paper-line); overflow: hidden; }
    .bar-fill { height: 100%; background: var(--rust); border-radius: 5px; transition: width 0.3s; }
    .bar-fill.done { background: #2E7D32; }
    .progress-label { font-size: 11.5px; color: var(--ink-soft); white-space: nowrap; font-family: var(--font-mono); }
    .goal-date { margin: 8px 0 0; font-size: 11px; color: var(--ink-soft); }
  `],
})
export class MetasComponent implements OnInit {
  @Input() measurements: Measurement[] = [];
  @Input() sessions: WorkoutSession[] = [];

  library = EXERCISE_LIBRARY;
  goals: Goal[] | null = null;
  saving = false;
  deletingId: string | null = null;
  error = "";
  fmtDate = fmtDate;

  form: { type: GoalType; exerciseName: string; targetValue: string; unit: WeightUnit; targetDate: string } = {
    type: "weight",
    exerciseName: "",
    targetValue: "",
    unit: "kg",
    targetDate: "",
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.error = "";
    try {
      this.goals = await this.api.getGoals();
    } catch (err: any) {
      const msg = err?.error?.error;
      this.error = typeof msg === "string" ? msg : "No se pudieron cargar tus metas. Revisa los logs de Vercel.";
    }
  }

  get canSave(): boolean {
    if (!this.form.targetValue || isNaN(parseFloat(this.form.targetValue))) return false;
    if (this.form.type === "exercise" && !this.form.exerciseName.trim()) return false;
    return true;
  }

  async addGoal() {
    if (!this.canSave) return;
    this.saving = true;
    this.error = "";
    try {
      const created = await this.api.createGoal({
        type: this.form.type,
        exerciseName: this.form.exerciseName.trim(),
        targetValue: this.form.targetValue,
        unit: this.form.unit,
        targetDate: this.form.targetDate || null,
      });
      this.goals = [created, ...(this.goals || [])];
      this.form = { type: this.form.type, exerciseName: "", targetValue: "", unit: this.form.unit, targetDate: "" };
    } catch (err: any) {
      const msg = err?.error?.error;
      this.error = typeof msg === "string" ? msg : "No se pudo guardar la meta.";
    } finally {
      this.saving = false;
    }
  }

  async removeGoal(id: string) {
    this.deletingId = id;
    try {
      await this.api.deleteGoal(id);
      this.goals = (this.goals || []).filter((g) => g.id !== id);
    } catch (err: any) {
      const msg = err?.error?.error;
      this.error = typeof msg === "string" ? msg : "No se pudo eliminar la meta.";
    } finally {
      this.deletingId = null;
    }
  }

  private latestBodyWeightKg(): number | null {
    if (this.measurements.length === 0) return null;
    const sorted = [...this.measurements].sort((a, b) => b.date.localeCompare(a.date));
    const withWeight = sorted.find((m) => m.weight != null);
    return withWeight ? Number(withWeight.weight) : null;
  }

  private maxExerciseKg(name: string): number | null {
    const n = normalize(name);
    let max: number | null = null;
    for (const s of this.sessions) {
      for (const ex of s.exercises) {
        if (normalize(ex.name) !== n) continue;
        for (const set of ex.sets) {
          const raw = parseFloat(String(set.weight));
          if (!isFinite(raw)) continue;
          const kg = set.unit === "lb" ? lbToKg(raw) : raw;
          if (max === null || kg > max) max = kg;
        }
      }
    }
    return max;
  }

  progressFor(g: Goal): { pct: number; label: string; done: boolean } {
    const targetKg = g.unit === "lb" ? lbToKg(g.target_value) : g.target_value;
    const currentKg = g.type === "weight" ? this.latestBodyWeightKg() : this.maxExerciseKg(g.exercise_name || "");

    if (currentKg == null) {
      return { pct: 0, label: "Sin datos todavía", done: false };
    }

    const currentDisplay = Math.round((g.unit === "lb" ? kgToLb(currentKg) : currentKg) * 10) / 10;

    if (g.type === "exercise") {
      // Para ejercicio, más peso es mejor: el progreso es cuánto te acercaste al objetivo.
      const pct = targetKg > 0 ? Math.min(100, (currentKg / targetKg) * 100) : 0;
      const done = currentKg >= targetKg;
      return {
        pct,
        done,
        label: done ? `¡Cumplida! ${currentDisplay} ${g.unit}` : `${currentDisplay} / ${g.target_value} ${g.unit}`,
      };
    } else {
      // Para peso corporal no sabemos si quiere subir o bajar; mostramos qué tan cerca está.
      const diffKg = Math.abs(currentKg - targetKg);
      const done = diffKg < 0.3;
      const diffDisplay = Math.round((g.unit === "lb" ? kgToLb(diffKg) : diffKg) * 10) / 10;
      const base = Math.max(currentKg, targetKg, 1);
      const pct = Math.max(0, 100 - (diffKg / base) * 100);
      return {
        pct,
        done,
        label: done ? `¡Cumplida! ${currentDisplay} ${g.unit}` : `${currentDisplay} ${g.unit} (faltan ${diffDisplay} ${g.unit})`,
      };
    }
  }
}
