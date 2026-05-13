import { createContext } from 'react'
import type {
  AppState,
  Schedule,
  Student,
  Warning,
} from '../types'

export type StudentInput = Pick<Student, 'fullName' | 'number' | 'active'>
export type WarningInput = Omit<Warning, 'id' | 'createdAt'>

export type AppDataContextValue = {
  state: AppState
  setImportedState: (value: unknown) => boolean
  restoreFactoryDefaults: () => void
  addStudent: (input: StudentInput) => void
  updateStudent: (studentId: string, input: StudentInput) => void
  deactivateStudent: (studentId: string) => void
  addWarning: (input: WarningInput) => void
  saveManualSchedule: (
    weekStart: string,
    weekEnd: string,
    roomIds: string[],
    bathroomIds: string[],
    status: Schedule['status'],
    notes?: string,
  ) => void
  updateSchedule: (scheduleId: string, patch: Partial<Schedule>) => void
  deleteSchedule: (scheduleId: string) => void
  resetWeekSchedules: (weekStart: string) => void
}

export const AppDataContext = createContext<AppDataContextValue | null>(null)
