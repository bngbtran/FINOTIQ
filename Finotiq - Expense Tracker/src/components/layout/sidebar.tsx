'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CreditCard, LayoutDashboard, ListTodo, PieChart, Plus, Settings, Tags } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      title: 'Tổng quan',
      isActive: pathname === '/dashboard',
    },
    {
      href: '/transactions',
      icon: CreditCard,
      title: 'Giao dịch',
      isActive: pathname === '/transactions' || pathname.startsWith('/transactions/'),
    },
    {
      href: '/categories',
      icon: Tags,
      title: 'Danh mục',
      isActive: pathname === '/categories',
    },
    {
      href: '/budgets',
      icon: ListTodo,
      title: 'Ngân sách',
      isActive: pathname === '/budgets',
    },
    {
      href: '/reports',
      icon: PieChart,
      title: 'Báo cáo',
      isActive: pathname === '/reports',
    },
  ]

  return (
    <aside className={cn('pb-12 bg-[#003C45]', className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                    item.isActive
                      ? 'bg-[#F4FAB9] text-[#003C45] hover:bg-[#F4FAB9]'
                      : 'text-white hover:bg-[#F4FAB9] hover:text-[#003C45]'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  )
}
