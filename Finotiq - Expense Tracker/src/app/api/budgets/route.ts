import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { budgetSchema } from '@/types/form-schema'
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
    const url = new URL(req.url)

    const month = url.searchParams.get('month') ? Number.parseInt(url.searchParams.get('month')!) : null
    const year = url.searchParams.get('year') ? Number.parseInt(url.searchParams.get('year')!) : null
    const categoryId = url.searchParams.get('categoryId')

    const where: any = { userId }

    if (month !== null) {
      where.month = month
    }

    if (year !== null) {
      where.year = year
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: true,
      },
    })

    return NextResponse.json({ success: true, data: budgets })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const data = await req.json()

    const result = budgetSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 400 })
    }

    const category = await prisma.category.findUnique({
      where: {
        id: result.data.categoryId,
        userId,
      },
    })

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId: result.data.categoryId,
        month: result.data.month,
        year: result.data.year,
      },
    })

    if (existingBudget) {
      const updatedBudget = await prisma.budget.update({
        where: {
          id: existingBudget.id,
        },
        data: {
          amount: result.data.amount,
        },
        include: {
          category: true,
        },
      })

      return NextResponse.json({ success: true, data: updatedBudget })
    }

    const budget = await prisma.budget.create({
      data: {
        ...result.data,
        userId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ success: true, data: budget })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
