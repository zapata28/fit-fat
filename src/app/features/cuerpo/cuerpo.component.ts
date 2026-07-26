import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WorkoutSession, Measurement } from "../../core/models";
import { MuscleGroup } from "../../core/exercise-library";
import { computeMuscleScores, intensityColor, MuscleScore } from "../../core/muscle-scores";
import { fmtDate } from "../../core/utils";

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
          <svg viewBox="0 0 200 420" class="body-svg">
            <g stroke="var(--ink)" stroke-width="1.5" stroke-linejoin="round">
              <ellipse cx="82" cy="228" rx="25" ry="68" transform="rotate(-3 82 228)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="118" cy="228" rx="25" ry="68" transform="rotate(3 118 228)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="80" cy="330" rx="15" ry="60" transform="rotate(-2 80 330)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="120" cy="330" rx="15" ry="60" transform="rotate(2 120 330)" [attr.fill]="colorFor('Pierna')" />
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
              <ellipse cx="46" cy="158" rx="11" ry="38" transform="rotate(-6 46 158)" [attr.fill]="colorFor('Bíceps')" />
              <ellipse cx="154" cy="158" rx="11" ry="38" transform="rotate(6 154 158)" [attr.fill]="colorFor('Bíceps')" />
              <ellipse cx="66" cy="62" rx="17" ry="13" transform="rotate(-12 66 62)" [attr.fill]="colorFor('Hombro')" />
              <ellipse cx="134" cy="62" rx="17" ry="13" transform="rotate(12 134 62)" [attr.fill]="colorFor('Hombro')" />
              <ellipse cx="42" cy="202" rx="9" ry="12" fill="var(--paper-card)" />
              <ellipse cx="158" cy="202" rx="9" ry="12" fill="var(--paper-card)" />
              <rect x="92" y="42" width="16" height="12" rx="3" fill="var(--paper-card)" />
              <ellipse cx="100" cy="28" rx="16" ry="18" fill="var(--paper-card)" />
            </g>
          </svg>
          <div class="measure-list" *ngIf="latest as m">
            <div class="measure-row" *ngIf="m.chest != null"><span>Pecho</span><strong>{{ m.chest }} cm</strong></div>
            <div class="measure-row" *ngIf="m.arm != null"><span>Brazo</span><strong>{{ m.arm }} cm</strong></div>
            <div class="measure-row" *ngIf="m.waist != null"><span>Cintura</span><strong>{{ m.waist }} cm</strong></div>
            <div class="measure-row" *ngIf="m.hips != null"><span>Cadera</span><strong>{{ m.hips }} cm</strong></div>
            <div class="measure-row" *ngIf="m.thigh != null"><span>Muslo</span><strong>{{ m.thigh }} cm</strong></div>
          </div>
        </div>
        <div class="figure-col">
          <p class="figure-label">Espalda</p>
          <svg viewBox="0 0 200 420" class="body-svg">
            <g stroke="var(--ink)" stroke-width="1.5" stroke-linejoin="round">
              <ellipse cx="82" cy="228" rx="25" ry="68" transform="rotate(-3 82 228)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="118" cy="228" rx="25" ry="68" transform="rotate(3 118 228)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="80" cy="330" rx="15" ry="60" transform="rotate(-2 80 330)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="120" cy="330" rx="15" ry="60" transform="rotate(2 120 330)" [attr.fill]="colorFor('Pierna')" />
              <ellipse cx="78" cy="398" rx="18" ry="11" fill="var(--paper-card)" />
              <ellipse cx="122" cy="398" rx="18" ry="11" fill="var(--paper-card)" />
              <path d="M82,94 C82,88 90,86 100,86 C110,86 118,88 118,94 L122,136 C122,152 110,163 100,163 C90,163 78,152 78,136 Z" [attr.fill]="colorFor('Glúteo')" />
              <path d="M100,50 C90,48 76,52 72,62 C69,70 70,80 76,88 C82,94 92,96 100,94 Z" [attr.fill]="colorFor('Espalda')" />
              <path d="M100,50 C110,48 124,52 128,62 C131,70 130,80 124,88 C118,94 108,96 100,94 Z" [attr.fill]="colorFor('Espalda')" />
              <g stroke="var(--ink)" stroke-width="1" fill="none" opacity="0.6">
                <path d="M100,94 L100,120" />
              </g>
              <ellipse cx="54" cy="96" rx="16" ry="36" transform="rotate(-8 54 96)" [attr.fill]="colorFor('Tríceps')" />
              <ellipse cx="146" cy="96" rx="16" ry="36" transform="rotate(8 146 96)" [attr.fill]="colorFor('Tríceps')" />
              <ellipse cx="46" cy="158" rx="11" ry="38" transform="rotate(-6 46 158)" [attr.fill]="colorFor('Tríceps')" />
              <ellipse cx="154" cy="158" rx="11" ry="38" transform="rotate(6 154 158)" [attr.fill]="colorFor('Tríceps')" />
              <ellipse cx="66" cy="62" rx="17" ry="13" transform="rotate(-12 66 62)" [attr.fill]="colorFor('Hombro')" />
              <ellipse cx="134" cy="62" rx="17" ry="13" transform="rotate(12 134 62)" [attr.fill]="colorFor('Hombro')" />
              <ellipse cx="42" cy="202" rx="9" ry="12" fill="var(--paper-card)" />
              <ellipse cx="158" cy="202" rx="9" ry="12" fill="var(--paper-card)" />
              <rect x="92" y="42" width="16" height="12" rx="3" fill="var(--paper-card)" />
              <ellipse cx="100" cy="28" rx="16" ry="18" fill="var(--paper-card)" />
            </g>
          </svg>
          <div class="measure-list" *ngIf="latest as m">
            <div class="measure-row" *ngIf="m.neck != null"><span>Espalda</span><strong>{{ m.neck }} cm</strong></div>
            <div class="measure-row" *ngIf="m.hips != null"><span>Cadera</span><strong>{{ m.hips }} cm</strong></div>
            <div class="measure-row" *ngIf="m.thigh != null"><span>Muslo</span><strong>{{ m.thigh }} cm</strong></div>
          </div>
        </div>
      </div>

      <p class="measure-date" *ngIf="latest">Medidas del {{ fmtDate(latest.date) }}</p>
      <p class="muted" *ngIf="!latest">Aún no tienes medidas registradas — agrégalas en la pestaña Medidas para verlas aquí.</p>

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
    .figures { display: flex; justify-content: center; gap: 32px; padding: 20px; margin-bottom: 8px; flex-wrap: wrap; }
    .figure-col { display: flex; flex-direction: column; align-items: center; }
    .figure-label { font-family: var(--font-head); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); margin: 0 0 8px; }
    .body-svg { width: 170px; height: 340px; }
    .measure-list { margin-top: 10px; width: 100%; max-width: 170px; display: flex; flex-direction: column; gap: 4px; }
    .measure-row { display: flex; justify-content: space-between; font-size: 12px; border-bottom: 1px dashed var(--paper-line); padding-bottom: 3px; }
    .measure-row span { color: var(--ink-soft); }
    .measure-row strong { color: var(--ink); }
    .measure-date { text-align: center; font-size: 11px; color: var(--ink-soft); margin: 0 0 24px; }
    .legend { display: flex; flex-direction: column; gap: 8px; }
    .legend-row { display: grid; grid-template-columns: 14px 90px 1fr 110px; align-items: center; gap: 10px; font-size: 12.5px; }
    .swatch { width: 14px; height: 14px; border-radius: 3px; border: 1px solid var(--paper-line); }
    .g-name { color: var(--ink); }
    .bar-track { height: 8px; border-radius: 4px; background: var(--paper-line); overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; }
    .g-detail { color: var(--ink-soft); font-size: 11px; text-align: right; white-space: nowrap; }
    .muted { color: var(--ink-soft); font-size: 13px; text-align: center; }
  `],
})
export class CuerpoComponent {
  @Input() sessions: WorkoutSession[] = [];
  @Input() measurements: Measurement[] = [];
  fmtDate = fmtDate;

  get latest(): Measurement | null {
    if (this.measurements.length === 0) return null;
    return [...this.measurements].sort((a, b) => b.date.localeCompare(a.date))[0];
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
