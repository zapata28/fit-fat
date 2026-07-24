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
              <ellipse cx="84" cy="266" rx="22" ry="116" transform="rotate(-3 84 266)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="116" cy="266" rx="22" ry="116" transform="rotate(3 116 266)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="80" cy="380" rx="16" ry="10" fill="var(--paper-card)" />
              <ellipse cx="120" cy="380" rx="16" ry="10" fill="var(--paper-card)" />
              <path d="M76,100 L124,100 L118,150 C118,160 108,165 100,165 C92,165 82,160 82,150 Z" [attr.fill]="colorFor('Abdomen')" />
              <path d="M68,54 C68,48 80,44 100,44 C120,44 132,48 132,54 L126,104 C126,113 114,118 100,118 C86,118 74,113 74,104 Z" [attr.fill]="colorFor('Pecho')" />
              <ellipse cx="50" cy="126" rx="15" ry="68" transform="rotate(-9 50 126)" [attr.fill]="colorFor('Bíceps')" />
              <ellipse cx="150" cy="126" rx="15" ry="68" transform="rotate(9 150 126)" [attr.fill]="colorFor('Bíceps')" />
              <ellipse cx="68" cy="62" rx="18" ry="14" transform="rotate(-12 68 62)" [attr.fill]="colorFor('Hombro')" />
              <ellipse cx="132" cy="62" rx="18" ry="14" transform="rotate(12 132 62)" [attr.fill]="colorFor('Hombro')" />
              <circle cx="44" cy="196" r="9" fill="var(--paper-card)" />
              <circle cx="156" cy="196" r="9" fill="var(--paper-card)" />
              <rect x="91" y="44" width="18" height="14" rx="4" fill="var(--paper-card)" />
              <ellipse cx="100" cy="30" rx="17" ry="19" fill="var(--paper-card)" />
            </g>
          </svg>
        </div>
        <div class="figure-col">
          <p class="figure-label">Espalda</p>
          <svg viewBox="0 0 200 400" class="body-svg">
            <g stroke="var(--ink)" stroke-width="1.5" stroke-linejoin="round">
              <ellipse cx="84" cy="266" rx="22" ry="116" transform="rotate(-3 84 266)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="116" cy="266" rx="22" ry="116" transform="rotate(3 116 266)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="80" cy="380" rx="16" ry="10" fill="var(--paper-card)" />
              <ellipse cx="120" cy="380" rx="16" ry="10" fill="var(--paper-card)" />
              <path d="M78,102 C78,96 88,94 100,94 C112,94 122,96 122,102 L126,138 C126,150 114,158 100,158 C86,158 74,150 74,138 Z" [attr.fill]="colorFor('Glúteo')" />
              <path d="M68,54 C68,48 80,44 100,44 C120,44 132,48 132,54 L126,104 C126,113 114,118 100,118 C86,118 74,113 74,104 Z" [attr.fill]="colorFor('Espalda')" />
              <ellipse cx="50" cy="126" rx="15" ry="68" transform="rotate(-9 50 126)" [attr.fill]="colorFor('Tríceps')" />
              <ellipse cx="150" cy="126" rx="15" ry="68" transform="rotate(9 150 126)" [attr.fill]="colorFor('Tríceps')" />
              <ellipse cx="68" cy="62" rx="18" ry="14" transform="rotate(-12 68 62)" [attr.fill]="colorFor('Hombro')" />
              <ellipse cx="132" cy="62" rx="18" ry="14" transform="rotate(12 132 62)" [attr.fill]="colorFor('Hombro')" />
              <circle cx="44" cy="196" r="9" fill="var(--paper-card)" />
              <circle cx="156" cy="196" r="9" fill="var(--paper-card)" />
              <rect x="91" y="44" width="18" height="14" rx="4" fill="var(--paper-card)" />
              <ellipse cx="100" cy="30" rx="17" ry="19" fill="var(--paper-card)" />
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
