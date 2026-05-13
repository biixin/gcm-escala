import { CalendarDays, CheckCircle2, DoorOpen } from 'lucide-react'
import { formatWeekRange } from '../lib/dates'
import { getStudentNumber } from '../lib/schedules'
import type { Schedule, Student, StudentStats } from '../types'
import { Badge, EmptyState, StatusBadge } from './ui'

type ScheduleCardProps = {
  title: string
  schedule?: Schedule
  students: Student[]
  statsById: Map<string, StudentStats>
}

export function ScheduleCard({
  title,
  schedule,
  students,
  statsById,
}: ScheduleCardProps) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-black/20">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-blue-600 text-white shadow-lg shadow-blue-950/40">
            {schedule?.area === 'bathroom' ? <DoorOpen size={22} /> : <CheckCircle2 size={22} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-50">{title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <CalendarDays size={16} />
              {schedule ? formatWeekRange(schedule.weekStart, schedule.weekEnd) : 'Sem semana cadastrada'}
            </div>
          </div>
        </div>
        {schedule && <StatusBadge status={schedule.status} />}
      </div>

      {!schedule ? (
        <EmptyState>Escala não cadastrada para a semana atual.</EmptyState>
      ) : (
        <div className="grid gap-3">
          {schedule.studentIds.length === 0 ? (
            <EmptyState>Nenhum aluno escalado.</EmptyState>
          ) : (
            schedule.studentIds.map((studentId) => {
              const student = students.find((item) => item.id === studentId)
              const stat = statsById.get(studentId)

              return (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-950/60 px-3 py-3"
                  key={studentId}
                >
                  <div>
                    <p className="font-bold text-slate-50">
                      {student?.fullName ?? 'Aluno removido'}
                    </p>
                    <p className="text-sm text-slate-400">
                      Nº {getStudentNumber(students, studentId)} · {stat?.totalCleanings ?? 0} participações
                    </p>
                  </div>
                  <Badge tone={(stat?.warnings ?? 0) > 0 ? 'yellow' : 'green'}>
                    {stat?.warnings ?? 0} faltas de limpeza
                  </Badge>
                </div>
              )
            })
          )}
        </div>
      )}
    </section>
  )
}
