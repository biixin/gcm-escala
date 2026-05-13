import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogIn, Search, Shield, UsersRound } from 'lucide-react'
import { PlatoonBrand } from '../components/PlatoonBrand'
import { ScheduleCard } from '../components/ScheduleCard'
import { StudentHistoryModal } from '../components/StudentHistoryModal'
import { StudentTable } from '../components/StudentTable'
import { Badge, Button, EmptyState, Panel, Select, TextInput } from '../components/ui'
import { useAppData } from '../context/useAppData'
import { formatWeekRange, getWeekRange } from '../lib/dates'
import { computeStudentStats, findSchedule } from '../lib/schedules'

type CleaningFaultFilter = 'all' | 'with' | 'without'

export function PublicPage() {
  const { state } = useAppData()
  const [search, setSearch] = useState('')
  const [cleaningFaultFilter, setCleaningFaultFilter] =
    useState<CleaningFaultFilter>('all')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  const currentWeek = getWeekRange()
  const stats = useMemo(() => computeStudentStats(state), [state])
  const statsById = useMemo(
    () => new Map(stats.map((stat) => [stat.student.id, stat])),
    [stats],
  )
  const roomSchedule = findSchedule(
    state.schedules,
    'room',
    currentWeek.weekStart,
  )
  const bathroomSchedule = findSchedule(
    state.schedules,
    'bathroom',
    currentWeek.weekStart,
  )

  const filteredStats = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return stats
      .filter((stat) => {
        const matchesSearch =
          stat.student.fullName.toLowerCase().includes(normalizedSearch) ||
          stat.student.number.includes(normalizedSearch)
        const matchesFaults =
          cleaningFaultFilter === 'all' ||
          (cleaningFaultFilter === 'with' && stat.warnings > 0) ||
          (cleaningFaultFilter === 'without' && stat.warnings === 0)

        return matchesSearch && matchesFaults
      })
      .sort((first, second) =>
        first.student.number.localeCompare(second.student.number, 'pt-BR', {
          numeric: true,
        }),
      )
  }, [cleaningFaultFilter, search, stats])

  const selectedStudent = state.students.find(
    (student) => student.id === selectedStudentId,
  )

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <PlatoonBrand />
      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-blue-600 text-white shadow-lg shadow-blue-950/40">
              <Shield size={23} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-50">
                6º Pelotão Alfa - GCM DC
              </h1>
              <p className="text-sm font-medium text-slate-400">
                {formatWeekRange(currentWeek.weekStart, currentWeek.weekEnd)}
              </p>
            </div>
          </div>
          <Link to="/login">
            <Button icon={<LogIn size={16} />} variant="secondary">
              Admin
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-2">
          <ScheduleCard
            schedule={roomSchedule}
            statsById={statsById}
            students={state.students}
            title="Limpeza da Sala - Semana Atual"
          />
          <ScheduleCard
            schedule={bathroomSchedule}
            statsById={statsById}
            students={state.students}
            title="Limpeza do Banheiro - Semana Atual"
          />
        </section>

        <Panel
          action={
            <Badge tone="blue">
              <UsersRound size={14} /> {filteredStats.length} alunos
            </Badge>
          }
          title="Busca por aluno e lista geral"
        >
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <TextInput
                className="w-full pl-10"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquisar por nome ou número"
                value={search}
              />
            </label>
            <Select
              onChange={(event) =>
                setCleaningFaultFilter(event.target.value as CleaningFaultFilter)
              }
              value={cleaningFaultFilter}
            >
              <option value="all">Todas as faltas</option>
              <option value="with">Com falta de limpeza</option>
              <option value="without">Sem falta de limpeza</option>
            </Select>
          </div>

          {filteredStats.length === 0 ? (
            <EmptyState>Nenhum aluno encontrado.</EmptyState>
          ) : (
            <StudentTable onSelect={setSelectedStudentId} stats={filteredStats} />
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
