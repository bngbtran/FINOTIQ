import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { budgetSchema } from '@/types/form-schema'
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

    const budget = await prisma.budget.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
      },
    })

    if (!budget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: budget })
  } catch (error) {
    console.error('Error fetching budget:', error)
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

    const result = budgetSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 400 })
    }

    const existingBudget = await prisma.budget.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!existingBudget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 })
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

    const updatedBudget = await prisma.budget.update({
      where: {
        id,
      },
      data: result.data,
      include: {
        category: true,
      },
    })

    return NextResponse.json({ success: true, data: updatedBudget })
  } catch (error) {
    console.error('Error updating budget:', error)
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

    const existingBudget = await prisma.budget.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!existingBudget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 })
    }

    await prisma.budget.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
