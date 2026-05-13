import { createInitialState } from '../data/seed'
import type { AppState, Warning } from '../types'

const STORAGE_KEY = 'escala-limpeza-6-pelotao:v1'

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AppState>

  return (
    Array.isArray(candidate.students) &&
    Array.isArray(candidate.schedules) &&
    Array.isArray(candidate.warnings)
  )
}

function normalizeWarnings(warnings: Warning[]) {
  return warnings
    .filter((warning) => warning.type === 'Falta de limpeza' || warning.type === 'Não fez limpeza')
    .map((warning) => ({
      ...warning,
      type: 'Falta de limpeza' as const,
    }))
}

export function loadStoredState(): AppState {
  const fallback = createInitialState()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback

    const parsed = JSON.parse(raw)
    if (!isAppState(parsed)) return fallback

    return {
      ...fallback,
      ...parsed,
      warnings: normalizeWarnings(parsed.warnings),
      lastUpdated: parsed.lastUpdated ?? new Date().toISOString(),
    }
  } catch {
    return fallback
  }
}

export function saveStoredState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function normalizeImportedState(value: unknown): AppState | null {
  if (!isAppState(value)) return null

  return {
    students: value.students,
    schedules: value.schedules,
    warnings: normalizeWarnings(value.warnings),
    lastUpdated: new Date().toISOString(),
  }
}

export function clearStoredState() {
  localStorage.removeItem(STORAGE_KEY)
}
