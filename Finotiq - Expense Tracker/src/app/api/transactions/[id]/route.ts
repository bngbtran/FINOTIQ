import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { transactionSchema } from '@/types/form-schema'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id } = await params

    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
      },
    })

    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id } = await params
    const data = await req.json()

    const result = transactionSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 400 })
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 })
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: Number(data.amount),
        type: data.type,
        categoryId: data.categoryId,
        date: new Date(data.date),
        description: data.description || null,
        userId: data.userId
      },
    })

    return NextResponse.json({ success: true, data: updatedTransaction })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id } = await params

    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 })
    }

    await prisma.transaction.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
