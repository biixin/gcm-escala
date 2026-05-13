import {
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  Download,
  FileDown,
  History,
  Home,
  LogOut,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Upload,
  UserPlus,
} from 'lucide-react'
import { PlatoonBrand } from '../components/PlatoonBrand'
import { ScheduleCard } from '../components/ScheduleCard'
import { StudentHistoryModal } from '../components/StudentHistoryModal'
import {
  AreaBadge,
  Badge,
  Button,
  EmptyState,
  Field,
  IconButton,
  Panel,
  Select,
  StatusBadge,
  TextArea,
  TextInput,
} from '../components/ui'
import { useAppData } from '../context/useAppData'
import { useAuth } from '../context/useAuth'
import { addDays, formatDate, formatWeekRange, getWeekRange } from '../lib/dates'
import {
  AREA_LABEL,
  computeStudentStats,
  findSchedule,
  getStudentName,
  validateScheduleConflict,
} from '../lib/schedules'
import type { Schedule, ScheduleArea, Student } from '../types'

type StudentForm = Pick<Student, 'fullName' | 'number' | 'active'>

const emptyStudentForm: StudentForm = {
  fullName: '',
  number: '',
  active: true,
}

export function AdminPage() {
  const {
    state,
    addStudent,
    addWarning,
    deactivateStudent,
    deleteSchedule,
    resetWeekSchedules,
    restoreFactoryDefaults,
    saveManualSchedule,
    setImportedState,
    updateSchedule,
    updateStudent,
  } = useAppData()
  const { isAuthenticated, logout } = useAuth()
  const importInputRef = useRef<HTMLInputElement | null>(null)

  const currentWeek = getWeekRange()
  const initialManualRoom = findSchedule(
    state.schedules,
    'room',
    currentWeek.weekStart,
  )
  const initialManualBathroom = findSchedule(
    state.schedules,
    'bathroom',
    currentWeek.weekStart,
  )

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [studentForm, setStudentForm] = useState<StudentForm>(emptyStudentForm)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)

  const [manualWeekStart, setManualWeekStart] = useState(currentWeek.weekStart)
  const [manualRoomIds, setManualRoomIds] = useState<string[]>(
    initialManualRoom?.studentIds ?? [],
  )
  const [manualBathroomIds, setManualBathroomIds] = useState<string[]>(
    initialManualBathroom?.studentIds ?? [],
  )
  const [manualStatus, setManualStatus] = useState<Schedule['status']>(
    initialManualRoom?.status ?? initialManualBathroom?.status ?? 'scheduled',
  )
  const [manualNotes, setManualNotes] = useState(
    initialManualRoom?.notes ?? initialManualBathroom?.notes ?? '',
  )

  const [faultStudentId, setFaultStudentId] = useState('')
  const [faultDate, setFaultDate] = useState(currentWeek.weekStart)
  const [faultArea, setFaultArea] = useState<ScheduleArea>('general')
  const [faultReason, setFaultReason] = useState('')

  const stats = useMemo(() => computeStudentStats(state), [state])
  const statsById = useMemo(
    () => new Map(stats.map((stat) => [stat.student.id, stat])),
    [stats],
  )
  const activeStudents = state.students.filter((student) => student.active)
  const currentRoom = findSchedule(state.schedules, 'room', currentWeek.weekStart)
  const currentBathroom = findSchedule(
    state.schedules,
    'bathroom',
    currentWeek.weekStart,
  )
  const selectedStudent = state.students.find(
    (student) => student.id === selectedStudentId,
  )
  const filteredStudents = stats.filter((stat) => {
    const query = studentSearch.trim().toLowerCase()
    return (
      stat.student.fullName.toLowerCase().includes(query) ||
      stat.student.number.includes(query)
    )
  })
  const sortedSchedules = [...state.schedules].sort((first, second) => {
    const dateSort = second.weekStart.localeCompare(first.weekStart)
    if (dateSort !== 0) return dateSort
    return first.area.localeCompare(second.area)
  })

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  const manualWeekEnd = addDays(manualWeekStart, 6)

  function loadManualWeek(weekStart: string) {
    const room = findSchedule(state.schedules, 'room', weekStart)
    const bathroom = findSchedule(state.schedules, 'bathroom', weekStart)
    setManualRoomIds(room?.studentIds ?? [])
    setManualBathroomIds(bathroom?.studentIds ?? [])
    setManualStatus(room?.status ?? bathroom?.status ?? 'scheduled')
    setManualNotes(room?.notes ?? bathroom?.notes ?? '')
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const conflicts = validateScheduleConflict(manualRoomIds, manualBathroomIds)

    if (conflicts.length > 0) {
      const names = conflicts
        .map((studentId) => getStudentName(state.students, studentId))
        .join(', ')
      window.alert(`Conflito bloqueado: ${names} está nas duas escalas da mesma semana.`)
      return
    }

    saveManualSchedule(
      manualWeekStart,
      manualWeekEnd,
      manualRoomIds,
      manualBathroomIds,
      manualStatus,
      manualNotes,
    )
  }

  function toggleManualStudent(area: Schedule['area'], studentId: string) {
    const isRoom = area === 'room'
    const source = isRoom ? manualRoomIds : manualBathroomIds
    const other = isRoom ? manualBathroomIds : manualRoomIds
    const setSource = isRoom ? setManualRoomIds : setManualBathroomIds

    if (!source.includes(studentId) && other.includes(studentId)) {
      window.alert('O mesmo aluno não pode estar na sala e no banheiro na mesma semana.')
      return
    }

    setSource(
      source.includes(studentId)
        ? source.filter((current) => current !== studentId)
        : [...source, studentId],
    )
  }

  function handleStudentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!studentForm.fullName.trim() || !studentForm.number.trim()) return

    if (editingStudentId) {
      updateStudent(editingStudentId, studentForm)
    } else {
      addStudent(studentForm)
    }

    setStudentForm(emptyStudentForm)
    setEditingStudentId(null)
  }

  function startStudentEdit(student: Student) {
    setEditingStudentId(student.id)
    setStudentForm({
      fullName: student.fullName,
      number: student.number,
      active: student.active,
    })
  }

  function handleFaultSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!faultStudentId || !faultReason.trim()) return

    addWarning({
      studentId: faultStudentId,
      date: faultDate,
      reason: faultReason,
      type: 'Falta de limpeza',
      relatedArea: faultArea,
    })
    setFaultReason('')
  }

  function handleExportBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `backup-escala-6-pelotao-${currentWeek.weekStart}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleImportBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        const imported = setImportedState(parsed)
        window.alert(imported ? 'Backup importado com sucesso.' : 'Arquivo inválido.')
      } catch {
        window.alert('Não foi possível ler o arquivo JSON.')
      } finally {
        event.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  function handleDeleteSchedule(scheduleId: string) {
    if (window.confirm('Remover esta escala?')) {
      deleteSchedule(scheduleId)
    }
  }

  function handleResetCurrentWeek() {
    if (window.confirm('Resetar a escala atual?')) {
      resetWeekSchedules(currentWeek.weekStart)
    }
  }

  function handleRestoreDefaults() {
    if (window.confirm('Restaurar dados iniciais e limpar alterações locais?')) {
      restoreFactoryDefaults()
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <PlatoonBrand compact className="print-hide" />
      <header className="print-hide border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-black text-slate-50">
              Administração - 6º Pelotão Alfa
            </h1>
            <p className="text-sm font-medium text-slate-400">
              GCM DC · Atualizado em {formatDate(state.lastUpdated.slice(0, 10))}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/">
              <Button icon={<Home size={16} />} variant="secondary">
                Página pública
              </Button>
            </Link>
            <Button icon={<LogOut size={16} />} onClick={logout} variant="ghost">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          <Metric label="Alunos ativos" value={activeStudents.length} />
          <Metric label="Escalas" value={state.schedules.length} />
          <Metric
            label="Faltas de limpeza"
            value={state.warnings.length}
            tone="yellow"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ScheduleCard
            schedule={currentRoom}
            statsById={statsById}
            students={state.students}
            title="Limpeza da Sala - Semana Atual"
          />
          <ScheduleCard
            schedule={currentBathroom}
            statsById={statsById}
            students={state.students}
            title="Limpeza do Banheiro - Semana Atual"
          />
        </section>

        <Panel title="Ações rápidas">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <Button
              icon={<RotateCcw size={16} />}
              onClick={handleResetCurrentWeek}
              variant="secondary"
            >
              Resetar atual
            </Button>
            <Button
              icon={<FileDown size={16} />}
              onClick={() => window.print()}
              variant="secondary"
            >
              Exportar PDF
            </Button>
            <Button
              icon={<Printer size={16} />}
              onClick={() => window.print()}
              variant="secondary"
            >
              Imprimir
            </Button>
            <Button
              icon={<Download size={16} />}
              onClick={handleExportBackup}
              variant="success"
            >
              Backup JSON
            </Button>
            <Button
              icon={<Upload size={16} />}
              onClick={() => importInputRef.current?.click()}
              variant="secondary"
            >
              Importar JSON
            </Button>
            <Button
              icon={<RotateCcw size={16} />}
              onClick={handleRestoreDefaults}
              variant="danger"
            >
              Restaurar base
            </Button>
            <input
              accept="application/json"
              className="hidden"
              onChange={handleImportBackup}
              ref={importInputRef}
              type="file"
            />
          </div>
        </Panel>

        <Panel title="Criar ou editar escala manual">
          <form className="grid gap-4" onSubmit={handleManualSubmit}>
            <div className="grid gap-3 md:grid-cols-[160px_160px_1fr]">
              <Field label="Semana">
                <TextInput
                  onChange={(event) => {
                    setManualWeekStart(event.target.value)
                    loadManualWeek(event.target.value)
                  }}
                  type="date"
                  value={manualWeekStart}
                />
              </Field>
              <Field label="Status">
                <Select
                  onChange={(event) =>
                    setManualStatus(event.target.value as Schedule['status'])
                  }
                  value={manualStatus}
                >
                  <option value="scheduled">Programada</option>
                  <option value="done">Concluída</option>
                  <option value="pending">Pendente</option>
                  <option value="missed">Falta registrada</option>
                </Select>
              </Field>
              <Field label="Observações">
                <TextInput
                  onChange={(event) => setManualNotes(event.target.value)}
                  value={manualNotes}
                />
              </Field>
            </div>

            <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-800">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-950 text-slate-100">
                  <tr>
                    <th className="px-4 py-3">Aluno</th>
                    <th className="px-4 py-3 text-center">Sala</th>
                    <th className="px-4 py-3 text-center">Banheiro</th>
                    <th className="px-4 py-3 text-center">Faltas de limpeza</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900">
                  {activeStudents.map((student) => {
                    const stat = statsById.get(student.id)
                    return (
                      <tr key={student.id}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-50">{student.fullName}</p>
                          <p className="text-xs font-medium text-slate-400">
                            Nº {student.number}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            checked={manualRoomIds.includes(student.id)}
                            className="h-5 w-5 accent-blue-700"
                            onChange={() => toggleManualStudent('room', student.id)}
                            type="checkbox"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            checked={manualBathroomIds.includes(student.id)}
                            className="h-5 w-5 accent-emerald-700"
                            onChange={() => toggleManualStudent('bathroom', student.id)}
                            type="checkbox"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge tone={(stat?.warnings ?? 0) > 0 ? 'yellow' : 'green'}>
                            {stat?.warnings ?? 0}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Button icon={<Save size={16} />} type="submit">
              Salvar escala manual
            </Button>
          </form>
        </Panel>

        <section className="grid gap-4 xl:grid-cols-2">
          <Panel title="Cadastro de alunos">
            <form className="mb-4 grid gap-3" onSubmit={handleStudentSubmit}>
              <div className="grid gap-3 md:grid-cols-[1fr_100px_130px]">
                <Field label="Nome completo">
                  <TextInput
                    onChange={(event) =>
                      setStudentForm((current) => ({
                        ...current,
                        fullName: event.target.value,
                      }))
                    }
                    value={studentForm.fullName}
                  />
                </Field>
                <Field label="Número">
                  <TextInput
                    onChange={(event) =>
                      setStudentForm((current) => ({
                        ...current,
                        number: event.target.value,
                      }))
                    }
                    value={studentForm.number}
                  />
                </Field>
                <Field label="Status">
                  <Select
                    onChange={(event) =>
                      setStudentForm((current) => ({
                        ...current,
                        active: event.target.value === 'true',
                      }))
                    }
                    value={String(studentForm.active)}
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </Select>
                </Field>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button icon={<UserPlus size={16} />} type="submit">
                  {editingStudentId ? 'Salvar aluno' : 'Adicionar aluno'}
                </Button>
                {editingStudentId && (
                  <Button
                    onClick={() => {
                      setEditingStudentId(null)
                      setStudentForm(emptyStudentForm)
                    }}
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>

            <label className="relative mb-3 block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <TextInput
                className="w-full pl-10"
                onChange={(event) => setStudentSearch(event.target.value)}
                placeholder="Buscar aluno"
                value={studentSearch}
              />
            </label>

            <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-800">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-950 text-slate-100">
                  <tr>
                    <th className="px-4 py-3">Aluno</th>
                    <th className="px-4 py-3">Sala</th>
                    <th className="px-4 py-3">Banheiro</th>
                    <th className="px-4 py-3">Faltas de limpeza</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900">
                  {filteredStudents.map((stat) => (
                    <tr key={stat.student.id}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-50">{stat.student.fullName}</p>
                        <p className="text-xs font-medium text-slate-400">
                          Nº {stat.student.number} · {stat.student.active ? 'Ativo' : 'Inativo'}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-semibold">{stat.roomCleanings}</td>
                      <td className="px-4 py-3 font-semibold">{stat.bathroomCleanings}</td>
                      <td className="px-4 py-3">
                        <Badge tone={stat.warnings > 0 ? 'yellow' : 'green'}>
                          {stat.warnings}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <IconButton
                            onClick={() => startStudentEdit(stat.student)}
                            title="Editar aluno"
                          >
                            <Pencil size={16} />
                          </IconButton>
                          <IconButton
                            onClick={() => setSelectedStudentId(stat.student.id)}
                            title="Histórico individual"
                          >
                            <History size={16} />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              if (window.confirm('Inativar este aluno?')) {
                                deactivateStudent(stat.student.id)
                              }
                            }}
                            title="Inativar aluno"
                            variant="danger"
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Registrar falta de limpeza">
            <form className="grid gap-3" onSubmit={handleFaultSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Aluno">
                  <Select
                    onChange={(event) => setFaultStudentId(event.target.value)}
                    value={faultStudentId}
                  >
                    <option value="">Selecionar</option>
                    {state.students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.number} - {student.fullName}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Data">
                  <TextInput
                    onChange={(event) => setFaultDate(event.target.value)}
                    type="date"
                    value={faultDate}
                  />
                </Field>
                <Field label="Escala relacionada">
                  <Select
                    onChange={(event) => setFaultArea(event.target.value as ScheduleArea)}
                    value={faultArea}
                  >
                    <option value="general">Geral</option>
                    <option value="room">Sala</option>
                    <option value="bathroom">Banheiro</option>
                  </Select>
                </Field>
              </div>
              <Field label="Motivo">
                <TextArea
                  onChange={(event) => setFaultReason(event.target.value)}
                  value={faultReason}
                />
              </Field>
              <Button icon={<Plus size={16} />} type="submit">
                Registrar falta
              </Button>
            </form>
          </Panel>
        </section>

        <Panel title="Escalas cadastradas">
          {sortedSchedules.length === 0 ? (
            <EmptyState>Nenhuma escala cadastrada.</EmptyState>
          ) : (
            <div className="grid gap-2">
              {sortedSchedules.map((schedule) => (
                <ScheduleLine
                  key={schedule.id}
                  onDelete={handleDeleteSchedule}
                  onStatusChange={updateSchedule}
                  schedule={schedule}
                  students={state.students}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>

      {selectedStudent && (
        <StudentHistoryModal
          onClose={() => setSelectedStudentId(null)}
          state={state}
          student={selectedStudent}
        />
      )}
    </main>
  )
}

function Metric({
  label,
  value,
  tone = 'blue',
}: {
  label: string
  value: number
  tone?: 'blue' | 'yellow'
}) {
  const colors = {
    blue: 'text-blue-300',
    yellow: 'text-amber-300',
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm shadow-black/20">
      <p className="text-sm font-semibold text-slate-400">{label}</p>
      <strong className={`text-3xl ${colors[tone]}`}>{value}</strong>
    </section>
  )
}

function ScheduleLine({
  schedule,
  students,
  onDelete,
  onStatusChange,
}: {
  schedule: Schedule
  students: Student[]
  onDelete: (scheduleId: string) => void
  onStatusChange: (scheduleId: string, patch: Partial<Schedule>) => void
}) {
  return (
    <div className="grid gap-3 rounded-md bg-slate-950/60 px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-slate-50">
            {AREA_LABEL[schedule.area]} · {formatWeekRange(schedule.weekStart, schedule.weekEnd)}
          </p>
          <p className="text-sm text-slate-400">
            {schedule.studentIds.length} escalados
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AreaBadge area={schedule.area} />
          <StatusBadge status={schedule.status} />
          <Select
            className="w-36"
            onChange={(event) =>
              onStatusChange(schedule.id, {
                status: event.target.value as Schedule['status'],
              })
            }
            value={schedule.status}
          >
            <option value="scheduled">Programada</option>
            <option value="done">Concluída</option>
            <option value="pending">Pendente</option>
            <option value="missed">Falta</option>
          </Select>
          <IconButton
            onClick={() => onDelete(schedule.id)}
            title="Remover escala"
            variant="danger"
          >
            <Trash2 size={16} />
          </IconButton>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {schedule.studentIds.length === 0 ? (
          <Badge tone="yellow">Sem escalados</Badge>
        ) : (
          schedule.studentIds.map((studentId) => (
            <Badge key={studentId} tone="slate">
              {getStudentName(students, studentId)}
            </Badge>
          ))
        )}
      </div>
    </div>
  )
}
