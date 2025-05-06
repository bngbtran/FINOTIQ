'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DashboardSummary {
  summary: {
    income: number
    expense: number
    balance: number
  }
}

export default function SummaryCards() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard')

        if (!response.ok) {
          setError('Không thể tải dữ liệu dashboard')
          return
        }

        const result = await response.json()

        if (!result.success) {
          setError(result.error || 'Không thể tải dữ liệu dashboard')
          return
        }

        setData(result.data)
      } catch (err) {
        setError('Không thể tải dữ liệu dashboard')
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

  const { income, expense, balance } = data.summary

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng thu nhập</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(income)}</div>
          <p className="text-xs text-muted-foreground">Trong tháng này</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(expense)}</div>
          <p className="text-xs text-muted-foreground">Trong tháng này</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Số dư</CardTitle>
          <Wallet className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              balance >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-red-600 dark:text-red-500'
            }`}
          >
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">Cập nhật gần nhất</p>
        </CardContent>
      </Card>
    </div>
  )
}
