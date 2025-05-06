'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User as UserIcon, LogOut } from 'lucide-react'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import router from 'next/router'

interface HeaderProps {
  user: User
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [showProfileOverlay, setShowProfileOverlay] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'logout' }),
    })

    router.push('/login')
  }

  const userInitials = user.user_metadata?.name
    ? `${user.user_metadata.name.charAt(0)}`
    : user.email?.charAt(0).toUpperCase()

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b" style={{ backgroundColor: '#003C45' }}>
        <div className="flex h-16 items-center justify-between w-full pr-0">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2 ml-4">
              <img src="/images/logo_yellow.png" alt="Finotiq Logo" className="h-40 w-auto" />
            </Link>
          </div>
          <div className="flex items-center gap-4 pr-[2vw]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full p-0">
                  <div className="flex items-center justify-center rounded-full border-4 border-[#F4FAB9] bg-[#F4FAB9]">
                    <Avatar className="h-8 w-8 bg-[#F4FAB9]">
                      <AvatarFallback className="bg-[#f4fab9] text-[#003C45] font-bold">{userInitials}</AvatarFallback>
                    </Avatar>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1 text-left">
                    <p className="text-sm font-medium leading-none text-[#003C45]">
                      {user.user_metadata?.name || 'Người dùng'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground italic">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-[#003C45]"
                  >
                    <UserIcon className="h-4 w-4" /> Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      {showProfileOverlay && (
        <div className="fixed inset-0 z-[9999] bg-[#003C45]/80 backdrop-blur-sm flex items-center justify-center">
        </div>
      )}
    </>
  )
}
