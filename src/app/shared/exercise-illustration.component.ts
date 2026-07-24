import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { findIllustration } from "../core/exercise-library";

@Component({
  selector: "app-exercise-illustration",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wrap" [style.width.px]="size" [style.height.px]="size" [title]="label">
      <div *ngIf="svg" [innerHTML]="svg" class="svg-box"></div>
      <span *ngIf="!svg" class="fallback">🏋</span>
    </div>
  `,
  styles: [`
    .wrap {
      flex-shrink: 0;
      border-radius: 6px;
      border: 1.5px solid var(--paper-line);
      background: var(--paper-card);
      color: var(--iron);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
    }
    .svg-box { width: 100%; height: 100%; }
    .fallback { color: var(--paper-line); font-size: 18px; }
  `],
})
export class ExerciseIllustrationComponent {
  @Input() name = "";
  @Input() size = 44;

  get svg(): SafeHtml | null {
    const match = findIllustration(this.name);
    return match ? this.sanitizer.bypassSecurityTrustHtml(match.svg) : null;
  }
  get label(): string {
    return findIllustration(this.name)?.label || "Ejercicio";
  }

  constructor(private sanitizer: DomSanitizer) {}
}
