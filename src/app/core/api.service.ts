import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { Routine, WorkoutSession, Measurement, TeamMember, ExercisePhoto, ShareTarget, NutritionLog, Goal } from "./models";

@Injectable({ providedIn: "root" })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Auth
  login(username: string, password: string) {
    return firstValueFrom(this.http.post<{ ok: boolean; username: string }>("/api/login", { username, password }));
  }
  register(username: string, password: string) {
    return firstValueFrom(this.http.post<{ ok: boolean; username: string }>("/api/register", { username, password }));
  }
  logout() {
    return firstValueFrom(this.http.post("/api/logout", {}));
  }
  me() {
    return firstValueFrom(this.http.get<{ username: string }>("/api/me"));
  }

  // Routines
  getRoutines() {
    return firstValueFrom(this.http.get<Routine[]>("/api/routines"));
  }
  createRoutine(payload: Partial<Routine>) {
    return firstValueFrom(this.http.post<Routine>("/api/routines", payload));
  }
  updateRoutine(id: string, payload: Partial<Routine>) {
    return firstValueFrom(this.http.put<Routine>(`/api/routines?id=${id}`, payload));
  }
  deleteRoutine(id: string) {
    return firstValueFrom(this.http.delete(`/api/routines?id=${id}`));
  }

  // Sessions
  getSessions() {
    return firstValueFrom(this.http.get<WorkoutSession[]>("/api/sessions"));
  }
  createSession(payload: any) {
    return firstValueFrom(this.http.post<WorkoutSession>("/api/sessions", payload));
  }
  updateSession(id: string, exercises: any[]) {
    return firstValueFrom(this.http.put<WorkoutSession>(`/api/sessions?id=${id}`, { exercises }));
  }
  deleteSession(id: string) {
    return firstValueFrom(this.http.delete(`/api/sessions?id=${id}`));
  }

  // Measurements
  getMeasurements() {
    return firstValueFrom(this.http.get<Measurement[]>("/api/measurements"));
  }
  createMeasurement(payload: any) {
    return firstValueFrom(this.http.post<Measurement>("/api/measurements", payload));
  }
  deleteMeasurement(id: string) {
    return firstValueFrom(this.http.delete(`/api/measurements?id=${id}`));
  }

  // Team
  getTeam() {
    return firstValueFrom(this.http.get<TeamMember[]>("/api/team"));
  }

  // Sharing (who can see my team data)
  getShareList() {
    return firstValueFrom(this.http.get<ShareTarget[]>("/api/share"));
  }
  grantShare(viewerId: string) {
    return firstValueFrom(this.http.post("/api/share", { viewerId }));
  }
  revokeShare(viewerId: string) {
    return firstValueFrom(this.http.delete(`/api/share?viewerId=${viewerId}`));
  }

  // Exercise photos
  getExercisePhotos() {
    return firstValueFrom(this.http.get<ExercisePhoto[]>("/api/exercise-photos"));
  }
  uploadExercisePhoto(exerciseName: string, dataUrl: string) {
    return firstValueFrom(this.http.post<ExercisePhoto>("/api/exercise-photos", { exerciseName, dataUrl }));
  }
  deleteExercisePhoto(id: string) {
    return firstValueFrom(this.http.delete(`/api/exercise-photos?id=${id}`));
  }

  // Nutrición
  getNutritionLogs() {
    return firstValueFrom(this.http.get<NutritionLog[]>("/api/nutrition"));
  }
  createNutritionLog(payload: any) {
    return firstValueFrom(this.http.post<NutritionLog>("/api/nutrition", payload));
  }
  deleteNutritionLog(id: string) {
    return firstValueFrom(this.http.delete(`/api/nutrition?id=${id}`));
  }

  // Metas
  getGoals() {
    return firstValueFrom(this.http.get<Goal[]>("/api/goals"));
  }
  createGoal(payload: any) {
    return firstValueFrom(this.http.post<Goal>("/api/goals", payload));
  }
  deleteGoal(id: string) {
    return firstValueFrom(this.http.delete(`/api/goals?id=${id}`));
  }
}
