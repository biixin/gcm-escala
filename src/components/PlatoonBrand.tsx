import { clsx } from 'clsx'

const GCM_LOGO_URL =
  'https://firebasestorage.googleapis.com/v0/b/gcm-caxias-17535.firebasestorage.app/o/logo-gcm-sem%20fundo.png?alt=media&token=abcb7bfd-cecf-4101-87b9-83f942235ebd'
const PLATOON_LOGO_URL =
  'https://firebasestorage.googleapis.com/v0/b/gcm-caxias-17535.firebasestorage.app/o/pelotao.png?alt=media&token=0126b54f-7313-437f-be5f-da3694cd1ee6'

type PlatoonBrandProps = {
  compact?: boolean
  className?: string
}

export function PlatoonBrand({ compact = false, className }: PlatoonBrandProps) {
  return (
    <section
      className={clsx(
        'relative overflow-hidden border-b border-slate-800 bg-slate-950',
        compact ? 'py-4' : 'py-5 sm:py-6',
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.16),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(234,179,8,0.12),transparent_30%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(135deg,#fff_1px,transparent_1px)] [background-size:18px_18px]" />

      <div
        className={clsx(
          'relative mx-auto grid max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8',
          compact
            ? 'grid-cols-[104px_1fr_52px]'
            : 'grid-cols-1 text-center md:grid-cols-[260px_1fr_130px] md:text-left',
        )}
      >
        <div className={clsx('flex justify-center', compact && 'justify-start')}>
          <div
            className={clsx(
              'flex items-center justify-center overflow-hidden',
              compact ? 'h-16 w-24' : 'h-36 w-48 sm:h-44 sm:w-60',
            )}
          >
            <img
              alt="Símbolo do 6º Pelotão Alfa - GCM DC"
              className="h-full w-auto max-w-none object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)]"
              draggable={false}
              src={PLATOON_LOGO_URL}
            />
          </div>
        </div>

        <div className={clsx('min-w-0', compact ? 'text-left' : 'text-center')}>
          <p
            className={clsx(
              'font-black uppercase text-slate-100',
              compact
                ? 'truncate text-lg sm:text-xl'
                : 'text-3xl sm:text-5xl lg:text-6xl',
            )}
          >
            Escala de Limpeza
          </p>
          <div className="mt-2 flex items-center justify-center gap-3 text-amber-300 md:justify-center">
            <span className="hidden h-px w-16 bg-amber-400/80 sm:block" />
            <span className="text-sm font-black uppercase sm:text-xl">
              ★ 6º Pelotão Alfa - GCM DC ★
            </span>
            <span className="hidden h-px w-16 bg-amber-400/80 sm:block" />
          </div>
          {!compact && (
            <p className="mt-2 text-sm font-semibold uppercase text-slate-400">
              Guarda Civil Municipal · Duque de Caxias
            </p>
          )}
        </div>

        <div className={clsx('flex justify-center', compact && 'justify-end')}>
          <img
            alt="Logo da Guarda Civil Municipal de Duque de Caxias"
            className={clsx(
              'object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)]',
              compact ? 'h-12 w-12' : 'h-24 w-24 sm:h-28 sm:w-28',
            )}
            draggable={false}
            src={GCM_LOGO_URL}
          />
        </div>
      </div>
    </section>
  )
}
