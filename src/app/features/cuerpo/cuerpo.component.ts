import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkoutSession } from "../../core/models";
import { MuscleGroup } from "../../core/exercise-library";
import { computeMuscleScores, intensityColor, MuscleScore } from "../../core/muscle-scores";

@Component({
  selector: "app-cuerpo",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="section-title"><h2>Cuerpo</h2></div>
      <p class="hint">Qué tanto trabajaste cada grupo muscular en los últimos 30 días (frecuencia + volumen).</p>

      <div class="figures card">
        <div class="figure-col">
          <p class="figure-label">Frente</p>
          <svg viewBox="0 0 200 400" class="body-svg">
            <g stroke="var(--ink)" stroke-width="1.5">
              <circle cx="100" cy="26" r="16" fill="var(--paper-card)" />
              <rect x="92" y="40" width="16" height="14" fill="var(--paper-card)" />
              <ellipse cx="62" cy="66" rx="14" ry="12" [attr.fill]="colorFor('Hombro')" />
              <ellipse cx="138" cy="66" rx="14" ry="12" [attr.fill]="colorFor('Hombro')" />
              <rect x="72" y="56" width="56" height="52" rx="10" [attr.fill]="colorFor('Pecho')" />
              <rect x="76" y="110" width="48" height="46" rx="8" [attr.fill]="colorFor('Abdomen')" />
              <rect x="38" y="62" width="20" height="92" rx="9" [attr.fill]="colorFor('Brazo')" />
              <rect x="142" y="62" width="20" height="92" rx="9" [attr.fill]="colorFor('Brazo')" />
              <rect x="74" y="160" width="24" height="120" rx="10" [attr.fill]="colorFor('Pierna')" />
              <rect x="102" y="160" width="24" height="120" rx="10" [attr.fill]="colorFor('Pierna')" />
            </g>
          </svg>
        </div>
        <div class="figure-col">
          <p class="figure-label">Espalda</p>
          <svg viewBox="0 0 200 400" class="body-svg">
            <g stroke="var(--ink)" stroke-width="1.5">
              <circle cx="100" cy="26" r="16" fill="var(--paper-card)" />
              <rect x="92" y="40" width="16" height="14" fill="var(--paper-card)" />
              <ellipse cx="62" cy="66" rx="14" ry="12" [attr.fill]="colorFor('Hombro')" />
              <ellipse cx="138" cy="66" rx="14" ry="12" [attr.fill]="colorFor('Hombro')" />
              <rect x="72" y="56" width="56" height="52" rx="10" [attr.fill]="colorFor('Espalda')" />
              <rect x="76" y="110" width="48" height="40" rx="8" [attr.fill]="colorFor('Glúteo')" />
              <rect x="38" y="62" width="20" height="92" rx="9" [attr.fill]="colorFor('Brazo')" />
              <rect x="142" y="62" width="20" height="92" rx="9" [attr.fill]="colorFor('Brazo')" />
              <rect x="74" y="154" width="24" height="126" rx="10" [attr.fill]="colorFor('Pierna')" />
              <rect x="102" y="154" width="24" height="126" rx="10" [attr.fill]="colorFor('Pierna')" />
            </g>
          </svg>
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
    .figures { display: flex; justify-content: center; gap: 32px; padding: 20px; margin-bottom: 24px; }
    .figure-col { display: flex; flex-direction: column; align-items: center; }
    .figure-label { font-family: var(--font-head); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 8px; }
    .body-svg { width: 140px; height: 280px; }
    .legend { display: flex; flex-direction: column; gap: 8px; }
    .legend-row { display: grid; grid-template-columns: 14px 100px 1fr 110px; align-items: center; gap: 10px; font-size: 12.5px; }
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
