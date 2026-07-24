import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface ChartPoint {
  label: string;
  value: number;
}

@Component({
  selector: "app-line-chart",
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg *ngIf="points.length > 1" [attr.viewBox]="'0 0 ' + w + ' ' + h" width="100%" [style.height.px]="h">
      <!-- grid lines -->
      <line *ngFor="let gy of gridYs" [attr.x1]="padL" [attr.x2]="w - padR" [attr.y1]="gy" [attr.y2]="gy" stroke="var(--paper-line)" stroke-width="1" />

      <!-- line path -->
      <polyline [attr.points]="linePoints" fill="none" [attr.stroke]="color" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

      <!-- dots -->
      <circle *ngFor="let p of scaled" [attr.cx]="p.x" [attr.cy]="p.y" r="3.5" [attr.fill]="color" />

      <!-- x labels -->
      <text *ngFor="let p of scaled" [attr.x]="p.x" [attr.y]="h - 6" text-anchor="middle" class="axis-label">{{ p.label }}</text>

      <!-- y labels (min/max) -->
      <text [attr.x]="padL - 6" [attr.y]="padT + 4" text-anchor="end" class="axis-label">{{ maxVal }}</text>
      <text [attr.x]="padL - 6" [attr.y]="h - padB" text-anchor="end" class="axis-label">{{ minVal }}</text>
    </svg>
    <p *ngIf="points.length <= 1" class="empty">{{ emptyMessage }}</p>
  `,
  styles: [`
    .axis-label { font-family: var(--font-mono); font-size: 9px; fill: var(--ink-soft); }
    .empty { font-size: 13px; color: var(--ink-soft); padding: 0 16px 12px; }
  `],
})
export class LineChartComponent {
  @Input() points: ChartPoint[] = [];
  @Input() color = "var(--rust)";
  @Input() emptyMessage = "No hay suficientes datos todavía.";

  w = 600;
  h = 200;
  padL = 34;
  padR = 16;
  padT = 14;
  padB = 22;

  get minVal(): number {
    return Math.min(...this.points.map((p) => p.value));
  }
  get maxVal(): number {
    return Math.max(...this.points.map((p) => p.value));
  }

  get scaled(): { x: number; y: number; label: string }[] {
    if (this.points.length < 2) return [];
    const min = this.minVal;
    const max = this.maxVal;
    const range = max - min || 1;
    const stepX = (this.w - this.padL - this.padR) / (this.points.length - 1);
    return this.points.map((p, i) => ({
      x: this.padL + i * stepX,
      y: this.padT + (1 - (p.value - min) / range) * (this.h - this.padT - this.padB),
      label: p.label,
    }));
  }

  get linePoints(): string {
    return this.scaled.map((p) => `${p.x},${p.y}`).join(" ");
  }

  get gridYs(): number[] {
    return [this.padT, (this.h - this.padT - this.padB) / 2 + this.padT, this.h - this.padB];
  }
}
