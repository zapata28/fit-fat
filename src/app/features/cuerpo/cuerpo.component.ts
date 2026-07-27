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
// calculadas a partir de las fotos que subió el usuario (proporciones de
// una figura de pie, brazos ligeramente separados del cuerpo).
const FRONT_OVERLAYS: Overlay[] = [
  { group: "Hombro", top: 15, left: 16, width: 16, height: 8 },
  { group: "Hombro", top: 15, left: 68, width: 16, height: 8 },
  { group: "Pecho", top: 21, left: 30, width: 40, height: 11 },
  { group: "Abdomen", top: 31, left: 34, width: 32, height: 12 },
  { group: "Bíceps", top: 24, left: 6, width: 13, height: 15 },
  { group: "Bíceps", top: 24, left: 81, width: 13, height: 15 },
  { group: "Antebrazo", top: 38, left: 2, width: 11, height: 15 },
  { group: "Antebrazo", top: 38, left: 87, width: 11, height: 15 },
  { group: "Pierna", top: 50, left: 30, width: 17, height: 21 },
  { group: "Pierna", top: 50, left: 53, width: 17, height: 21 },
  { group: "Pierna", top: 72, left: 31, width: 15, height: 17 },
  { group: "Pierna", top: 72, left: 54, width: 15, height: 17 },
];

const BACK_OVERLAYS: Overlay[] = [
  { group: "Hombro", top: 15, left: 16, width: 16, height: 8 },
  { group: "Hombro", top: 15, left: 68, width: 16, height: 8 },
  { group: "Espalda", top: 20, left: 30, width: 40, height: 16 },
  { group: "Glúteo", top: 38, left: 32, width: 36, height: 10 },
  { group: "Tríceps", top: 24, left: 6, width: 13, height: 15 },
  { group: "Tríceps", top: 24, left: 81, width: 13, height: 15 },
  { group: "Antebrazo", top: 38, left: 2, width: 11, height: 15 },
  { group: "Antebrazo", top: 38, left: 87, width: 11, height: 15 },
  { group: "Pierna", top: 50, left: 30, width: 17, height: 21 },
  { group: "Pierna", top: 50, left: 53, width: 17, height: 21 },
  { group: "Pierna", top: 72, left: 31, width: 15, height: 17 },
  { group: "Pierna", top: 72, left: 54, width: 15, height: 17 },
];

@Component({
  selector: "app-cuerpo",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="section-title">
        <h2>Cuerpo</h2>
        <div class="view-toggle">
          <button class="btn-ghost" [class.active]="viewMode === 'dibujo'" (click)="viewMode = 'dibujo'">Dibujo</button>
          <button class="btn-ghost" [class.active]="viewMode === 'foto'" (click)="viewMode = 'foto'">Foto</button>
        </div>
      </div>
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

        <div class="figures card" *ngIf="viewMode === 'dibujo'">
          <div class="figure-col">
            <p class="figure-label">Frente</p>
            <svg viewBox="0 0 200 420" class="body-svg">
              <g stroke="var(--ink)" stroke-width="1.5" stroke-linejoin="round">
                <ellipse cx="82" cy="228" rx="25" ry="68" transform="rotate(-3 82 228)" [attr.fill]="colorFor('Pierna')" />
                <ellipse cx="118" cy="228" rx="25" ry="68" transform="rotate(3 118 228)" [attr.fill]="colorFor('Pierna')" />
                <ellipse cx="80" cy="330" rx="15" ry="60" transform="rotate(-2 80 330)" [attr.fill]="colorFor('Pierna')" />
                <ellipse cx="120" cy="330" rx="15" ry="60" transform="rotate(2 120 330)" [attr.fill]="colorFor('Pierna')" />
                <g stroke="var(--ink)" stroke-width="1" fill="none" opacity="0.45">
                  <path d="M74,168 Q78,228 75,286" />
                  <path d="M90,168 Q86,228 89,286" />
                  <path d="M126,168 Q122,228 125,286" />
                  <path d="M110,168 Q114,228 111,286" />
                  <path d="M76,278 Q72,330 76,382" />
                  <path d="M124,278 Q128,330 124,382" />
                </g>
                <ellipse cx="78" cy="398" rx="18" ry="11" fill="var(--paper-card)" />
                <ellipse cx="122" cy="398" rx="18" ry="11" fill="var(--paper-card)" />
                <path d="M80,92 L120,92 L114,152 C114,162 106,168 100,168 C94,168 86,162 86,152 Z" [attr.fill]="colorFor('Abdomen')" />
                <path d="M100,50 C90,48 76,52 72,62 C69,70 70,80 76,88 C82,94 92,96 100,94 Z" [attr.fill]="colorFor('Pecho')" />
                <path d="M100,50 C110,48 124,52 128,62 C131,70 130,80 124,88 C118,94 108,96 100,94 Z" [attr.fill]="colorFor('Pecho')" />
                <g stroke="var(--ink)" stroke-width="1" fill="none" opacity="0.6">
                  <path d="M100,94 L100,150" />
                  <path d="M88,110 L112,110" />
                  <path d="M87,128 L113,128" />
                  <path d="M88,146 L112,146" />
                </g>
                <ellipse cx="54" cy="96" rx="16" ry="36" transform="rotate(-8 54 96)" [attr.fill]="colorFor('Bíceps')" />
                <ellipse cx="146" cy="96" rx="16" ry="36" transform="rotate(8 146 96)" [attr.fill]="colorFor('Bíceps')" />
                <ellipse cx="46" cy="158" rx="11" ry="38" transform="rotate(-6 46 158)" [attr.fill]="colorFor('Antebrazo')" />
                <ellipse cx="154" cy="158" rx="11" ry="38" transform="rotate(6 154 158)" [attr.fill]="colorFor('Antebrazo')" />
                <g stroke="var(--ink)" stroke-width="1" fill="none" opacity="0.45">
                  <path d="M50,66 Q45,96 49,126" />
                  <path d="M150,66 Q155,96 151,126" />
                  <path d="M43,124 Q40,158 43,192" />
                  <path d="M157,124 Q160,158 157,192" />
                </g>
                <ellipse cx="66" cy="62" rx="17" ry="13" transform="rotate(-12 66 62)" [attr.fill]="colorFor('Hombro')" />
                <ellipse cx="134" cy="62" rx="17" ry="13" transform="rotate(12 134 62)" [attr.fill]="colorFor('Hombro')" />
                <path d="M58,52 Q66,62 60,74" stroke="var(--ink)" stroke-width="1" fill="none" opacity="0.45" />
                <path d="M142,52 Q134,62 140,74" stroke="var(--ink)" stroke-width="1" fill="none" opacity="0.45" />
                <circle cx="82" cy="283" r="7" fill="var(--paper-card)" />
                <circle cx="118" cy="283" r="7" fill="var(--paper-card)" />
                <ellipse cx="42" cy="202" rx="9" ry="12" fill="var(--paper-card)" />
                <ellipse cx="158" cy="202" rx="9" ry="12" fill="var(--paper-card)" />
                <path d="M36 210 L33 222 M42 212 L41 224 M48 210 L50 222" />
                <path d="M152 210 L149 222 M158 212 L157 224 M164 210 L166 222" />
                <rect x="92" y="42" width="16" height="12" rx="3" fill="var(--paper-card)" />
                <ellipse cx="100" cy="28" rx="16" ry="18" fill="var(--paper-card)" />
              </g>
            </svg>
          </div>
          <div class="figure-col">
            <p class="figure-label">Espalda</p>
            <svg viewBox="0 0 200 420" class="body-svg">
              <g stroke="var(--ink)" stroke-width="1.5" stroke-linejoin="round">
                <ellipse cx="82" cy="228" rx="25" ry="68" transform="rotate(-3 82 228)" [attr.fill]="colorFor('Pierna')" />
                <ellipse cx="118" cy="228" rx="25" ry="68" transform="rotate(3 118 228)" [attr.fill]="colorFor('Pierna')" />
                <ellipse cx="80" cy="330" rx="15" ry="60" transform="rotate(-2 80 330)" [attr.fill]="colorFor('Pierna')" />
                <ellipse cx="120" cy="330" rx="15" ry="60" transform="rotate(2 120 330)" [attr.fill]="colorFor('Pierna')" />
                <g stroke="var(--ink)" stroke-width="1" fill="none" opacity="0.45">
                  <path d="M74,168 Q78,228 75,286" />
                  <path d="M90,168 Q86,228 89,286" />
                  <path d="M126,168 Q122,228 125,286" />
                  <path d="M110,168 Q114,228 111,286" />
                  <path d="M76,278 Q72,330 76,382" />
                  <path d="M124,278 Q128,330 124,382" />
                </g>
                <ellipse cx="78" cy="398" rx="18" ry="11" fill="var(--paper-card)" />
                <ellipse cx="122" cy="398" rx="18" ry="11" fill="var(--paper-card)" />
                <path d="M82,94 C82,88 90,86 100,86 C110,86 118,88 118,94 L122,136 C122,152 110,163 100,163 C90,163 78,152 78,136 Z" [attr.fill]="colorFor('Glúteo')" />
                <path d="M100,50 C90,48 76,52 72,62 C69,70 70,80 76,88 C82,94 92,96 100,94 Z" [attr.fill]="colorFor('Espalda')" />
                <path d="M100,50 C110,48 124,52 128,62 C131,70 130,80 124,88 C118,94 108,96 100,94 Z" [attr.fill]="colorFor('Espalda')" />
                <g stroke="var(--ink)" stroke-width="1" fill="none" opacity="0.6">
                  <path d="M100,94 L100,120" />
                  <path d="M80,58 L94,88" />
                  <path d="M120,58 L106,88" />
                  <path d="M100,96 L100,150" />
                  <path d="M84,120 Q100,128 116,120" />
                </g>
                <ellipse cx="54" cy="96" rx="16" ry="36" transform="rotate(-8 54 96)" [attr.fill]="colorFor('Tríceps')" />
                <ellipse cx="146" cy="96" rx="16" ry="36" transform="rotate(8 146 96)" [attr.fill]="colorFor('Tríceps')" />
                <ellipse cx="46" cy="158" rx="11" ry="38" transform="rotate(-6 46 158)" [attr.fill]="colorFor('Antebrazo')" />
                <ellipse cx="154" cy="158" rx="11" ry="38" transform="rotate(6 154 158)" [attr.fill]="colorFor('Antebrazo')" />
                <g stroke="var(--ink)" stroke-width="1" fill="none" opacity="0.45">
                  <path d="M50,66 Q45,96 49,126" />
                  <path d="M150,66 Q155,96 151,126" />
                  <path d="M43,124 Q40,158 43,192" />
                  <path d="M157,124 Q160,158 157,192" />
                </g>
                <ellipse cx="66" cy="62" rx="17" ry="13" transform="rotate(-12 66 62)" [attr.fill]="colorFor('Hombro')" />
                <ellipse cx="134" cy="62" rx="17" ry="13" transform="rotate(12 134 62)" [attr.fill]="colorFor('Hombro')" />
                <path d="M58,52 Q66,62 60,74" stroke="var(--ink)" stroke-width="1" fill="none" opacity="0.45" />
                <path d="M142,52 Q134,62 140,74" stroke="var(--ink)" stroke-width="1" fill="none" opacity="0.45" />
                <circle cx="82" cy="283" r="7" fill="var(--paper-card)" />
                <circle cx="118" cy="283" r="7" fill="var(--paper-card)" />
                <ellipse cx="42" cy="202" rx="9" ry="12" fill="var(--paper-card)" />
                <ellipse cx="158" cy="202" rx="9" ry="12" fill="var(--paper-card)" />
                <path d="M36 210 L33 222 M42 212 L41 224 M48 210 L50 222" />
                <path d="M152 210 L149 222 M158 212 L157 224 M164 210 L166 222" />
                <rect x="92" y="42" width="16" height="12" rx="3" fill="var(--paper-card)" />
                <ellipse cx="100" cy="28" rx="16" ry="18" fill="var(--paper-card)" />
              </g>
            </svg>
          </div>
        </div>

        <div class="figures card" *ngIf="viewMode === 'foto'">
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
    .view-toggle { display: flex; gap: 6px; }
    .view-toggle .btn-ghost.active { background: var(--iron); color: #F1ECDD; border-color: var(--iron); }
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
    .body-svg { width: 150px; height: 300px; }
    .photo-wrap { position: relative; width: 150px; height: 340px; }
    .body-photo { width: 100%; height: 100%; object-fit: contain; }
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
  viewMode: "dibujo" | "foto" = "dibujo";
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
sass
