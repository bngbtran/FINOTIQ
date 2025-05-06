'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface Transaction {
  id: string
  amount: number
  type: string
  date: string
}

interface TrendData {
  month: number
  year: number
  income: number
  expense: number
  balance: number
}

export default function TrendChart() {
  const [data, setData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/transactions')
        if (!response.ok) {
          throw new Error('Failed to fetch transactions')
        }

        const result = await response.json()
        if (!result || !result.success) {
          throw new Error(result?.error || 'Failed to fetch transactions')
        }

        const transactions: Transaction[] = Array.isArray(result.data) ? result.data : []

        if (transactions.length === 0) {
          setData([])
          setLoading(false)
          return
        }

        const currentDate = new Date()
        const months: TrendData[] = []

        for (let i = 0; i < 6; i++) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
          const month = date.getMonth() + 1
          const year = date.getFullYear()

          const monthTransactions = transactions.filter(t => {
            try {
              const transactionDate = new Date(t.date)
              return transactionDate.getMonth() + 1 === month && transactionDate.getFullYear() === year
            } catch (e) {
              console.error('Invalid date format:', t.date)
              return false
            }
          })

          const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0)

          const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0)

          months.push({
            month,
            year,
            income,
            expense,
            balance: income - expense
          })
        }

        setData(months.reverse())
      } catch (err) {
        console.error('Error calculating trend data:', err)
        setError('Không thể tính toán dữ liệu xu hướng')
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

  if (data.length === 0) {
    return <p className="text-muted-foreground mb-4">Không có dữ liệu để hiển thị xu hướng.</p>
  }

  const chartData = data.map(trend => ({
    name: `${trend.month}/${trend.year}`,
    income: trend.income,
    expense: trend.expense,
    balance: trend.balance,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#003C45]">Xu hướng chi tiêu</CardTitle>
        <CardDescription className="italic">Phân tích thu chi theo thời gian</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Số tiền']}
                labelFormatter={(label) => `Tháng ${label}`}
              />
              <Area
                type="monotone"
                dataKey="income"
                stackId="1"
                stroke="#4CAF50"
                fill="#4CAF50"
                fillOpacity={0.3}
                name="Thu nhập"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stackId="1"
                stroke="#FF5252"
                fill="#FF5252"
                fillOpacity={0.3}
                name="Chi tiêu"
              />
              <Area
                type="monotone"
                dataKey="balance"
                stackId="1"
                stroke="#2196F3"
                fill="#2196F3"
                fillOpacity={0.3}
                name="Số dư"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
