import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
import { Routine, WorkoutSession, SessionExercise, ExercisePhoto } from "../../core/models";
import { todayStr, uid, fmtDate, normalize } from "../../core/utils";
import { findPhoto, suggestFix, EXERCISE_LIBRARY } from "../../core/exercise-library";
import { ExerciseIllustrationComponent } from "../../shared/exercise-illustration.component";

interface DraftExercise {
  id: string;
  name: string;
  weight: string;
  reps: string;
}

interface MaxInfo {
  weight: number;
  reps: string | number;
  date: string;
}

const DRAFT_KEY = "fitfat:registrar-draft";

@Component({
  selector: "app-registrar",
  standalone: true,
  imports: [CommonModule, FormsModule, ExerciseIllustrationComponent],
  template: `
    <div>
      <div class="section-title"><h2>Registrar sesión</h2></div>

      <p class="draft-notice" *ngIf="draftRestored">
        Recuperamos una sesión que habías empezado a armar y no habías guardado.
        <button type="button" class="link-btn" (click)="discardDraft()">Descartar y empezar de cero</button>
      </p>

      <div class="top-fields">
        <label>
          <span class="field-label">Fecha</span>
          <input type="date" class="input" style="width:160px" [ngModel]="date" (ngModelChange)="setDate($event)" />
        </label>
        <label>
          <span class="field-label">Rutina (opcional)</span>
          <select class="input" style="width:220px" [ngModel]="routineId" (ngModelChange)="loadFromRoutine($event)">
            <option value=""></option>
            <option *ngFor="let r of routines" [value]="r.id">{{ r.name }}</option>
          </select>
        </label>
      </div>

      <div class="exercises">
        <div class="card ex-card" *ngFor="let ex of exercises">
          <div class="ex-head">
            <app-exercise-illustration
              [name]="ex.name"
              [size]="40"
              [photoUrl]="photoUrlFor(ex.name)"
              [photoId]="photoIdFor(ex.name)"
              (photoUploaded)="onPhotoUploaded($event)"
              (photoRemoved)="onPhotoRemoved($event)"
            ></app-exercise-illustration>
            <input class="input name" placeholder="Nombre del ejercicio" list="exercise-suggestions" [ngModel]="ex.name" (ngModelChange)="setExerciseField(ex, 'name', $event)" />
            <div class="max-info">
              <span *ngIf="maxByExercise[ex.name.trim()]">
                máx histórico: {{ maxByExercise[ex.name.trim()].weight }} kg x {{ maxByExercise[ex.name.trim()].reps }}
              </span>
            </div>
            <button class="icon-btn" (click)="removeExercise(ex.id)">🗑</button>
          </div>
          <p class="typo-hint" *ngIf="exerciseSuggestion(ex.name) as exSug">
            ¿Quisiste decir "{{ exSug.label }}"?
            <button type="button" class="link-btn" (click)="setExerciseField(ex, 'name', exSug.label)">Usar</button>
          </p>
          <p class="typo-hint" *ngIf="groupSuggestion(ex.name) as grpSug">
            "{{ grpSug.group }}" es un grupo muscular, no un ejercicio. Prueba: {{ grpSug.examples.join(", ") }}
          </p>
          <div class="weight-row">
            <span class="field-label">Peso máximo</span>
            <input class="input w80" type="number" placeholder="kg" [ngModel]="ex.weight" (ngModelChange)="setExerciseField(ex, 'weight', $event)" />
            <span class="x">x</span>
            <input class="input w70" type="number" placeholder="reps" [ngModel]="ex.reps" (ngModelChange)="setExerciseField(ex, 'reps', $event)" />
            <span class="stamp" *ngIf="isPR(ex)">Récord</span>
          </div>
        </div>
      </div>

      <div class="save-row">
        <button class="btn-ghost" (click)="addFreeExercise()">+ Ejercicio</button>
        <button class="btn-primary" [disabled]="exercises.length === 0 || saving" (click)="saveSession()">
          {{ saving ? "Guardando..." : "Guardar sesión" }}
        </button>
        <span *ngIf="savedFlash" class="flash">SESIÓN GUARDADA</span>
      </div>

      <div class="history" *ngIf="sortedSessions.length > 0">
        <p class="hist-title">Historial</p>
        <p *ngIf="error" class="error">{{ error }}</p>
        <div class="hist-list">
          <div class="card hist-item" *ngFor="let s of sortedSessions">
            <div class="hist-head" (click)="toggleExpand(s.id)">
              <span class="chevron" [class.open]="expanded === s.id">›</span>
              <strong>{{ fmtDate(s.date) }}</strong>
              <span class="muted">{{ s.routine_name || "Sesión libre" }}</span>
              <span class="muted push-right">{{ s.exercises.length }} ejerc.</span>
              <button class="icon-btn" (click)="removeSession(s.id); $event.stopPropagation()" [disabled]="deletingId === s.id">
                {{ deletingId === s.id ? "…" : "🗑" }}
              </button>
            </div>
            <div class="hist-body" *ngIf="expanded === s.id">
              <div *ngFor="let ex of s.exercises" class="hist-ex">
                <strong>{{ ex.name }}</strong>: {{ formatMaxWeight(ex) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <datalist id="exercise-suggestions">
      <option *ngFor="let ex of library" [value]="ex.label"></option>
    </datalist>
  `,
  styles: [`
    .draft-notice { background: #F3E7C9; border: 1.5px solid var(--brass); border-radius: 6px; padding: 10px 12px; font-size: 12.5px; color: var(--ink); margin-bottom: 16px; }
    .top-fields { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .top-fields label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
    .exercises { display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px; }
    .ex-card { padding: 14px; }
    .ex-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .ex-head .name { flex: 1; font-family: var(--font-head); font-size: 14px; }
    .max-info { display: flex; flex-direction: column; align-items: flex-end; font-size: 10.5px; color: var(--ink-soft); white-space: nowrap; }
    .weight-row { display: flex; align-items: center; gap: 8px; }
    .w80 { width: 80px; }
    .w70 { width: 70px; }
    .x { font-size: 12px; color: var(--ink-soft); }
    .save-row { display: flex; gap: 10px; align-items: center; }
    .flash { font-size: 12px; color: var(--rust); font-family: var(--font-head); letter-spacing: 0.05em; }
    .history { margin-top: 32px; }
    .hist-title { font-family: var(--font-head); font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 10px; border-top: 2px solid var(--ink); padding-top: 16px; }
    .error { color: var(--rust); font-size: 12.5px; margin-bottom: 10px; }
    .hist-list { display: flex; flex-direction: column; gap: 6px; }
    .hist-item { }
    .hist-head { display: flex; align-items: center; gap: 10px; padding: 9px 12px; cursor: pointer; }
    .chevron { display: inline-block; transition: transform 0.15s; font-size: 16px; color: var(--ink-soft); }
    .chevron.open { transform: rotate(90deg); }
    .muted { font-size: 12px; color: var(--ink-soft); }
    .hist-body { border-top: 1px dashed var(--paper-line); padding: 10px 14px 12px 34px; }
    .hist-ex { font-size: 12.5px; margin-bottom: 6px; }
    .typo-hint { font-size: 11.5px; color: var(--brass); margin: -8px 0 10px; }
    .link-btn { background: none; border: none; color: var(--rust); font-weight: 600; text-decoration: underline; cursor: pointer; padding: 0; font-size: 11.5px; }
  `],
})
export class RegistrarComponent implements OnInit {
  @Input() routines: Routine[] = [];
  @Input() sessions: WorkoutSession[] = [];
  @Output() sessionsChange = new EventEmitter<WorkoutSession[]>();
  @Input() photos: ExercisePhoto[] = [];
  @Output() photosChange = new EventEmitter<ExercisePhoto[]>();

  library = EXERCISE_LIBRARY;

  exerciseSuggestion(name: string): { label: string } | null {
    const s = suggestFix(name);
    return s && s.kind === "exercise" ? { label: s.def.label } : null;
  }
  groupSuggestion(name: string): { group: string; examples: string[] } | null {
    const s = suggestFix(name);
    return s && s.kind === "group" ? { group: s.group, examples: s.examples } : null;
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

  date = todayStr();
  routineId = "";
  exercises: DraftExercise[] = [];
  saving = false;
  savedFlash = false;
  expanded: string | null = null;
  deletingId: string | null = null;
  error = "";
  draftRestored = false;
  fmtDate = fmtDate;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDraft();
  }

  // --- Autoguardado local: mientras arman la sesión, la guardamos en el
  // celular/navegador para no perderla si la página se recarga o se traba
  // (por ejemplo al subir una foto muy pesada). Se borra al guardar o
  // al descartarla a mano.

  private persistDraft() {
    try {
      const hasContent = this.exercises.some((e) => e.name.trim() || e.weight !== "");
      if (!hasContent) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ date: this.date, routineId: this.routineId, exercises: this.exercises, savedAt: Date.now() })
      );
    } catch {
      // localStorage puede fallar en navegación privada; no es crítico
    }
  }

  private loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      const hasContent = Array.isArray(draft.exercises) && draft.exercises.some((e: DraftExercise) => e.name?.trim() || e.weight !== "");
      if (!hasContent) return;
      this.date = draft.date || todayStr();
      this.routineId = draft.routineId || "";
      this.exercises = draft.exercises;
      this.draftRestored = true;
    } catch {
      // ignorar borrador corrupto
    }
  }

  discardDraft() {
    this.exercises = [];
    this.routineId = "";
    this.date = todayStr();
    this.draftRestored = false;
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  }

  setDate(date: string) {
    this.date = date;
    this.persistDraft();
  }

  setExerciseField(ex: DraftExercise, field: "name" | "weight" | "reps", value: string) {
    (ex as any)[field] = value;
    this.persistDraft();
  }

  loadFromRoutine(id: string) {
    this.routineId = id;
    const routine = this.routines.find((r) => r.id === id);
    if (!routine) {
      this.exercises = [];
      this.persistDraft();
      return;
    }
    this.exercises = routine.exercises.map((ex) => ({
      id: uid(),
      name: ex.name,
      weight: "",
      reps: String(ex.targetReps || ""),
    }));
    this.persistDraft();
  }

  addFreeExercise() {
    this.exercises = [...this.exercises, { id: uid(), name: "", weight: "", reps: "" }];
    this.persistDraft();
  }
  removeExercise(id: string) {
    this.exercises = this.exercises.filter((e) => e.id !== id);
    this.persistDraft();
  }

  get maxByExercise(): Record<string, MaxInfo> {
    const max: Record<string, MaxInfo> = {};
    for (const s of [...this.sessions].sort((a, b) => a.date.localeCompare(b.date))) {
      for (const ex of s.exercises) {
        for (const set of ex.sets) {
          const w = parseFloat(String(set.weight));
          if (!isFinite(w)) continue;
          if (!max[ex.name] || w > max[ex.name].weight) {
            max[ex.name] = { weight: w, reps: set.reps, date: s.date };
          }
        }
      }
    }
    return max;
  }

  isPR(ex: DraftExercise): boolean {
    const prevMax = this.maxByExercise[ex.name.trim()];
    const w = parseFloat(String(ex.weight));
    return !!(prevMax && isFinite(w) && w > prevMax.weight);
  }

  async saveSession() {
    const cleaned: SessionExercise[] = this.exercises
      .filter((e) => e.name.trim() && e.weight !== "")
      .map((e) => ({ name: e.name.trim(), sets: [{ weight: e.weight, reps: e.reps }] }));
    if (cleaned.length === 0) return;

    this.saving = true;
    try {
      const routine = this.routines.find((r) => r.id === this.routineId);
      const created = await this.api.createSession({
        date: this.date,
        routineId: this.routineId || null,
        routineName: routine ? routine.name : null,
        exercises: cleaned,
      });
      this.sessionsChange.emit([created, ...this.sessions]);
      this.exercises = [];
      this.routineId = "";
      this.draftRestored = false;
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      this.savedFlash = true;
      setTimeout(() => (this.savedFlash = false), 2000);
    } finally {
      this.saving = false;
    }
  }

  get sortedSessions(): WorkoutSession[] {
    return [...this.sessions].sort((a, b) => b.date.localeCompare(a.date));
  }

  toggleExpand(id: string) {
    this.expanded = this.expanded === id ? null : id;
  }

  async removeSession(id: string) {
    this.error = "";
    this.deletingId = id;
    try {
      await this.api.deleteSession(id);
      this.sessionsChange.emit(this.sessions.filter((s) => s.id !== id));
    } catch (err: any) {
      const msg = err?.error?.error;
      this.error = typeof msg === "string" ? msg : "No se pudo eliminar la sesión. Revisa los logs de Vercel.";
    } finally {
      this.deletingId = null;
    }
  }

  formatMaxWeight(ex: SessionExercise): string {
    let best: { weight: number; reps: string | number } | null = null;
    for (const s of ex.sets) {
      const w = parseFloat(String(s.weight));
      if (!isFinite(w)) continue;
      if (!best || w > best.weight) best = { weight: w, reps: s.reps };
    }
    if (!best) return "–";
    return `${best.weight} kg x ${best.reps}`;
  }
}
