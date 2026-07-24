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
            <g stroke="var(--ink)" stroke-width="1.5" stroke-linejoin="round">
              <ellipse cx="100" cy="28" rx="15" ry="16" fill="var(--paper-card)" />
              <rect x="93" y="42" width="14" height="12" rx="3" fill="var(--paper-card)" />
              <ellipse cx="60" cy="64" rx="15" ry="12" transform="rotate(-15 60 64)" [attr.fill]="colorFor('Hombro')" />
              <ellipse cx="140" cy="64" rx="15" ry="12" transform="rotate(15 140 64)" [attr.fill]="colorFor('Hombro')" />
              <path d="M70,56 C70,50 80,48 100,48 C120,48 130,50 130,56 L124,102 C124,110 114,114 100,114 C86,114 76,110 76,102 Z" [attr.fill]="colorFor('Pecho')" />
              <path d="M78,104 L122,104 L116,148 C116,156 108,160 100,160 C92,160 84,156 84,148 Z" [attr.fill]="colorFor('Abdomen')" />
              <ellipse cx="46" cy="118" rx="12" ry="58" transform="rotate(-10 46 118)" [attr.fill]="colorFor('Bíceps')" />
              <ellipse cx="154" cy="118" rx="12" ry="58" transform="rotate(10 154 118)" [attr.fill]="colorFor('Bíceps')" />
              <circle cx="40" cy="174" r="7" fill="var(--paper-card)" />
              <circle cx="160" cy="174" r="7" fill="var(--paper-card)" />
              <ellipse cx="86" cy="272" rx="18" ry="92" transform="rotate(-4 86 272)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="114" cy="272" rx="18" ry="92" transform="rotate(4 114 272)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="83" cy="370" rx="13" ry="8" fill="var(--paper-card)" />
              <ellipse cx="117" cy="370" rx="13" ry="8" fill="var(--paper-card)" />
            </g>
          </svg>
        </div>
        <div class="figure-col">
          <p class="figure-label">Espalda</p>
          <svg viewBox="0 0 200 400" class="body-svg">
            <g stroke="var(--ink)" stroke-width="1.5" stroke-linejoin="round">
              <ellipse cx="100" cy="28" rx="15" ry="16" fill="var(--paper-card)" />
              <rect x="93" y="42" width="14" height="12" rx="3" fill="var(--paper-card)" />
              <ellipse cx="60" cy="64" rx="15" ry="12" transform="rotate(-15 60 64)" [attr.fill]="colorFor('Hombro')" />
              <ellipse cx="140" cy="64" rx="15" ry="12" transform="rotate(15 140 64)" [attr.fill]="colorFor('Hombro')" />
              <path d="M70,56 C70,50 80,48 100,48 C120,48 130,50 130,56 L124,102 C124,110 114,114 100,114 C86,114 76,110 76,102 Z" [attr.fill]="colorFor('Espalda')" />
              <path d="M80,104 C80,100 90,98 100,98 C110,98 120,100 120,104 L124,130 C124,142 112,150 100,150 C88,150 76,142 76,130 Z" [attr.fill]="colorFor('Glúteo')" />
              <ellipse cx="46" cy="118" rx="12" ry="58" transform="rotate(-10 46 118)" [attr.fill]="colorFor('Tríceps')" />
              <ellipse cx="154" cy="118" rx="12" ry="58" transform="rotate(10 154 118)" [attr.fill]="colorFor('Tríceps')" />
              <circle cx="40" cy="174" r="7" fill="var(--paper-card)" />
              <circle cx="160" cy="174" r="7" fill="var(--paper-card)" />
              <ellipse cx="86" cy="272" rx="18" ry="92" transform="rotate(-4 86 272)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="114" cy="272" rx="18" ry="92" transform="rotate(4 114 272)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="83" cy="370" rx="13" ry="8" fill="var(--paper-card)" />
              <ellipse cx="117" cy="370" rx="13" ry="8" fill="var(--paper-card)" />
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
    .body-svg { width: 150px; height: 300px; }
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
