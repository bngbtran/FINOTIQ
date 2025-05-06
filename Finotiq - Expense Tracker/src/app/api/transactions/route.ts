import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { TransactionType } from '@/types'
import { transactionSchema } from '@/types/form-schema'
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

    const type = url.searchParams.get('type') as 'income' | 'expense' | null
    const categoryId = url.searchParams.get('categoryId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const page = Number.parseInt(url.searchParams.get('page') || '1')
    const limit = Number.parseInt(url.searchParams.get('limit') || '10')

    const where: any = { userId }

    if (type) {
      where.type = type
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      }
    }

    const total = await prisma.transaction.count({ where })

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
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

    const parsedData = {
      ...data,
      date: new Date(data.date)
    }

    const result = transactionSchema.safeParse(parsedData)
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 400 })
    }

    try {
      const transaction = await prisma.transaction.create({
        data: {
          ...result.data,
          userId,
          type: result.data.type as TransactionType,
        },
        include: {
          category: true,
        },
      })

      return NextResponse.json({ success: true, data: transaction })
    } catch (error) {
      console.error('Error creating transaction:', error)
      return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
