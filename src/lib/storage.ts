import { createInitialState, createSeedStudents, studentNames } from '../data/seed'
import type { AppState, Schedule, Student, Warning } from '../types'

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

function isRemovedFirstStudent(students: Student[]) {
  return students.some(
    (student) =>
      student.id === 'student-01' && /andrezza/i.test(student.fullName),
  )
}

function shiftLegacyStudentId(studentId: string) {
  const match = /^student-(\d{2})$/.exec(studentId)
  if (!match) return studentId

  const numericId = Number(match[1])
  if (numericId === 1) return null
  if (numericId > 1 && numericId <= 45) {
    return `student-${String(numericId - 1).padStart(2, '0')}`
  }

  return studentId
}

function normalizeWarnings(warnings: Warning[], shiftLegacyIds: boolean) {
  return warnings
    .filter((warning) => warning.type === 'Falta de limpeza' || warning.type === 'Não fez limpeza')
    .map((warning) => {
      const studentId = shiftLegacyIds
        ? shiftLegacyStudentId(warning.studentId)
        : warning.studentId

      if (!studentId) return null

      return {
        ...warning,
        studentId,
        type: 'Falta de limpeza' as const,
      }
    })
    .filter((warning): warning is Warning => Boolean(warning))
}

function shouldMigrateStudents(students: Student[], shiftLegacyIds: boolean) {
  return (
    shiftLegacyIds ||
    students.length < studentNames.length ||
    students.some(
      (student) =>
        /^Aluno \d+/i.test(student.fullName) ||
        student.fullName.includes('6º Pelotão'),
    )
  )
}

function normalizeStudents(students: Student[], shiftLegacyIds: boolean) {
  if (!shouldMigrateStudents(students, shiftLegacyIds)) return students

  const currentById = new Map(students.map((student) => [student.id, student]))
  const roster = createSeedStudents(new Date().toISOString()).map((student) => {
    const numericId = Number(student.id.replace('student-', ''))
    const legacyId = `student-${String(numericId + 1).padStart(2, '0')}`
    const current = currentById.get(shiftLegacyIds ? legacyId : student.id)

    return {
      ...student,
      active: current?.active ?? student.active,
      createdAt: current?.createdAt ?? student.createdAt,
    }
  })
  const customStudents = students.filter((student) => !/^student-\d{2}$/.test(student.id))

  return [...roster, ...customStudents]
}

function normalizeSchedules(schedules: Schedule[], shiftLegacyIds: boolean) {
  if (!shiftLegacyIds) return schedules

  return schedules.map((schedule) => {
    const studentIds = schedule.studentIds
      .map((studentId) => shiftLegacyStudentId(studentId))
      .filter((studentId): studentId is string => Boolean(studentId))

    return {
      ...schedule,
      studentIds: [...new Set(studentIds)],
    }
  })
}

export function loadStoredState(): AppState {
  const fallback = createInitialState()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback

    const parsed = JSON.parse(raw)
    if (!isAppState(parsed)) return fallback
    const shiftLegacyIds = isRemovedFirstStudent(parsed.students)

    return {
      ...fallback,
      ...parsed,
      students: normalizeStudents(parsed.students, shiftLegacyIds),
      schedules: normalizeSchedules(parsed.schedules, shiftLegacyIds),
      warnings: normalizeWarnings(parsed.warnings, shiftLegacyIds),
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
  const shiftLegacyIds = isRemovedFirstStudent(value.students)

  return {
    students: normalizeStudents(value.students, shiftLegacyIds),
    schedules: normalizeSchedules(value.schedules, shiftLegacyIds),
    warnings: normalizeWarnings(value.warnings, shiftLegacyIds),
    lastUpdated: new Date().toISOString(),
  }
}

export function clearStoredState() {
  localStorage.removeItem(STORAGE_KEY)
}
