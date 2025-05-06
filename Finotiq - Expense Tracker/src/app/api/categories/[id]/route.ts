import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { categorySchema } from '@/types/form-schema'
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

    const category = await prisma.category.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error fetching category:', error)
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

    const result = categorySchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.message }, { status: 400 })
    }

    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!existingCategory) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id,
      },
      data: result.data,
    })

    return NextResponse.json({ success: true, data: updatedCategory })
  } catch (error) {
    console.error('Error updating category:', error)
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

    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!existingCategory) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    const transactionsCount = await prisma.transaction.count({
      where: {
        categoryId: id,
      },
    })

    if (transactionsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Cannot delete category with transactions. Delete transactions first or move them to another category.',
        },
        { status: 400 },
      )
    }

    await prisma.category.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
