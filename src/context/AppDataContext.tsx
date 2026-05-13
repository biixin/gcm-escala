import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createInitialState } from '../data/seed'
import {
  clearStoredState,
  loadStoredState,
  normalizeImportedState,
  saveStoredState,
} from '../lib/storage'
import {
  makeId,
  upsertSchedule,
} from '../lib/schedules'
import type { AppState } from '../types'
import { AppDataContext, type AppDataContextValue } from './app-data-context'

function stamp(updater: (current: AppState) => AppState) {
  return (current: AppState) => ({
    ...updater(current),
    lastUpdated: new Date().toISOString(),
  })
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadStoredState())

  useEffect(() => {
    saveStoredState(state)
  }, [state])

  const value = useMemo<AppDataContextValue>(
    () => ({
      state,
      setImportedState: (value) => {
        const nextState = normalizeImportedState(value)
        if (!nextState) return false
        setState(nextState)
        return true
      },
      restoreFactoryDefaults: () => {
        clearStoredState()
        setState(createInitialState())
      },
      addStudent: (input) => {
        setState(
          stamp((current) => ({
            ...current,
            students: [
              ...current.students,
              {
                id: makeId('student'),
                fullName: input.fullName.trim(),
                number: input.number.trim(),
                active: input.active,
                createdAt: new Date().toISOString(),
              },
            ],
          })),
        )
      },
      updateStudent: (studentId, input) => {
        setState(
          stamp((current) => ({
            ...current,
            students: current.students.map((student) =>
              student.id === studentId ? { ...student, ...input } : student,
            ),
          })),
        )
      },
      deactivateStudent: (studentId) => {
        setState(
          stamp((current) => ({
            ...current,
            students: current.students.map((student) =>
              student.id === studentId ? { ...student, active: false } : student,
            ),
          })),
        )
      },
      addWarning: (input) => {
        setState(
          stamp((current) => ({
            ...current,
            warnings: [
              {
                ...input,
                id: makeId('warning'),
                reason: input.reason.trim(),
                createdAt: new Date().toISOString(),
              },
              ...current.warnings,
            ],
          })),
        )
      },
      saveManualSchedule: (
        weekStart,
        weekEnd,
        roomIds,
        bathroomIds,
        status,
        notes,
      ) => {
        setState(
          stamp((current) => {
            let schedules = upsertSchedule(current.schedules, {
              area: 'room',
              weekStart,
              weekEnd,
              studentIds: roomIds,
              status,
              notes,
            })
            schedules = upsertSchedule(schedules, {
              area: 'bathroom',
              weekStart,
              weekEnd,
              studentIds: bathroomIds,
              status,
              notes,
            })

            return { ...current, schedules }
          }),
        )
      },
      updateSchedule: (scheduleId, patch) => {
        setState(
          stamp((current) => ({
            ...current,
            schedules: current.schedules.map((schedule) =>
              schedule.id === scheduleId
                ? {
                    ...schedule,
                    ...patch,
                    updatedAt: new Date().toISOString(),
                  }
                : schedule,
            ),
          })),
        )
      },
      deleteSchedule: (scheduleId) => {
        setState(
          stamp((current) => ({
            ...current,
            schedules: current.schedules.filter((schedule) => schedule.id !== scheduleId),
          })),
        )
      },
      resetWeekSchedules: (weekStart) => {
        setState(
          stamp((current) => ({
            ...current,
            schedules: current.schedules.map((schedule) =>
              schedule.weekStart === weekStart
                ? {
                    ...schedule,
                    studentIds: [],
                    status: 'pending',
                    updatedAt: new Date().toISOString(),
                  }
                : schedule,
            ),
          })),
        )
      },
    }),
    [state],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
