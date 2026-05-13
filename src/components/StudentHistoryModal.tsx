import type { ReactNode } from 'react'
import { AlertTriangle, DoorOpen, ShieldCheck } from 'lucide-react'
import { formatDate, formatWeekRange } from '../lib/dates'
import {
  getStudentSchedules,
  getStudentWarnings,
} from '../lib/schedules'
import type { AppState, Student } from '../types'
import { AreaBadge, Badge, EmptyState, Modal, StatusBadge } from './ui'

type StudentHistoryModalProps = {
  state: AppState
  student: Student
  onClose: () => void
}

export function StudentHistoryModal({
  state,
  student,
  onClose,
}: StudentHistoryModalProps) {
  const schedules = getStudentSchedules(state.schedules, student.id)
  const roomSchedules = schedules.filter((schedule) => schedule.area === 'room')
  const bathroomSchedules = schedules.filter((schedule) => schedule.area === 'bathroom')
  const warnings = getStudentWarnings(state.warnings, student.id)

  return (
    <Modal title={student.fullName} onClose={onClose}>
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Summary icon={<ShieldCheck size={18} />} label="Sala" value={roomSchedules.length} />
          <Summary icon={<DoorOpen size={18} />} label="Banheiro" value={bathroomSchedules.length} />
          <Summary
            icon={<AlertTriangle size={18} />}
            label="Faltas de limpeza"
            value={warnings.length}
          />
        </div>

        <HistorySection
          title="Sala"
          icon={<ShieldCheck size={18} />}
          empty="Nenhuma limpeza de sala registrada."
        >
          {roomSchedules.map((schedule) => (
            <HistoryRow key={schedule.id}>
              <div>
                <p className="font-semibold text-slate-50">
                  {formatWeekRange(schedule.weekStart, schedule.weekEnd)}
                </p>
                {schedule.notes && <p className="text-sm text-slate-400">{schedule.notes}</p>}
              </div>
              <StatusBadge status={schedule.status} />
            </HistoryRow>
          ))}
        </HistorySection>

        <HistorySection
          title="Banheiro"
          icon={<DoorOpen size={18} />}
          empty="Nenhuma limpeza de banheiro registrada."
        >
          {bathroomSchedules.map((schedule) => (
            <HistoryRow key={schedule.id}>
              <div>
                <p className="font-semibold text-slate-50">
                  {formatWeekRange(schedule.weekStart, schedule.weekEnd)}
                </p>
                {schedule.notes && <p className="text-sm text-slate-400">{schedule.notes}</p>}
              </div>
              <StatusBadge status={schedule.status} />
            </HistoryRow>
          ))}
        </HistorySection>

        <HistorySection
          title="Faltas de limpeza"
          icon={<AlertTriangle size={18} />}
          empty="Nenhuma falta de limpeza registrada."
        >
          {warnings.map((warning) => (
            <HistoryRow key={warning.id}>
              <div>
                <p className="font-semibold text-slate-50">Falta de limpeza</p>
                <p className="text-sm text-slate-400">{warning.reason}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <AreaBadge area={warning.relatedArea} />
                <Badge tone="yellow">{formatDate(warning.date)}</Badge>
              </div>
            </HistoryRow>
          ))}
        </HistorySection>
      </div>
    </Modal>
  )
}

function Summary({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-3 flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <strong className="text-2xl text-slate-50">{value}</strong>
    </div>
  )
}

function HistorySection({
  title,
  icon,
  empty,
  children,
}: {
  title: string
  icon: ReactNode
  empty: string
  children: ReactNode
}) {
  const content = Array.isArray(children) ? children.filter(Boolean) : children
  const isEmpty = Array.isArray(content) ? content.length === 0 : !content

  return (
    <section className="grid gap-3 rounded-lg border border-slate-800 p-4">
      <div className="flex items-center gap-2 text-slate-50">
        {icon}
        <h3 className="font-bold">{title}</h3>
      </div>
      {isEmpty ? <EmptyState>{empty}</EmptyState> : content}
    </section>
  )
}

function HistoryRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-slate-950/60 px-3 py-3">
      {children}
    </div>
  )
}
