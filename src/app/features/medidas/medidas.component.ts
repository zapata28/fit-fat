import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import { Measurement } from "../../core/models";
import { todayStr, monthKey, fmtMonth, fmtDate } from "../../core/utils";

interface Form {
  date: string;
  weight: string;
  chest: string;
  waist: string;
  hips: string;
  arm: string;
  thigh: string;
  neck: string;
  notes: string;
}

@Component({
  selector: "app-medidas",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="section-title"><h2>Medidas corporales</h2></div>
      <p class="hint">Se recomienda una medición por mes — es suficiente para ver la tendencia real sin ruido de agua o comida.</p>

      <div class="card form-card">
        <p *ngIf="alreadyThisMonth" class="warn">
          Ya tienes una medición registrada en {{ fmtMonth(currentMonth) }}. Puedes agregar otra si quieres, pero no es necesario.
        </p>
        <div class="grid">
          <label><span class="field-label">Fecha</span><input type="date" class="input" [(ngModel)]="form.date" /></label>
          <label><span class="field-label">Peso (kg)</span><input type="number" class="input" [(ngModel)]="form.weight" placeholder="0.0" /></label>
          <label><span class="field-label">Cuello (cm)</span><input type="number" class="input" [(ngModel)]="form.neck" placeholder="0.0" /></label>
          <label><span class="field-label">Pecho (cm)</span><input type="number" class="input" [(ngModel)]="form.chest" placeholder="0.0" /></label>
          <label><span class="field-label">Cintura (cm)</span><input type="number" class="input" [(ngModel)]="form.waist" placeholder="0.0" /></label>
          <label><span class="field-label">Cadera (cm)</span><input type="number" class="input" [(ngModel)]="form.hips" placeholder="0.0" /></label>
          <label><span class="field-label">Brazo (cm)</span><input type="number" class="input" [(ngModel)]="form.arm" placeholder="0.0" /></label>
          <label><span class="field-label">Muslo (cm)</span><input type="number" class="input" [(ngModel)]="form.thigh" placeholder="0.0" /></label>
        </div>
        <label class="notes-label">
          <span class="field-label">Notas</span>
          <textarea class="input notes" [(ngModel)]="form.notes" placeholder="Cómo te sentiste, sueño, alimentación..."></textarea>
        </label>
        <button class="btn-primary save-btn" [disabled]="saving" (click)="save()">{{ saving ? "Guardando..." : "+ Guardar medición" }}</button>
      </div>

      <p *ngIf="byMonth.length === 0" class="muted">Aún no registras mediciones.</p>

      <div *ngFor="let group of byMonth" class="month-group">
        <p class="month-title">{{ fmtMonth(group[0]) }}</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th><th>Peso</th><th>Cuello</th><th>Pecho</th><th>Cintura</th><th>Cadera</th><th>Brazo</th><th>Muslo</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of group[1]">
                <td>{{ fmtDate(m.date) }}</td>
                <td>{{ m.weight ?? "–" }}</td>
                <td>{{ m.neck ?? "–" }}</td>
                <td>{{ m.chest ?? "–" }}</td>
                <td>{{ m.waist ?? "–" }}</td>
                <td>{{ m.hips ?? "–" }}</td>
                <td>{{ m.arm ?? "–" }}</td>
                <td>{{ m.thigh ?? "–" }}</td>
                <td><button class="icon-btn" (click)="remove(m.id)">🗑</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hint { font-size: 12.5px; color: var(--ink-soft); margin-top: -8px; margin-bottom: 16px; }
    .form-card { padding: 16px; margin-bottom: 24px; }
    .warn { font-size: 12px; color: var(--brass); margin-top: 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px; margin-bottom: 12px; }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
    .notes-label { margin-top: 4px; }
    .notes { min-height: 50px; resize: vertical; }
    .save-btn { margin-top: 12px; }
    .muted { color: var(--ink-soft); font-size: 13px; }
    .month-group { margin-bottom: 20px; }
    .month-title { font-family: var(--font-head); font-size: 12.5px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 8px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    thead tr { border-bottom: 2px solid var(--ink); }
    th { text-align: left; padding: 6px 8px; font-family: var(--font-head); letter-spacing: 0.04em; text-transform: uppercase; font-size: 10.5px; color: var(--ink-soft); }
    td { padding: 6px 8px; }
    tbody tr { border-bottom: 1px dashed var(--paper-line); }
    tbody tr:hover { background: rgba(178,59,46,0.05); }
  `],
})
export class MedidasComponent {
  @Input() measurements: Measurement[] = [];
  @Output() measurementsChange = new EventEmitter<Measurement[]>();

  form: Form = this.emptyForm();
  saving = false;
  fmtMonth = fmtMonth;
  fmtDate = fmtDate;

  constructor(private api: ApiService) {}

  private emptyForm(date = todayStr()): Form {
    return { date, weight: "", chest: "", waist: "", hips: "", arm: "", thigh: "", neck: "", notes: "" };
  }

  get currentMonth(): string {
    return monthKey(this.form.date);
  }
  get alreadyThisMonth(): boolean {
    return this.measurements.some((m) => monthKey(m.date) === this.currentMonth);
  }

  async save() {
    const f = this.form;
    if (!f.weight && !f.chest && !f.waist && !f.hips && !f.arm && !f.thigh && !f.neck) return;
    this.saving = true;
    try {
      const created = await this.api.createMeasurement(f);
      this.measurementsChange.emit([created, ...this.measurements]);
      this.form = this.emptyForm(f.date);
    } finally {
      this.saving = false;
    }
  }

  async remove(id: string) {
    await this.api.deleteMeasurement(id);
    this.measurementsChange.emit(this.measurements.filter((m) => m.id !== id));
  }

  get byMonth(): [string, Measurement[]][] {
    const groups: Record<string, Measurement[]> = {};
    for (const m of this.measurements) {
      const k = monthKey(m.date);
      if (!groups[k]) groups[k] = [];
      groups[k].push(m);
    }
    return Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([k, list]) => [k, [...list].sort((a, b) => b.date.localeCompare(a.date))] as [string, Measurement[]]);
  }
}
