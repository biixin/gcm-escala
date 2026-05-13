const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
})

export function toISODate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseISODate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getWeekRange(base = new Date()) {
  const date = new Date(base)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const start = new Date(date)
  start.setDate(date.getDate() + mondayOffset)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return {
    weekStart: toISODate(start),
    weekEnd: toISODate(end),
  }
}

export function addDays(isoDate: string, amount: number) {
  const date = parseISODate(isoDate)
  date.setDate(date.getDate() + amount)
  return toISODate(date)
}

export function formatDate(isoDate: string) {
  return dateFormatter.format(parseISODate(isoDate))
}

export function formatShortDate(isoDate: string) {
  return shortDateFormatter.format(parseISODate(isoDate))
}

export function formatWeekRange(weekStart: string, weekEnd: string) {
  return `${formatDate(weekStart)} a ${formatDate(weekEnd)}`
}
