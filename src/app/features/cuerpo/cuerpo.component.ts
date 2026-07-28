import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkoutSession, Measurement } from "../../core/models";
import { MuscleGroup } from "../../core/exercise-library";
import { computeMuscleScores, intensityColor, MuscleScore } from "../../core/muscle-scores";
import { fmtDate } from "../../core/utils";

type MeasureKey = "weight" | "chest" | "neck" | "waist" | "hips" | "arm" | "thigh";

interface MeasureField {
  key: MeasureKey;
  label: string;
  unit: string;
}

interface Overlay {
  group: MuscleGroup;
  top: number;
  left: number;
  width: number;
  height: number;
}

const FIELDS: MeasureField[] = [
  { key: "weight", label: "Peso", unit: "kg" },
  { key: "chest", label: "Pecho", unit: "cm" },
  { key: "neck", label: "Espalda", unit: "cm" },
  { key: "waist", label: "Cintura", unit: "cm" },
  { key: "hips", label: "Cadera", unit: "cm" },
  { key: "arm", label: "Brazo", unit: "cm" },
  { key: "thigh", label: "Muslo", unit: "cm" },
];

// Posiciones aproximadas (en % del ancho/alto de la imagen) de cada zona,
// ajustadas a mano sobre las fotos de referencia del usuario.
const FRONT_OVERLAYS: Overlay[] = [
  { group: "Hombro", top: 21, left: 26, width: 9, height: 6 },
  { group: "Hombro", top: 21, left: 63, width: 9, height: 6 },
  { group: "Pecho", top: 23, left: 35, width: 30, height: 8 },
  { group: "Abdomen", top: 32, left: 38, width: 24, height: 9 },
  { group: "Bíceps", top: 25, left: 16, width: 7, height: 14 },
  { group: "Bíceps", top: 25, left: 77, width: 7, height: 14 },
  { group: "Antebrazo", top: 37, left: 12, width: 6, height: 13 },
  { group: "Antebrazo", top: 37, left: 82, width: 6, height: 13 },
  { group: "Pierna", top: 46, left: 35, width: 11, height: 19 },
  { group: "Pierna", top: 46, left: 54, width: 11, height: 19 },
  { group: "Pierna", top: 67, left: 36, width: 9, height: 16 },
  { group: "Pierna", top: 67, left: 55, width: 9, height: 16 },
];

const BACK_OVERLAYS: Overlay[] = [
  { group: "Hombro", top: 19, left: 24, width: 9, height: 6 },
  { group: "Hombro", top: 19, left: 65, width: 9, height: 6 },
  { group: "Espalda", top: 22, left: 35, width: 30, height: 13 },
  { group: "Glúteo", top: 37, left: 37, width: 26, height: 8 },
  { group: "Tríceps", top: 25, left: 16, width: 7, height: 14 },
  { group: "Tríceps", top: 25, left: 77, width: 7, height: 14 },
  { group: "Antebrazo", top: 37, left: 12, width: 6, height: 13 },
  { group: "Antebrazo", top: 37, left: 82, width: 6, height: 13 },
  { group: "Pierna", top: 46, left: 35, width: 11, height: 19 },
  { group: "Pierna", top: 46, left: 54, width: 11, height: 19 },
  { group: "Pierna", top: 67, left: 36, width: 9, height: 16 },
  { group: "Pierna", top: 67, left: 55, width: 9, height: 16 },
];

@Component({
  selector: "app-cuerpo",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="section-title"><h2>Cuerpo</h2></div>
      <p class="hint">Qué tanto trabajaste cada grupo muscular en los últimos 30 días (frecuencia + volumen).</p>

      <div class="layout">
        <div class="card measure-panel">
          <p class="panel-title">Medidas</p>
          <div class="measure-row" *ngFor="let f of fields">
            <span class="m-label">{{ f.label }}</span>
            <span class="m-value" [class.changed]="changed(f.key)">
              {{ valueFor(f.key) != null ? (valueFor(f.key) + ' ' + f.unit) : "—" }}
            </span>
          </div>
          <p class="measure-date" *ngIf="latest">{{ fmtDate(latest.date) }}</p>
          <p class="muted" *ngIf="!latest">Aún no tienes medidas — agrégalas en la pestaña Medidas.</p>
        </div>

        <div class="figures card">
          <div class="figure-col">
            <p class="figure-label">Frente</p>
            <div class="photo-wrap">
              <img src="/images/cuerpo-frente.png" class="body-photo" alt="Cuerpo de frente" />
              <div
                class="overlay-blob"
                *ngFor="let o of frontOverlays"
                [style.top.%]="o.top"
                [style.left.%]="o.left"
                [style.width.%]="o.width"
                [style.height.%]="o.height"
                [style.background]="colorFor(o.group)"
              ></div>
            </div>
          </div>
          <div class="figure-col">
            <p class="figure-label">Espalda</p>
            <div class="photo-wrap">
              <img src="/images/cuerpo-espalda.png" class="body-photo" alt="Cuerpo de espaldas" />
              <div
                class="overlay-blob"
                *ngFor="let o of backOverlays"
                [style.top.%]="o.top"
                [style.left.%]="o.left"
                [style.width.%]="o.width"
                [style.height.%]="o.height"
                [style.background]="colorFor(o.group)"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="legend">
        <div class="legend-row" *ngFor="let m of scores">
          <span class="swatch" [style.background]="colorFor(m.group)"></span>
          <span class="g-name">{{ m.group }}</span>
          <div class="bar-track"><div class="bar-fill" [style.width.%]="m.score * 100" [style.background]="colorFor(m.group)"></div></div>
          <span class="g-detail">{{ m.frequency }} {{ m.frequency === 1 ? "día" : "días" }} · {{ m.volume | number }} kg</span>
        </div>
        <p *ngIf="allZero" class="muted">Aún no hay sesiones registradas en los últimos 30 días.</p>
      </div>
    </div>
  `,
  styles: [`
    .hint { font-size: 12.5px; color: var(--ink-soft); margin-top: -8px; margin-bottom: 20px; }
    .layout { display: flex; gap: 20px; flex-wrap: wrap; align-items: flex-start; margin-bottom: 24px; }
    .measure-panel { padding: 16px; min-width: 180px; }
    .panel-title { margin: 0 0 10px; font-family: var(--font-head); font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-soft); }
    .measure-row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; padding: 5px 0; border-bottom: 1px dashed var(--paper-line); }
    .m-label { color: var(--ink-soft); }
    .m-value { color: var(--ink); font-weight: 600; }
    .m-value.changed { color: #2E7D32; }
    .measure-date { margin: 10px 0 0; font-size: 11px; color: var(--ink-soft); }
    .figures { display: flex; justify-content: center; gap: 24px; padding: 20px; flex: 1; flex-wrap: wrap; }
    .figure-col { display: flex; flex-direction: column; align-items: center; }
    .figure-label { font-family: var(--font-head); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 8px; }
    .photo-wrap { position: relative; width: 150px; display: inline-block; line-height: 0; }
    .body-photo { width: 100%; height: auto; display: block; }
    .overlay-blob { position: absolute; border-radius: 50%; opacity: 0.5; mix-blend-mode: multiply; pointer-events: none; }
    .legend { display: flex; flex-direction: column; gap: 8px; }
    .legend-row { display: grid; grid-template-columns: 14px 90px 1fr 110px; align-items: center; gap: 10px; font-size: 12.5px; }
    .swatch { width: 14px; height: 14px; border-radius: 3px; border: 1px solid var(--paper-line); }
    .g-name { color: var(--ink); }
    .bar-track { height: 8px; border-radius: 4px; background: var(--paper-line); overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; }
    .g-detail { color: var(--ink-soft); font-size: 11px; text-align: right; white-space: nowrap; }
    .muted { color: var(--ink-soft); font-size: 13px; }
  `],
})
export class CuerpoComponent {
  @Input() sessions: WorkoutSession[] = [];
  @Input() measurements: Measurement[] = [];
  fmtDate = fmtDate;
  fields = FIELDS;
  frontOverlays = FRONT_OVERLAYS;
  backOverlays = BACK_OVERLAYS;

  private get sorted(): Measurement[] {
    return [...this.measurements].sort((a, b) => b.date.localeCompare(a.date));
  }

  get latest(): Measurement | null {
    return this.sorted[0] || null;
  }

  private get previous(): Measurement | null {
    return this.sorted[1] || null;
  }

  valueFor(key: MeasureKey): number | null {
    const v = this.latest ? (this.latest[key] as number | null | undefined) : null;
    return v == null ? null : v;
  }

  changed(key: MeasureKey): boolean {
    if (!this.latest || !this.previous) return false;
    const a = this.latest[key];
    const b = this.previous[key];
    if (a == null || b == null) return false;
    return Number(a) !== Number(b);
  }

  get scores(): MuscleScore[] {
    return computeMuscleScores(this.sessions, 30);
  }

  get allZero(): boolean {
    return this.scores.every((s) => s.score === 0);
  }

  colorFor(group: MuscleGroup): string {
    const found = this.scores.find((s) => s.group === group);
    return intensityColor(found ? found.score : 0);
  }
}
