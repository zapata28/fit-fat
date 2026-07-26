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
      <div class="wrap" [style.width.px]="size" [style.height.px]="size" [title]="photoUrl ? 'Ver foto completa' : label">
        <img *ngIf="photoUrl" [src]="photoUrl" class="photo clickable" (click)="showPreview = true" />
        <div *ngIf="!photoUrl" [innerHTML]="genericIcon" class="svg-box"></div>
        <div class="spinner" *ngIf="busy">…</div>

        <ng-container *ngIf="editable">
          <button class="mini-btn remove" *ngIf="photoUrl && !busy" (click)="requestRemove()" title="Quitar foto">✕</button>
          <button class="mini-btn upload" *ngIf="!photoUrl && !busy" (click)="attemptUpload()" title="Subir foto de referencia">📷</button>
          <input #fileInput type="file" accept="image/*" hidden (change)="onFile($event)" />
        </ng-container>
      </div>
      <p class="photo-error" *ngIf="error">{{ error }}</p>
    </div>

    <div class="modal-backdrop" *ngIf="confirmingRemove" (click)="cancelRemove()">
      <div class="confirm-modal" (click)="$event.stopPropagation()">
        <p class="confirm-title">¿Quitar esta foto?</p>
        <p class="confirm-sub">"{{ label }}" se quedará sin foto de referencia hasta que subas otra.</p>
        <div class="confirm-actions">
          <button class="btn-ghost" (click)="cancelRemove()">Cancelar</button>
          <button class="btn-danger" (click)="confirmRemove()">Sí, quitar</button>
        </div>
      </div>
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
    .spinner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--ink-soft); }
    .mini-btn {
      position: absolute; bottom: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%;
      border: 1.5px solid var(--paper-line); background: var(--paper-card); font-size: 9px; line-height: 1;
      display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;
    }
    .mini-btn.remove { color: var(--rust); }
    .photo-error { font-size: 10px; color: var(--rust); margin: 0; line-height: 1.3; }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(33,31,28,0.55); z-index: 90;
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }
    .confirm-modal {
      background: var(--paper); border-radius: 10px; max-width: 340px; width: 100%;
      padding: 22px; box-shadow: 0 12px 40px rgba(0,0,0,0.35);
    }
    .confirm-title { font-family: var(--font-head); font-size: 16px; text-transform: uppercase; letter-spacing: 0.03em; margin: 0 0 8px; color: var(--ink); }
    .confirm-sub { font-size: 13px; color: var(--ink-soft); margin: 0 0 18px; }
    .confirm-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .btn-danger {
      font-family: var(--font-head); text-transform: uppercase; letter-spacing: 0.05em; font-size: 13px;
      background: var(--rust); color: #F1ECDD; border: none; border-radius: 4px; padding: 9px 16px; cursor: pointer;
    }

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
  confirmingRemove = false;

  private readonly genericIconRaw = `<svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="52" width="14" height="16" rx="3"/><rect x="92" y="52" width="14" height="16" rx="3"/><path d="M28 60 L92 60"/><rect x="4" y="46" width="8" height="28" rx="2"/><rect x="108" y="46" width="8" height="28" rx="2"/></g></svg>`;

  get genericIcon(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.genericIconRaw);
  }
  get label(): string {
    return findIllustration(this.name)?.label || this.name || "Ejercicio";
  }

  constructor(private sanitizer: DomSanitizer, private api: ApiService) {}

  requestRemove() {
    this.error = "";
    this.confirmingRemove = true;
  }
  cancelRemove() {
    this.confirmingRemove = false;
  }
  confirmRemove() {
    this.confirmingRemove = false;
    this.remove();
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
