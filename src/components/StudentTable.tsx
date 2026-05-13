import { Eye, UserRound } from 'lucide-react'
import type { StudentStats } from '../types'
import { Badge, Button } from './ui'

type StudentTableProps = {
  stats: StudentStats[]
  onSelect: (studentId: string) => void
}

export function StudentTable({ stats, onSelect }: StudentTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-950 text-slate-100">
            <tr>
              <th className="px-4 py-3 font-semibold">Aluno</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Sala</th>
              <th className="px-4 py-3 font-semibold">Banheiro</th>
              <th className="px-4 py-3 font-semibold">Faltas de limpeza</th>
              <th className="px-4 py-3 text-right font-semibold">Histórico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900">
            {stats.map((stat) => (
              <tr className="hover:bg-slate-800/70" key={stat.student.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-blue-500/10 text-blue-300">
                      <UserRound size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-50">
                        {stat.student.fullName}{' '}
                        <span className="font-semibold text-amber-300">
                          — {stat.warnings} faltas
                        </span>
                      </p>
                      <p className="text-xs font-medium text-slate-400">Nº {stat.student.number}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={stat.student.active ? 'green' : 'slate'}>
                    {stat.student.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-300">{stat.roomCleanings}</td>
                <td className="px-4 py-3 font-semibold text-slate-300">{stat.bathroomCleanings}</td>
                <td className="px-4 py-3">
                  <Badge tone={stat.warnings > 0 ? 'yellow' : 'green'}>{stat.warnings}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    icon={<Eye size={16} />}
                    onClick={() => onSelect(stat.student.id)}
                    title={`Abrir histórico de ${stat.student.fullName}`}
                    variant="secondary"
                  >
                    Abrir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
