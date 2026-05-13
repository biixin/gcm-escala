import type {
  AppState,
  Schedule,
  ScheduleArea,
  Student,
  StudentStats,
  Warning,
} from '../types'

export const AREA_LABEL: Record<ScheduleArea, string> = {
  room: 'Sala',
  bathroom: 'Banheiro',
  general: 'Geral',
}

export const STATUS_LABEL: Record<Schedule['status'], string> = {
  scheduled: 'Programada',
  done: 'Concluída',
  pending: 'Pendente',
  missed: 'Falta registrada',
}

export function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getStudentName(students: Student[], id: string) {
  return students.find((student) => student.id === id)?.fullName ?? 'Aluno removido'
}

export function getStudentNumber(students: Student[], id: string) {
  return students.find((student) => student.id === id)?.number ?? '--'
}

export function computeStudentStats(state: AppState): StudentStats[] {
  const stats = new Map<string, StudentStats>()

  state.students.forEach((student) => {
    stats.set(student.id, {
      student,
      roomCleanings: 0,
      bathroomCleanings: 0,
      totalCleanings: 0,
      warnings: 0,
      roomDates: [],
      bathroomDates: [],
    })
  })

  state.schedules.forEach((schedule) => {
    if (schedule.status === 'missed') return

    schedule.studentIds.forEach((studentId) => {
      const current = stats.get(studentId)
      if (!current) return

      if (schedule.area === 'room') {
        current.roomCleanings += 1
        current.roomDates.push(schedule.weekStart)
      } else {
        current.bathroomCleanings += 1
        current.bathroomDates.push(schedule.weekStart)
      }
      current.totalCleanings += 1
    })
  })

  state.warnings.forEach((warning) => {
    const current = stats.get(warning.studentId)
    if (!current) return

    current.warnings += 1
  })

  return [...stats.values()]
}

export function findSchedule(
  schedules: Schedule[],
  area: Schedule['area'],
  weekStart: string,
) {
  return schedules.find(
    (schedule) => schedule.area === area && schedule.weekStart === weekStart,
  )
}

export function getScheduleWarnings(warnings: Warning[], schedule?: Schedule) {
  if (!schedule) return []

  return warnings.filter((warning) => {
    const sameSchedule = warning.scheduleId === schedule.id
    const sameWeekAndArea =
      warning.relatedArea === schedule.area && warning.date >= schedule.weekStart && warning.date <= schedule.weekEnd

    return sameSchedule || sameWeekAndArea
  })
}

export function validateScheduleConflict(roomIds: string[], bathroomIds: string[]) {
  const bathroomSet = new Set(bathroomIds)
  return roomIds.filter((studentId) => bathroomSet.has(studentId))
}

export function upsertSchedule(
  schedules: Schedule[],
  payload: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
) {
  const now = new Date().toISOString()
  const existing = schedules.find(
    (schedule) =>
      schedule.area === payload.area && schedule.weekStart === payload.weekStart,
  )
  const nextSchedule: Schedule = {
    id: payload.id ?? existing?.id ?? makeId(`schedule-${payload.area}`),
    area: payload.area,
    weekStart: payload.weekStart,
    weekEnd: payload.weekEnd,
    studentIds: payload.studentIds,
    status: payload.status,
    notes: payload.notes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  return [
    ...schedules.filter(
      (schedule) =>
        !(schedule.area === payload.area && schedule.weekStart === payload.weekStart),
    ),
    nextSchedule,
  ].sort((first, second) => {
    const dateSort = second.weekStart.localeCompare(first.weekStart)
    if (dateSort !== 0) return dateSort
    return first.area.localeCompare(second.area)
  })
}

export function getStudentWarnings(warnings: Warning[], studentId: string) {
  return warnings
    .filter((warning) => warning.studentId === studentId)
    .sort((first, second) => second.date.localeCompare(first.date))
}

export function getStudentSchedules(schedules: Schedule[], studentId: string) {
  return schedules
    .filter((schedule) => schedule.studentIds.includes(studentId))
    .sort((first, second) => second.weekStart.localeCompare(first.weekStart))
}
