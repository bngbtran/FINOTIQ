import { DEFAULT_CATEGORIES } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/types/form-schema'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { action, ...data } = await req.json()
    const supabase = await createClient()

    if (action === 'login') {
      const result = loginSchema.safeParse(data)
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error.message }, { status: 400 })
      }

      const { email, password } = result.data

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, data: authData })
    }

    if (action === 'register') {
      const result = registerSchema.safeParse(data)
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error.message }, { status: 400 })
      }

      const { name, email, password } = result.data

      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      const user = await prisma.user.create({
        data: {
          id: authData.user!.id,
          email,
          name,
        },
      })

      await Promise.all(
        DEFAULT_CATEGORIES.map(async (category) => {
          await prisma.category.create({
            data: {
              ...category,
              userId: user.id,
            },
          })
        }),
      )

      return NextResponse.json({ success: true, data: authData })
    }

    if (action === 'logout') {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
