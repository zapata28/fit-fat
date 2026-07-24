import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { findIllustration } from "../core/exercise-library";
import { ApiService } from "../core/api.service";
import { ExercisePhoto } from "../core/models";
import { resizeImageToDataUrl } from "../core/image-utils";

@Component({
  selector: "app-exercise-illustration",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wrap" [style.width.px]="size" [style.height.px]="size" [title]="label">
      <img *ngIf="photoUrl" [src]="photoUrl" class="photo" />
      <div *ngIf="!photoUrl && svg" [innerHTML]="svg" class="svg-box"></div>
      <span *ngIf="!photoUrl && !svg" class="fallback">🏋</span>

      <ng-container *ngIf="editable">
        <button class="mini-btn remove" *ngIf="photoUrl" (click)="remove()" [disabled]="busy" title="Quitar foto">✕</button>
        <button class="mini-btn upload" *ngIf="!photoUrl" (click)="fileInput.click()" [disabled]="busy" title="Subir foto de referencia">📷</button>
        <input #fileInput type="file" accept="image/*" hidden (change)="onFile($event)" />
      </ng-container>
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
      position: relative;
      overflow: visible;
    }
    .svg-box { width: 100%; height: 100%; }
    .photo { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
    .fallback { color: var(--paper-line); font-size: 18px; }
    .mini-btn {
      position: absolute; bottom: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%;
      border: 1.5px solid var(--paper-line); background: var(--paper-card); font-size: 9px; line-height: 1;
      display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;
    }
    .mini-btn.remove { color: var(--rust); }
    .mini-btn:disabled { opacity: 0.5; cursor: default; }
  `],
})
export class ExerciseIllustrationComponent {
  @Input() name = "";
  @Input() photoUrl: string | null = null;
  @Input() photoId: string | null = null;
  @Input() size = 44;
  @Input() editable = true;
  @Output() photoUploaded = new EventEmitter<ExercisePhoto>();
  @Output() photoRemoved = new EventEmitter<string>();

  busy = false;

  get svg(): SafeHtml | null {
    const match = findIllustration(this.name);
    return match ? this.sanitizer.bypassSecurityTrustHtml(match.svg) : null;
  }
  get label(): string {
    return findIllustration(this.name)?.label || "Ejercicio";
  }

  constructor(private sanitizer: DomSanitizer, private api: ApiService) {}

  async onFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.name.trim()) return;
    this.busy = true;
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      const photo = await this.api.uploadExercisePhoto(this.name.trim(), dataUrl);
      this.photoUploaded.emit(photo);
    } catch {
      // silently ignore - the button just stays available to retry
    } finally {
      this.busy = false;
      input.value = "";
    }
  }

  async remove() {
    if (!this.photoId) return;
    this.busy = true;
    try {
      await this.api.deleteExercisePhoto(this.photoId);
      this.photoRemoved.emit(this.photoId);
    } finally {
      this.busy = false;
    }
  }
}
