import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { findIllustration } from "../core/exercise-library";
import { ApiService } from "../core/api.service";
import { ExercisePhoto } from "../core/models";
import { resizeImageToDataUrl } from "../core/image-utils";

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB - antes de intentar procesarla

@Component({
  selector: "app-exercise-illustration",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="outer">
      <div class="wrap" [style.width.px]="size" [style.height.px]="size" [title]="label">
        <img *ngIf="photoUrl" [src]="photoUrl" class="photo" />
        <div *ngIf="!photoUrl && svg" [innerHTML]="svg" class="svg-box"></div>
        <span *ngIf="!photoUrl && !svg" class="fallback">🏋</span>
        <div class="spinner" *ngIf="busy">…</div>

        <ng-container *ngIf="editable">
          <button class="mini-btn remove" *ngIf="photoUrl && !busy" (click)="remove()" title="Quitar foto">✕</button>
          <button class="mini-btn upload" *ngIf="!photoUrl && !busy" (click)="attemptUpload()" title="Subir foto de referencia">📷</button>
          <input #fileInput type="file" accept="image/*" hidden (change)="onFile($event)" />
        </ng-container>
      </div>
      <p class="photo-error" *ngIf="error">{{ error }}</p>
    </div>
  `,
  styles: [`
    .outer { display: inline-flex; flex-direction: column; gap: 2px; max-width: 140px; }
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
    .spinner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--ink-soft); }
    .mini-btn {
      position: absolute; bottom: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%;
      border: 1.5px solid var(--paper-line); background: var(--paper-card); font-size: 9px; line-height: 1;
      display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;
    }
    .mini-btn.remove { color: var(--rust); }
    .photo-error { font-size: 10px; color: var(--rust); margin: 0; line-height: 1.3; }
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
  @ViewChild("fileInput") fileInputRef?: ElementRef<HTMLInputElement>;

  busy = false;
  error = "";

  get svg(): SafeHtml | null {
    const match = findIllustration(this.name);
    return match ? this.sanitizer.bypassSecurityTrustHtml(match.svg) : null;
  }
  get label(): string {
    return findIllustration(this.name)?.label || "Ejercicio";
  }

  constructor(private sanitizer: DomSanitizer, private api: ApiService) {}

  attemptUpload() {
    this.error = "";
    if (!this.name.trim()) {
      this.error = "Escribe primero el nombre del ejercicio.";
      return;
    }
    this.fileInputRef?.nativeElement.click();
  }

  async onFile(event: Event) {
    this.error = "";
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!this.name.trim()) {
      this.error = "Escribe primero el nombre del ejercicio.";
      input.value = "";
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.error = "Esa imagen es muy pesada. Prueba con otra foto o achícala primero.";
      input.value = "";
      return;
    }

    this.busy = true;
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      const photo = await this.api.uploadExercisePhoto(this.name.trim(), dataUrl);
      this.photoUploaded.emit(photo);
    } catch (err: any) {
      const msg = err?.error?.error;
      this.error = typeof msg === "string" ? msg : "No se pudo subir la foto. Intenta con otra imagen.";
    } finally {
      this.busy = false;
      input.value = "";
    }
  }

  async remove() {
    if (!this.photoId) return;
    this.error = "";
    this.busy = true;
    try {
      await this.api.deleteExercisePhoto(this.photoId);
      this.photoRemoved.emit(this.photoId);
    } catch (err: any) {
      const msg = err?.error?.error;
      this.error = typeof msg === "string" ? msg : "No se pudo quitar la foto.";
    } finally {
      this.busy = false;
    }
  }
}
