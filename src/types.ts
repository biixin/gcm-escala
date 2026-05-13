export type ScheduleArea = 'room' | 'bathroom' | 'general'

export type ScheduleStatus = 'scheduled' | 'done' | 'pending' | 'missed'

export type WarningType = 'Falta de limpeza'

export type Student = {
  id: string
  fullName: string
  number: string
  active: boolean
  createdAt: string
}

export type Schedule = {
  id: string
  area: Exclude<ScheduleArea, 'general'>
  weekStart: string
  weekEnd: string
  studentIds: string[]
  status: ScheduleStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export type Warning = {
  id: string
  studentId: string
  date: string
  reason: string
  type: WarningType
  relatedArea: ScheduleArea
  scheduleId?: string
  createdAt: string
}

export type AppState = {
  students: Student[]
  schedules: Schedule[]
  warnings: Warning[]
  lastUpdated: string
}

export type StudentStats = {
  student: Student
  roomCleanings: number
  bathroomCleanings: number
  totalCleanings: number
  warnings: number
  roomDates: string[]
  bathroomDates: string[]
}
