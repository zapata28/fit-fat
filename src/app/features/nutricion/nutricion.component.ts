import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import { NutritionLog } from "../../core/models";
import { todayStr, fmtDate, monthKey, fmtMonth } from "../../core/utils";

const MEAL_TYPES = ["Desayuno", "Almuerzo", "Cena", "Snack", "Otro"];

interface DayGroup {
  date: string;
  logs: NutritionLog[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

@Component({
  selector: "app-nutricion",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="section-title"><h2>Nutrición</h2></div>
      <p class="hint">Registra lo que comes. Los campos de calorías y macros son opcionales — pon lo que te sirva.</p>

      <div class="card form-card">
        <div class="form-grid">
          <label>
            <span class="field-label">Fecha</span>
            <input type="date" class="input" [(ngModel)]="form.date" />
          </label>
          <label>
            <span class="field-label">Comida</span>
            <select class="input" [(ngModel)]="form.mealType">
              <option *ngFor="let m of mealTypes" [value]="m">{{ m }}</option>
            </select>
          </label>
        </div>
        <label class="full">
          <span class="field-label">Qué comiste</span>
          <input class="input" placeholder="Ej: Arroz con pollo y ensalada" [(ngModel)]="form.description" />
        </label>
        <div class="form-grid macros">
          <label>
            <span class="field-label">Calorías</span>
            <input class="input" type="number" placeholder="kcal" [(ngModel)]="form.calories" />
          </label>
          <label>
            <span class="field-label">Proteína (g)</span>
            <input class="input" type="number" placeholder="g" [(ngModel)]="form.protein" />
          </label>
          <label>
            <span class="field-label">Carbos (g)</span>
            <input class="input" type="number" placeholder="g" [(ngModel)]="form.carbs" />
          </label>
          <label>
            <span class="field-label">Grasas (g)</span>
            <input class="input" type="number" placeholder="g" [(ngModel)]="form.fat" />
          </label>
        </div>
        <p *ngIf="error" class="error">{{ error }}</p>
        <button class="btn-primary" [disabled]="!form.description.trim() || saving" (click)="addLog()">
          {{ saving ? "Guardando..." : "+ Agregar" }}
        </button>
      </div>

      <p *ngIf="logs === null" class="muted top-gap">Cargando...</p>
      <p *ngIf="logs && logs.length === 0" class="muted top-gap">Aún no has registrado ninguna comida.</p>

      <div class="days top-gap" *ngIf="logs && logs.length > 0">
        <div class="card day-card" *ngFor="let g of grouped">
          <div class="day-head">
            <strong>{{ fmtDate(g.date) }}</strong>
            <span class="totals">
              {{ g.calories | number }} kcal · P {{ g.protein | number }}g · C {{ g.carbs | number }}g · G {{ g.fat | number }}g
            </span>
          </div>
          <div class="log-row" *ngFor="let log of g.logs">
            <span class="meal-tag">{{ log.meal_type }}</span>
            <span class="desc">{{ log.description }}</span>
            <span class="macros-inline" *ngIf="log.calories != null">{{ log.calories }} kcal</span>
            <button class="icon-btn" (click)="removeLog(log.id)" [disabled]="deletingId === log.id">
              {{ deletingId === log.id ? "…" : "🗑" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hint { font-size: 12.5px; color: var(--ink-soft); margin-top: -8px; margin-bottom: 20px; }
    .form-card { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-grid.macros { grid-template-columns: repeat(4, 1fr); }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
    label.full { width: 100%; }
    .error { color: var(--rust); font-size: 12.5px; margin: 0; }
    .top-gap { margin-top: 20px; }
    .muted { color: var(--ink-soft); font-size: 13px; }
    .days { display: flex; flex-direction: column; gap: 12px; }
    .day-card { padding: 14px 16px; }
    .day-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed var(--paper-line); }
    .day-head strong { font-family: var(--font-head); font-size: 14px; text-transform: uppercase; letter-spacing: 0.03em; }
    .totals { font-size: 11.5px; color: var(--ink-soft); font-family: var(--font-mono); }
    .log-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 13px; }
    .meal-tag {
      font-family: var(--font-head); font-size: 10px; text-transform: uppercase; letter-spacing: 0.03em;
      background: var(--paper-card); border: 1px solid var(--paper-line); border-radius: 10px; padding: 2px 8px; white-space: nowrap;
    }
    .desc { flex: 1; }
    .macros-inline { font-size: 11.5px; color: var(--rust); font-family: var(--font-mono); white-space: nowrap; }
  `],
})
export class NutricionComponent implements OnInit {
  mealTypes = MEAL_TYPES;
  logs: NutritionLog[] | null = null;
  saving = false;
  deletingId: string | null = null;
  error = "";
  fmtDate = fmtDate;

  form = {
    date: todayStr(),
    mealType: "Desayuno",
    description: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.error = "";
    try {
      this.logs = await this.api.getNutritionLogs();
    } catch (err: any) {
      const msg = err?.error?.error;
      this.error = typeof msg === "string" ? msg : "No se pudo cargar tu nutrición. Revisa los logs de Vercel.";
    }
  }

  get grouped(): DayGroup[] {
    if (!this.logs) return [];
    const map: Record<string, DayGroup> = {};
    for (const log of this.logs) {
      if (!map[log.date]) map[log.date] = { date: log.date, logs: [], calories: 0, protein: 0, carbs: 0, fat: 0 };
      map[log.date].logs.push(log);
      map[log.date].calories += log.calories || 0;
      map[log.date].protein += log.protein || 0;
      map[log.date].carbs += log.carbs || 0;
      map[log.date].fat += log.fat || 0;
    }
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }

  async addLog() {
    if (!this.form.description.trim()) return;
    this.saving = true;
    this.error = "";
    try {
      const created = await this.api.createNutritionLog({
        date: this.form.date,
        mealType: this.form.mealType,
        description: this.form.description.trim(),
        calories: this.form.calories,
        protein: this.form.protein,
        carbs: this.form.carbs,
        fat: this.form.fat,
      });
      this.logs = [created, ...(this.logs || [])];
      this.form = { ...this.form, description: "", calories: "", protein: "", carbs: "", fat: "" };
    } catch (err: any) {
      const msg = err?.error?.error;
      this.error = typeof msg === "string" ? msg : "No se pudo guardar. Intenta de nuevo.";
    } finally {
      this.saving = false;
    }
  }

  async removeLog(id: string) {
    this.deletingId = id;
    try {
      await this.api.deleteNutritionLog(id);
      this.logs = (this.logs || []).filter((l) => l.id !== id);
    } catch (err: any) {
      const msg = err?.error?.error;
      this.error = typeof msg === "string" ? msg : "No se pudo eliminar.";
    } finally {
      this.deletingId = null;
    }
  }
}
