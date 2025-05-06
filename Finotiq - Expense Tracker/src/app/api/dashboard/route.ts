import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0)

    const monthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    const income = monthTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)

    const expense = monthTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expense

    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 5,
    })

    const monthExpenses = monthTransactions.filter(t => t.type === 'expense')

    const expenseByCategory = monthExpenses.reduce((acc, transaction) => {
      const category = transaction.category
      if (!acc[category.id]) {
        acc[category.id] = {
          categoryId: category.id,
          name: category.name,
          color: category.color,
          amount: 0
        }
      }
      acc[category.id].amount += transaction.amount
      return acc
    }, {} as Record<string, { categoryId: string; name: string; color: string; amount: number }>)

    const expenseCategoryData = Object.values(expenseByCategory).map(item => ({
      ...item,
      percentage: (item.amount / (expense || 1)) * 100
    }))

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
      include: {
        category: true,
      },
    })

    const budgetData = budgets.map((b) => {
      const spent = monthTransactions
        .filter((t) => t.categoryId === b.categoryId && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category.name,
        color: b.category.color,
        budgetAmount: b.amount,
        spentAmount: spent,
        percentage: (spent / b.amount) * 100,
        remaining: b.amount - spent,
      }
    })

    const response = {
      summary: {
        income,
        expense,
        balance,
      },
      recentTransactions,
      expenseByCategory: expenseCategoryData,
      budgets: budgetData,
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
