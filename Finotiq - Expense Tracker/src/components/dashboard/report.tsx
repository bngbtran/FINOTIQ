'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface DashboardData {
  summary: {
    income: number
    expense: number
    balance: number
  }
  recentTransactions: Array<{
    id: string
    amount: number
    type: string
    description: string | null
    date: string
    category: {
      name: string
      color: string
    }
  }>
  expenseByCategory: Array<{
    categoryId: string
    name: string
    color: string
    amount: number
    percentage: number
  }>
  budgets: Array<{
    id: string
    categoryId: string
    categoryName: string
    color: string
    budgetAmount: number
    spentAmount: number
    percentage: number
    remaining: number
  }>
}

export default function Report() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch dashboard data')
        }

        setData(result.data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Không thể tải dữ liệu báo cáo')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  if (!data) {
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#003C45]">Tổng quan</CardTitle>
          <CardDescription className="italic">Tổng hợp thu chi tháng này</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Thu nhập</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data.summary.income)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Chi tiêu</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(data.summary.expense)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Số dư</p>
              <p className="text-2xl font-bold text-[#003C45]">{formatCurrency(data.summary.balance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003C45]">Chi tiêu theo danh mục</CardTitle>
          <CardDescription className="italic">Phân bổ chi tiêu tháng này</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.expenseByCategory.map((category) => (
            <div key={category.categoryId} className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span>{category.name}</span>
                </div>
                <span>{formatCurrency(category.amount)}</span>
              </div>
              <Progress value={category.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003C45]">Ngân sách</CardTitle>
          <CardDescription className="italic">Theo dõi ngân sách tháng này</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.budgets.map((budget) => (
            <div key={budget.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: budget.color }} />
                  <span className="text-[#545454]">{budget.categoryName}</span>
                </div>
                <div className="text-right">
                  <div>
                    {budget.spentAmount.toLocaleString('en-US')} VNĐ / {budget.budgetAmount.toLocaleString('en-US')} VNĐ
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Còn lại: {budget.remaining.toLocaleString('en-US')} VNĐ
                  </div>
                </div>
              </div>
              <Progress value={budget.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003C45]">Giao dịch gần đây</CardTitle>
          <CardDescription className="italic">5 giao dịch mới nhất</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: transaction.category.color }} />
                <div>
                  <p className="text-sm font-medium">{transaction.category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.description || new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
