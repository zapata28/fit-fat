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

interface OverlayPoint {
  x: number;
  y: number;
}

// "oval" y "hexagon" usan top/left/width/height (una caja).
// "polygon" (forma libre) usa "points": lista de esquinas en % de la imagen,
// dibujada con clip-path. Salen exactamente en este formato del calibrador
// local (calibrador-cuerpo.html).
interface Overlay {
  group: MuscleGroup;
  shape: "oval" | "hexagon" | "polygon";
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  points?: OverlayPoint[];
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
// ajustadas a mano sobre las fotos de referencia del usuario. Para editar
// esto visualmente, usa calibrador-cuerpo.html y pega el resultado aquí.
const FRONT_OVERLAYS: Overlay[] = [
  { group: "Hombro", shape: "oval", top: 19.8, left: 28, width: 15.9, height: 2 },
  { group: "Hombro", shape: "oval", top: 19.6, left: 62.7, width: 14.1, height: 2 },
  { group: "Pecho", shape: "oval", top: 21.5, left: 31.1, width: 43.9, height: 8.2 },
  { group: "Abdomen", shape: "oval", top: 32, left: 38.4, width: 27.2, height: 13.7 },
  { group: "Bíceps", shape: "oval", top: 26.1, left: 21, width: 7.4, height: 8.1 },
  { group: "Bíceps", shape: "oval", top: 25.6, left: 76.3, width: 6.6, height: 8.2 },
  { group: "Antebrazo", shape: "oval", top: 38, left: 17, width: 6.4, height: 5.4 },
  { group: "Antebrazo", shape: "oval", top: 37.4, left: 79.5, width: 8.5, height: 6.1 },
  { group: "Pierna", shape: "oval", top: 52.3, left: 32.1, width: 16, height: 16.2 },
  { group: "Pierna", shape: "oval", top: 52.3, left: 55.4, width: 17.1, height: 15.3 },
  { group: "Pierna", shape: "oval", top: 72.9, left: 33.5, width: 11.1, height: 9.6 },
  { group: "Pierna", shape: "oval", top: 73.6, left: 60, width: 10.1, height: 10.8 },
];

const BACK_OVERLAYS: Overlay[] = [
  { group: "Hombro", shape: "oval", top: 20.4, left: 26, width: 12.4, height: 2 },
  { group: "Hombro", shape: "oval", top: 20.6, left: 61.2, width: 11.6, height: 2 },
  { group: "Espalda", shape: "oval", top: 20.7, left: 31.4, width: 37.1, height: 19.2 },
  { group: "Glúteo", shape: "oval", top: 45.1, left: 29.1, width: 41, height: 8.5 },
  { group: "Tríceps", shape: "oval", top: 26.8, left: 16.7, width: 7, height: 9 },
  { group: "Tríceps", shape: "oval", top: 28.4, left: 73.8, width: 9.1, height: 7.9 },
  { group: "Antebrazo", shape: "oval", top: 37, left: 12, width: 7.1, height: 6.2 },
  { group: "Antebrazo", shape: "oval", top: 38.8, left: 80.2, width: 5.6, height: 7.2 },
  { group: "Pierna", shape: "oval", top: 55.1, left: 27.9, width: 17.1, height: 12 },
  { group: "Pierna", shape: "oval", top: 55.2, left: 52.6, width: 18.1, height: 12.2 },
  { group: "Pierna", shape: "oval", top: 74.7, left: 28.5, width: 13.3, height: 9.3 },
  { group: "Pierna", shape: "oval", top: 74.8, left: 56.8, width: 12.9, height: 8.6 },
];

@Component({
  selector: "app-cuerpo",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="section-title"><h2>Cuerpo</h2></div>
      <p class="hint">Qué tanto trabajaste cada grupo muscular en los últimos 30 días (frecuencia + volumen).</p>

      <div class="card layout">
        <div class="measure-panel">
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

        <div class="figures">
          <div class="figure-col">
            <p class="figure-label">Frente</p>
            <div class="photo-wrap">
              <img src="/images/cuerpo-frente.png" class="body-photo" alt="Cuerpo de frente" />
              <div
                class="overlay-blob"
                [class.oval]="o.shape === 'oval'"
                [class.hexagon]="o.shape === 'hexagon'"
                [class.polygon]="o.shape === 'polygon'"
                *ngFor="let o of frontOverlays"
                [style.top.%]="o.shape !== 'polygon' ? o.top : null"
                [style.left.%]="o.shape !== 'polygon' ? o.left : null"
                [style.width.%]="o.shape !== 'polygon' ? o.width : null"
                [style.height.%]="o.shape !== 'polygon' ? o.height : null"
                [style.clipPath]="o.shape === 'polygon' ? polygonClipPath(o) : null"
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
                [class.oval]="o.shape === 'oval'"
                [class.hexagon]="o.shape === 'hexagon'"
                [class.polygon]="o.shape === 'polygon'"
                *ngFor="let o of backOverlays"
                [style.top.%]="o.shape !== 'polygon' ? o.top : null"
                [style.left.%]="o.shape !== 'polygon' ? o.left : null"
                [style.width.%]="o.shape !== 'polygon' ? o.width : null"
                [style.height.%]="o.shape !== 'polygon' ? o.height : null"
                [style.clipPath]="o.shape === 'polygon' ? polygonClipPath(o) : null"
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
    .measure-panel { padding: 16px 20px 16px 0; min-width: 180px; border-right: 1px solid var(--paper-line); }
    .panel-title { margin: 0 0 10px; font-family: var(--font-head); font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-soft); }
    .measure-row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; padding: 5px 0; border-bottom: 1px dashed var(--paper-line); }
    .m-label { color: var(--ink-soft); }
    .m-value { color: var(--ink); font-weight: 600; }
    .m-value.changed { color: #2E7D32; }
    .measure-date { margin: 10px 0 0; font-size: 11px; color: var(--ink-soft); }
    .figures { display: flex; justify-content: center; gap: 24px; padding: 4px 0; flex: 1; flex-wrap: wrap; }
    .figure-col { display: flex; flex-direction: column; align-items: center; }
    .figure-label { font-family: var(--font-head); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 8px; }
    .photo-wrap { position: relative; width: 150px; display: inline-block; line-height: 0; }
    .body-photo { width: 100%; height: auto; display: block; }
    .overlay-blob { position: absolute; opacity: 0.5; mix-blend-mode: multiply; pointer-events: none; }
    .overlay-blob.oval { border-radius: 50%; }
    .overlay-blob.hexagon { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
    .overlay-blob.polygon { top: 0; left: 0; width: 100%; height: 100%; }
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

  polygonClipPath(o: Overlay): string {
    if (!o.points || o.points.length === 0) return "";
    return "polygon(" + o.points.map((p) => `${p.x}% ${p.y}%`).join(", ") + ")";
  }
}
