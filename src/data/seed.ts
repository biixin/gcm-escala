import type { AppState, Schedule, Student } from '../types'
import { addDays, getWeekRange } from '../lib/dates'

export const studentNames = [
  'Alexandre Belmont',
  'Alexandre Rigas Junior',
  'Alexandre Bernardes',
  'Bruno Von Heid',
  'Carlos Lira',
  'Carlos Ramos',
  'Cleiton Pereira',
  'Dener Silva',
  'Diego Possidonio',
  'Diego Gurgel',
  'Eduardo Oliveira',
  'Elaine Costa',
  'Bianca Costa',
  'Felipe Queiroga',
  'Flávio Nunes',
  'Gabriel Cruz',
  'Gabriel Oliveira',
  'Helisson Franco',
  'Isabella Santos',
  'João Medeiros Junior',
  'João Ferreira',
  'João Silva',
  'Leonardo Ferreira',
  'Leonardo Reis',
  'Lidiani Mulato',
  'Luiz Vidal',
  'Luiz Machado',
  'Mateus Silva',
  'Matheus Oliveira',
  'Matheus Gama',
  'Matheus Coelho',
  'Nicolas Pimentel',
  'Paulo Andrade',
  'Paulo Silva Junior',
  'Roberto Vieira',
  'Robson Silva',
  'Robson Silva',
  'Silvio Silva',
  'Theylor Jesus',
  'Victor Carmo',
  'Victor Almeida',
  'Walter Silva',
  'Wanessa Gomes',
  'Yasmin Lopes',
]

export function createSeedStudents(now = new Date().toISOString()): Student[] {
  return studentNames.map((fullName, index) => ({
    id: `student-${String(index + 1).padStart(2, '0')}`,
    fullName,
    number: String(index + 1),
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
