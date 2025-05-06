'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BudgetItem {
  id: string
  categoryId: string
  categoryName: string
  color: string
  budgetAmount: number
  spentAmount: number
  percentage: number
  remaining: number
}

interface DashboardData {
  budgets: BudgetItem[]
}

export default function BudgetProgress() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard')

        if (!response.ok) {
          setError('Không thể tải dữ liệu ngân sách')
          return
        }

        const result = await response.json()

        if (!result.success) {
          setError(result.error || 'Không thể tải dữ liệu ngân sách')
          return
        }

        setData(result.data)
      } catch (err) {
        setError('Không thể tải dữ liệu ngân sách')
        console.error('Error fetching dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return null
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return null
  }

  const { budgets } = data

  if (!budgets || budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
        <p className="text-muted-foreground mb-4">Bạn chưa thiết lập ngân sách nào cho tháng này.</p>
        <Button asChild className='bg-[#003C45] text-[#f4fab9] hover:bg-[#00262c] transition'>
          <Link href="/budgets">Thiết lập ngân sách</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {budgets.map((budget) => (
        <div key={budget.id} className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: budget.color }} />
              <span className="font-medium text-[#003c45]">{budget.categoryName}</span>
            </div>
            <div className="text-sm font-medium text-[#003c45]">
            {budget.spentAmount.toLocaleString('en-US')} VNĐ / {budget.budgetAmount.toLocaleString('en-US')} VNĐ

            </div>
          </div>
          <Progress
  value={budget.percentage > 100 ? 100 : budget.percentage}
  className="h-2 [&>div]:bg-[#003c45]"
/>

          <div className="flex justify-between text-sm">
            <span className={budget.percentage > 100 ? 'text-red-500' : ''}>
              {budget.percentage.toFixed(0)}% sử dụng
            </span>
            <span className={budget.remaining < 0 ? 'text-red-500' : 'text-green-600'}>
              {budget.remaining < 0 ? 'Vượt ' : 'Còn lại '}
              {Math.abs(budget.remaining).toLocaleString('en-US')} VNĐ
            </span>
          </div>
          {budget.percentage > 100 && (
            <div className="flex items-center gap-2 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Bạn đã vượt ngân sách cho danh mục này!</span>
            </div>
          )}
        </div>
      ))}
      <div className="flex justify-center pt-4">
        <Button asChild variant="outline" className='bg-[#003c45] text-[#f4fab9] hover:bg-[#00262c] hover:text-[#f4fab9] transition'>
          <Link href="/budgets">Quản lý ngân sách</Link>
        </Button>
      </div>
    </div>
  )
}
