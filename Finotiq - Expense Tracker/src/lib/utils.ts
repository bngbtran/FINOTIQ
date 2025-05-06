import { type ClassValue, clsx } from 'clsx'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: vi })
}

export function formatDateTime(date: Date): string {
  return format(date, 'HH:mm - dd/MM/yyyy', { locale: vi })
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

export function getMonthYearRange(months = 6): { month: number; year: number }[] {
  const now = new Date()
  const result = []

  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    })
  }

  return result
}

export function getMonthName(month: number): string {
  const months = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ]
  return months[month - 1]
}

export function getColorBrightness(color: string): 'light' | 'dark' {
  const sanitizedColor = color.replace(/^#/, '')

  let r: number
  let g: number
  let b: number
  if (sanitizedColor.length === 3) {
    r = Number.parseInt(sanitizedColor[0] + sanitizedColor[0], 16)
    g = Number.parseInt(sanitizedColor[1] + sanitizedColor[1], 16)
    b = Number.parseInt(sanitizedColor[2] + sanitizedColor[2], 16)
  } else if (sanitizedColor.length === 6) {
    r = Number.parseInt(sanitizedColor.substring(0, 2), 16)
    g = Number.parseInt(sanitizedColor.substring(2, 4), 16)
    b = Number.parseInt(sanitizedColor.substring(4, 6), 16)
  } else {
    return 'dark'
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? 'dark' : 'light'
}
