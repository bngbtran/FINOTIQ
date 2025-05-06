'use client'

import { cn } from '@/lib/utils'
import { CreditCard, LayoutDashboard, ListTodo, PieChart, Plus, Tags } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

interface MobileNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function MobileNav({ className, ...props }: MobileNavProps) {
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
    <div className={cn('bg-background border-t', className)} {...props}>
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center h-16 w-full text-xs font-medium transition-colors',
              item.isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <item.icon className={cn('h-5 w-5 mb-1', item.isActive ? 'text-primary' : 'text-muted-foreground')} />
            {item.title}
          </Link>
        ))}
      </div>
      <Link
        href="/transactions/new"
        className="fixed bottom-20 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  )
}
