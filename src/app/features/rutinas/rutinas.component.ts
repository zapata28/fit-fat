import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import { Routine, RoutineExercise, ExercisePhoto } from "../../core/models";
import { uid, normalize } from "../../core/utils";
import { EXERCISE_LIBRARY, MUSCLE_GROUPS, MuscleGroup, findPhoto } from "../../core/exercise-library";
import { ExerciseIllustrationComponent } from "../../shared/exercise-illustration.component";

@Component({
  selector: "app-rutinas",
  standalone: true,
  imports: [CommonModule, FormsModule, ExerciseIllustrationComponent],
  template: `
    <div>
      <div class="section-title">
        <h2>Rutinas</h2>
        <div class="actions">
          <button class="btn-ghost" (click)="showGallery = !showGallery">{{ showGallery ? "Ocultar" : "Ver" }} ejercicios</button>
          <button class="btn-primary" (click)="addRoutine()">+ Rutina</button>
        </div>
      </div>

      <div *ngIf="showGallery" class="card gallery">
        <p class="hint">Ejercicios comunes con ilustración de referencia. Ábrelos aquí solo para consultar la forma correcta.</p>
        <div class="group-chips">
          <button class="chip" [class.active]="activeGroup === null" (click)="activeGroup = null">Todos</button>
          <button class="chip" *ngFor="let g of groups" [class.active]="activeGroup === g" (click)="activeGroup = g">{{ g }}</button>
        </div>
        <div class="gallery-grid">
          <div *ngFor="let ex of filteredLibrary" class="gallery-item">
            <div class="gallery-svg" [innerHTML]="ex.svg"></div>
            <span>{{ ex.label }}</span>
          </div>
        </div>
      </div>

      <p *ngIf="routines.length === 0" class="muted">
        Crea una rutina con la lista de ejercicios que sueles hacer. Es solo una plantilla de referencia para registrar más rápido.
      </p>

      <div class="list" *ngIf="routines.length > 0">
        <div class="card routine" *ngFor="let r of routines; trackBy: trackByRoutineId">
          <div class="routine-head" (click)="toggle(r.id)">
            <span class="chevron" [class.open]="openId === r.id">›</span>
            <input class="routine-name" [ngModel]="draftName(r)" (ngModelChange)="setDraftName(r, $event)" (click)="$event.stopPropagation()" />
            <span class="count">{{ draftExercises(r).length }} ejerc.</span>
            <button class="icon-btn" (click)="removeRoutine(r.id); $event.stopPropagation()">🗑</button>
          </div>
          <div class="routine-body" *ngIf="openId === r.id">
            <div class="ex-row" *ngFor="let ex of draftExercises(r); trackBy: trackByExId">
              <app-exercise-illustration
                [name]="ex.name"
                [size]="36"
                [photoUrl]="photoUrlFor(ex.name)"
                [photoId]="photoIdFor(ex.name)"
                (photoUploaded)="onPhotoUploaded($event)"
                (photoRemoved)="onPhotoRemoved($event)"
              ></app-exercise-illustration>
              <input class="input" placeholder="Nombre del ejercicio" [ngModel]="ex.name" (ngModelChange)="updateExercise(r, ex.id, { name: $event })" />
              <input class="input small" type="number" min="0" [ngModel]="ex.targetSets" (ngModelChange)="updateExercise(r, ex.id, { targetSets: $event })" title="Series objetivo" />
              <span class="x">x</span>
              <input class="input small" type="number" min="0" [ngModel]="ex.targetReps" (ngModelChange)="updateExercise(r, ex.id, { targetReps: $event })" title="Repeticiones objetivo" />
              <button class="icon-btn" (click)="removeExercise(r, ex.id)">✕</button>
            </div>
            <div class="row-actions">
              <button class="btn-ghost" (click)="addExercise(r)">+ Ejercicio</button>
              <button class="btn-primary" *ngIf="isDirty(r)" (click)="saveDraft(r)">Guardar cambios</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .actions { display: flex; gap: 8px; }
    .gallery { padding: 16px; margin-bottom: 20px; }
    .hint { margin: 0 0 12px; font-size: 12.5px; color: var(--ink-soft); }
    .group-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
    .chip {
      font-family: var(--font-head); text-transform: uppercase; letter-spacing: 0.04em; font-size: 11px;
      padding: 5px 12px; border-radius: 14px; border: 1.5px solid var(--paper-line); background: transparent;
      color: var(--ink-soft); cursor: pointer;
    }
    .chip.active { background: var(--iron); color: #F1ECDD; border-color: var(--iron); }
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 12px; }
    .gallery-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .gallery-svg { width: 64px; height: 64px; color: var(--iron); }
    .gallery-item span { font-size: 10.5px; text-align: center; color: var(--ink-soft); }
    .list { display: flex; flex-direction: column; gap: 10px; }
    .routine { overflow: hidden; }
    .routine-head { display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer; }
    .chevron { display: inline-block; transition: transform 0.15s; font-size: 18px; color: var(--ink-soft); }
    .chevron.open { transform: rotate(90deg); }
    .routine-name { flex: 1; font-family: var(--font-head); font-size: 15px; border: none; background: transparent; padding: 2px 4px; }
    .count { font-size: 12px; color: var(--ink-soft); }
    .routine-body { border-top: 1.5px dashed var(--paper-line); padding: 12px 14px; }
    .ex-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
    .ex-row .input { flex: 1; }
    .small { width: 56px; }
    .x { font-size: 11px; color: var(--ink-soft); }
    .row-actions { display: flex; gap: 8px; align-items: center; margin-top: 6px; }
    .muted { color: var(--ink-soft); font-size: 13px; }
  `],
})
export class RutinasComponent {
  @Input() routines: Routine[] = [];
  @Output() routinesChange = new EventEmitter<Routine[]>();
  @Input() photos: ExercisePhoto[] = [];
  @Output() photosChange = new EventEmitter<ExercisePhoto[]>();

  library = EXERCISE_LIBRARY;
  groups = MUSCLE_GROUPS;
  activeGroup: MuscleGroup | null = null;
  showGallery = false;
  openId: string | null = null;
  drafts: Record<string, { name: string; exercises: RoutineExercise[] }> = {};

  get filteredLibrary() {
    return this.activeGroup ? this.library.filter((ex) => ex.group === this.activeGroup) : this.library;
  }

  photoUrlFor(name: string): string | null {
    return findPhoto(name, this.photos);
  }
  photoIdFor(name: string): string | null {
    const n = normalize(name);
    return this.photos.find((p) => normalize(p.exercise_name) === n)?.id || null;
  }
  onPhotoUploaded(photo: ExercisePhoto) {
    const rest = this.photos.filter((p) => p.id !== photo.id);
    this.photosChange.emit([...rest, photo]);
  }
  onPhotoRemoved(id: string) {
    this.photosChange.emit(this.photos.filter((p) => p.id !== id));
  }

  constructor(private api: ApiService) {}

  toggle(id: string) {
    this.openId = this.openId === id ? null : id;
  }

  trackByRoutineId(_index: number, r: Routine) {
    return r.id;
  }
  trackByExId(_index: number, ex: RoutineExercise) {
    return ex.id;
  }

  private draft(r: Routine) {
    return this.drafts[r.id] || { name: r.name, exercises: r.exercises };
  }
  draftName(r: Routine) {
    return this.draft(r).name;
  }
  draftExercises(r: Routine) {
    return this.draft(r).exercises;
  }
  isDirty(r: Routine) {
    return !!this.drafts[r.id];
  }
  private setDraft(r: Routine, patch: Partial<{ name: string; exercises: RoutineExercise[] }>) {
    this.drafts = { ...this.drafts, [r.id]: { ...this.draft(r), ...patch } };
  }
  setDraftName(r: Routine, name: string) {
    this.setDraft(r, { name });
  }

  async addRoutine() {
    const created = await this.api.createRoutine({ name: "Nueva rutina", exercises: [] });
    this.routinesChange.emit([...this.routines, created]);
    this.openId = created.id;
  }

  async removeRoutine(id: string) {
    await this.api.deleteRoutine(id);
    this.routinesChange.emit(this.routines.filter((r) => r.id !== id));
    const { [id]: _, ...rest } = this.drafts;
    this.drafts = rest;
    if (this.openId === id) this.openId = null;
  }

  addExercise(r: Routine) {
    const d = this.draft(r);
    this.setDraft(r, { exercises: [...d.exercises, { id: uid(), name: "", targetSets: 3, targetReps: 10 }] });
  }
  updateExercise(r: Routine, exId: string, patch: Partial<RoutineExercise>) {
    const d = this.draft(r);
    this.setDraft(r, { exercises: d.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)) });
  }
  removeExercise(r: Routine, exId: string) {
    const d = this.draft(r);
    this.setDraft(r, { exercises: d.exercises.filter((e) => e.id !== exId) });
  }

  async saveDraft(r: Routine) {
    const d = this.draft(r);
    const updated = await this.api.updateRoutine(r.id, d);
    this.routinesChange.emit(this.routines.map((x) => (x.id === r.id ? updated : x)));
    const { [r.id]: _, ...rest } = this.drafts;
    this.drafts = rest;
  }
}
