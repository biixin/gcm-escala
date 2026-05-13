import type { AppState, Schedule, Student } from '../types'
import { addDays, getWeekRange } from '../lib/dates'

const studentNames = [
  'Aluno 01 do 6º Pelotão',
  'Aluno 02 do 6º Pelotão',
  'Aluno 03 do 6º Pelotão',
  'Aluno 04 do 6º Pelotão',
  'Aluno 05 do 6º Pelotão',
  'Aluno 06 do 6º Pelotão',
  'Aluno 07 do 6º Pelotão',
  'Aluno 08 do 6º Pelotão',
  'Aluno 09 do 6º Pelotão',
  'Aluno 10 do 6º Pelotão',
  'Aluno 11 do 6º Pelotão',
  'Aluno 12 do 6º Pelotão',
  'Aluno 13 do 6º Pelotão',
  'Aluno 14 do 6º Pelotão',
  'Aluno 15 do 6º Pelotão',
  'Aluno 16 do 6º Pelotão',
  'Aluno 17 do 6º Pelotão',
  'Aluno 18 do 6º Pelotão',
  'Aluno 19 do 6º Pelotão',
  'Aluno 20 do 6º Pelotão',
  'Aluno 21 do 6º Pelotão',
  'Aluno 22 do 6º Pelotão',
  'Aluno 23 do 6º Pelotão',
  'Aluno 24 do 6º Pelotão',
  'Aluno 25 do 6º Pelotão',
  'Aluno 26 do 6º Pelotão',
  'Aluno 27 do 6º Pelotão',
  'Aluno 28 do 6º Pelotão',
  'Aluno 29 do 6º Pelotão',
  'Aluno 30 do 6º Pelotão',
  'Aluno 31 do 6º Pelotão',
  'Aluno 32 do 6º Pelotão',
  'Aluno 33 do 6º Pelotão',
  'Aluno 34 do 6º Pelotão',
  'Aluno 35 do 6º Pelotão',
  'Aluno 36 do 6º Pelotão',
  'Aluno 37 do 6º Pelotão',
  'Aluno 38 do 6º Pelotão',
  'Aluno 39 do 6º Pelotão',
  'Aluno 40 do 6º Pelotão',
  'Aluno 41 do 6º Pelotão',
  'Aluno 42 do 6º Pelotão',
  'Aluno 43 do 6º Pelotão',
  'Aluno 44 do 6º Pelotão',
]

export function createSeedStudents(now = new Date().toISOString()): Student[] {
  return studentNames.map((fullName, index) => ({
    id: `student-${String(index + 1).padStart(2, '0')}`,
    fullName,
    number: String(index + 1).padStart(2, '0'),
    active: true,
    createdAt: now,
  }))
}

function createSchedule(
  id: string,
  area: Schedule['area'],
  weekStart: string,
  weekEnd: string,
  studentIds: string[],
  createdAt: string,
): Schedule {
  return {
    id,
    area,
    weekStart,
    weekEnd,
    studentIds,
    status: 'scheduled',
    createdAt,
    updatedAt: createdAt,
  }
}

export function createInitialState(): AppState {
  const now = new Date().toISOString()
  const students = createSeedStudents(now)
  const current = getWeekRange()
  const previousStart = addDays(current.weekStart, -7)
  const previousEnd = addDays(current.weekEnd, -7)

  const schedules: Schedule[] = [
    createSchedule(
      'schedule-room-previous',
      'room',
      previousStart,
      previousEnd,
      students.slice(6, 10).map((student) => student.id),
      now,
    ),
    createSchedule(
      'schedule-bathroom-previous',
      'bathroom',
      previousStart,
      previousEnd,
      students.slice(10, 12).map((student) => student.id),
      now,
    ),
    createSchedule(
      'schedule-room-current',
      'room',
      current.weekStart,
      current.weekEnd,
      students.slice(0, 4).map((student) => student.id),
      now,
    ),
    createSchedule(
      'schedule-bathroom-current',
      'bathroom',
      current.weekStart,
      current.weekEnd,
      students.slice(4, 6).map((student) => student.id),
      now,
    ),
  ]

  return {
    students,
    schedules,
    warnings: [],
    lastUpdated: now,
  }
}
