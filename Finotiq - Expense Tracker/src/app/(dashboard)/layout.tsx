import Header from '@/components/layout/header'
import MobileNav from '@/components/layout/mobile-nav'
import Sidebar from '@/components/layout/sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header user={session.user} />
      <div className="flex flex-1">
        <Sidebar className="hidden lg:block w-64 border-r" />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <MobileNav className="lg:hidden fixed bottom-0 left-0 right-0 z-10" />
    </div>
  )
}
