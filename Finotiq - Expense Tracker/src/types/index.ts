import { Budget, Category, Transaction, User } from '@prisma/client'

export type TransactionWithCategory = Transaction & {
  category: Category
}

export type CategoryWithBudget = Category & {
  budgets?: Budget[]
}

export type BudgetWithCategory = Budget & {
  category: Category
}

export type DashboardSummary = {
  balance: number
  income: number
  expense: number
  recentTransactions: TransactionWithCategory[]
}

export type MonthlyReport = {
  month: number
  year: number
  income: number
  expense: number
  balance: number
  categories: {
    id: string
    name: string
    color: string
    amount: number
    percentage: number
  }[]
}

export type TransactionType = 'income' | 'expense'

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}
