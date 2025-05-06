'use client'

import BudgetProgress from '@/components/budgets/budget-progress'
import ExpenseChart from '@/components/dashboard/expense-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import RecentTransactions from '@/components/dashboard/recent-transactions'

type Transaction = {
  id: string
  content: string
  type: string
  date: string
  value: number
  isIncome: boolean
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold tracking-tight text-[#003C45]">TỔNG QUAN</h2>
        <Link
          href="/transactions/new"
          className="flex items-center gap-2 bg-[#003C45] text-[#F4FAB9] font-bold px-4 py-2 rounded-md hover:bg-[#00262c] transition"
        >
          <Plus className="h-4 w-4" /> Thêm giao dịch
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="tab-custom text-[#545454] data-[state=active]:text-[#545454]">
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="analytics" className="tab-custom text-[#545454] data-[state=active]:text-[#545454]">
            Phân tích
          </TabsTrigger>
          <TabsTrigger value="budgets" className="tab-custom text-[#545454] data-[state=active]:text-[#545454]">
            Ngân sách
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-2 border-[#003C454D]">
              <CardHeader>
                <CardTitle className="text-[#003C45]">Giao dịch gần đây</CardTitle>
                <CardDescription className="italic">5 giao dịch gần nhất của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentTransactions />
              </CardContent>
            </Card>

            <Card className="col-span-3 border-2 border-[#003C454D]">
              <CardHeader>
                <CardTitle className="text-[#003C45]">Chi tiêu theo danh mục</CardTitle>
                <CardDescription className="italic">Phân bổ chi tiêu trong tháng này</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ChartSkeleton />}>
                  <ExpenseChart />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="border-2 border-[#003C454D]">
            <CardHeader>
              <CardTitle className="text-[#003C45]">Phân tích chi tiêu</CardTitle>
              <CardDescription className="italic">Phân tích chi tiết chi tiêu của bạn theo thời gian</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <Suspense fallback={<ChartSkeleton height={300} />}>
                <ExpenseChart />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <Card className="border-2 border-[#003C454D]">
            <CardHeader>
              <CardTitle className="text-[#003C45]">Ngân sách của bạn</CardTitle>
              <CardDescription className="italic">Theo dõi tiến độ ngân sách hàng tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<BudgetSkeleton />}>
                <BudgetProgress />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ChartSkeleton({ height = 200 }: { height?: number }) {
  return <Skeleton className={`w-full h-[${height}px]`} />
}

function BudgetSkeleton() {
  return (
    <div className="space-y-6">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[150px] border-[#003C454D]" />
              <Skeleton className="h-4 w-[100px] border-[#003C454D]" />
            </div>
            <Skeleton className="h-4 w-full border-[#003C454D]" />
          </div>
        ))}
    </div>
  )
}
