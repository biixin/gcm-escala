import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { clsx } from 'clsx'
import type { Schedule, ScheduleArea } from '../types'
import { AREA_LABEL, STATUS_LABEL } from '../lib/schedules'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  icon?: ReactNode
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-500',
  secondary:
    'border border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-slate-500',
  danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-500',
  ghost: 'text-slate-200 hover:bg-slate-800 focus-visible:outline-slate-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:outline-emerald-500',
}

export function Button({
  className,
  variant = 'primary',
  icon,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        buttonVariants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}

export function IconButton({
  className,
  variant = 'secondary',
  children,
  ...props
}: ButtonProps) {
  return (
    <Button
      className={clsx('h-10 w-10 px-0', className)}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  )
}

export function Badge({
  children,
  tone = 'slate',
}: {
  children: ReactNode
  tone?: 'slate' | 'green' | 'yellow' | 'red' | 'blue'
}) {
  const tones = {
    slate: 'border-slate-700 bg-slate-800 text-slate-200',
    green: 'border-emerald-700/60 bg-emerald-500/10 text-emerald-300',
    yellow: 'border-amber-600/60 bg-amber-500/10 text-amber-300',
    red: 'border-red-700/60 bg-red-500/10 text-red-300',
    blue: 'border-blue-700/60 bg-blue-500/10 text-blue-300',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: Schedule['status'] }) {
  const tone =
    status === 'done'
      ? 'green'
      : status === 'missed'
        ? 'red'
        : status === 'pending'
          ? 'yellow'
          : 'blue'

  return <Badge tone={tone}>{STATUS_LABEL[status]}</Badge>
}

export function AreaBadge({ area }: { area: ScheduleArea }) {
  return <Badge tone={area === 'room' ? 'blue' : area === 'bathroom' ? 'green' : 'slate'}>{AREA_LABEL[area]}</Badge>
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-300">
      <span>{label}</span>
      {children}
    </label>
  )
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'min-h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        className,
      )}
      {...props}
    />
  )
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        'min-h-24 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        className,
      )}
      {...props}
    />
  )
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        'min-h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm font-medium text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={clsx('rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm shadow-black/20', className)}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {typeof title === 'string' ? (
            <h2 className="text-lg font-bold text-slate-50">{title}</h2>
          ) : (
            title
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
      <section className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/40">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-50">{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
        {children}
      </section>
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center text-sm font-medium text-slate-400">
      {children}
    </div>
  )
}
