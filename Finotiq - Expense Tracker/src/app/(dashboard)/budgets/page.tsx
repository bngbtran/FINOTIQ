import BudgetList from '@/components/budgets/budget-list'
import BudgetForm from '@/components/forms/budget-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

export default function BudgetsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold tracking-tight text-[#003C45]">NGÂN SÁCH</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className='border-2 border-[#003C454D]'>
          <CardHeader>
            <CardTitle className='text-[#003c45]'>Thiết lập ngân sách</CardTitle>
            <CardDescription className='italic'>Thiết lập ngân sách theo danh mục và tháng</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<BudgetFormSkeleton />}>
              <BudgetForm />
            </Suspense>
          </CardContent>
        </Card>

        <Card className='border-2 border-[#003C454D]'>
          <CardHeader>
            <CardTitle className='text-[#003C45]'>Ngân sách hiện tại</CardTitle>
            <CardDescription className='italic'>Theo dõi ngân sách tháng này của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<BudgetListSkeleton />}>
              <BudgetList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BudgetFormSkeleton() {
  return (
    <div className="space-y-4">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      <Skeleton className="h-10 w-full mt-6" />
    </div>
  )
}

function BudgetListSkeleton() {
  return (
    <div className="space-y-6">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-[80px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </div>
        ))}
    </div>
  )
}
