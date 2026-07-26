import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { findIllustration } from "../core/exercise-library";
import { ApiService } from "../core/api.service";
import { ExercisePhoto } from "../core/models";
import { resizeImageToDataUrl } from "../core/image-utils";

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB - antes de intentar procesarla

type PendingAction = "edit" | "remove" | null;

@Component({
  selector: "app-exercise-illustration",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="outer">
      <div class="wrap" [style.width.px]="size" [style.height.px]="size" [title]="photoUrl ? 'Ver foto completa' : label">
        <img *ngIf="photoUrl" [src]="photoUrl" class="photo clickable" (click)="showPreview = true" />
        <div *ngIf="!photoUrl && svg" [innerHTML]="svg" class="svg-box"></div>
        <span *ngIf="!photoUrl && !svg" class="fallback">🏋</span>
        <div class="spinner" *ngIf="busy">…</div>

        <ng-container *ngIf="editable && !pendingAction">
          <button class="mini-btn edit" *ngIf="photoUrl && !busy" (click)="requestEdit()" title="Cambiar foto">✏️</button>
          <button class="mini-btn remove" *ngIf="photoUrl && !busy" (click)="requestRemove()" title="Quitar foto">✕</button>
          <button class="mini-btn upload" *ngIf="!photoUrl && !busy" (click)="attemptUpload()" title="Subir foto de referencia">📷</button>
          <input #fileInput type="file" accept="image/*" hidden (change)="onFile($event)" />
        </ng-container>

        <div class="confirm-box" *ngIf="pendingAction">
          <p>{{ pendingAction === "remove" ? "¿Quitar esta foto?" : "¿Cambiar esta foto?" }}</p>
          <div class="confirm-actions">
            <button class="confirm-yes" (click)="confirmAction()">Sí</button>
            <button class="confirm-no" (click)="cancelAction()">No</button>
          </div>
        </div>
      </div>
      <p class="photo-error" *ngIf="error">{{ error }}</p>
    </div>

    <div class="preview-backdrop" *ngIf="showPreview" (click)="showPreview = false">
      <button class="preview-close" (click)="showPreview = false">✕</button>
      <img [src]="photoUrl" class="preview-img" (click)="$event.stopPropagation()" />
      <p class="preview-label">{{ label }}</p>
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
    .photo.clickable { cursor: zoom-in; }
    .fallback { color: var(--paper-line); font-size: 18px; }
    .spinner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--ink-soft); }
    .mini-btn {
      position: absolute; bottom: -6px; width: 18px; height: 18px; border-radius: 50%;
      border: 1.5px solid var(--paper-line); background: var(--paper-card); font-size: 9px; line-height: 1;
      display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;
    }
    .mini-btn.remove { right: -6px; color: var(--rust); }
    .mini-btn.edit { left: -6px; }
    .mini-btn.upload { right: -6px; }
    .photo-error { font-size: 10px; color: var(--rust); margin: 0; line-height: 1.3; }

    .confirm-box {
      position: absolute; inset: -4px; background: rgba(33,31,28,0.92); border-radius: 6px; z-index: 5;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 4px;
    }
    .confirm-box p { color: #F1ECDD; font-size: 9.5px; text-align: center; margin: 0; line-height: 1.2; }
    .confirm-actions { display: flex; gap: 6px; }
    .confirm-yes, .confirm-no {
      font-size: 9.5px; font-family: var(--font-head); text-transform: uppercase; letter-spacing: 0.03em;
      border-radius: 3px; border: none; padding: 3px 8px; cursor: pointer;
    }
    .confirm-yes { background: var(--rust); color: #F1ECDD; }
    .confirm-no { background: rgba(255,255,255,0.15); color: #F1ECDD; }

    .preview-backdrop {
      position: fixed; inset: 0; background: rgba(33,31,28,0.8); z-index: 100;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 24px; cursor: zoom-out;
    }
    .preview-img { max-width: min(92vw, 640px); max-height: 80vh; border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.5); cursor: default; }
    .preview-close {
      position: absolute; top: 18px; right: 18px; width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.15); color: #F1ECDD; border: 1.5px solid rgba(255,255,255,0.4);
      font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .preview-label { color: #F1ECDD; font-family: var(--font-head); letter-spacing: 0.05em; text-transform: uppercase; font-size: 13px; margin-top: 14px; }
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
  showPreview = false;
  pendingAction: PendingAction = null;

  get svg(): SafeHtml | null {
    const match = findIllustration(this.name);
    return match ? this.sanitizer.bypassSecurityTrustHtml(match.svg) : null;
  }
  get label(): string {
    return findIllustration(this.name)?.label || this.name || "Ejercicio";
  }

  constructor(private sanitizer: DomSanitizer, private api: ApiService) {}

  requestEdit() {
    this.error = "";
    this.pendingAction = "edit";
  }
  requestRemove() {
    this.error = "";
    this.pendingAction = "remove";
  }
  cancelAction() {
    this.pendingAction = null;
  }

  confirmAction() {
    const action = this.pendingAction;
    this.pendingAction = null;
    if (action === "remove") {
      this.remove();
    } else if (action === "edit") {
      this.attemptUpload();
    }
  }

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
