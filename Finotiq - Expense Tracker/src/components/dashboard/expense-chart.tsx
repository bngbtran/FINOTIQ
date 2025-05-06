'use client'

import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CategoryExpense {
  categoryId: string
  name: string
  color: string
  amount: number
  percentage: number
}

interface DashboardData {
  expenseByCategory: CategoryExpense[]
}

interface CustomizedLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  index: number
}

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomizedLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function ExpenseChart() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard')

        if (!response.ok) {
          setError('Không thể tải dữ liệu biểu đồ')
          return
        }

        const result = await response.json()

        if (!result.success) {
          setError(result.error || 'Không thể tải dữ liệu biểu đồ')
          return
        }

        setData(result.data)
      } catch (err) {
        setError('Không thể tải dữ liệu biểu đồ')
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

  const { expenseByCategory } = data

  if (!expenseByCategory || expenseByCategory.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-center p-4">
        <p className="text-muted-foreground">Không có dữ liệu chi tiêu trong tháng này.</p>
      </div>
    )
  }

  const chartData = expenseByCategory.map((item) => ({
    name: item.name,
    value: item.amount,
    color: item.color,
    percentage: item.percentage,
  }))

  return (
    <div className="h-[400px] w-full">
      {' '}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value.toLocaleString('en-EN')} VNĐ`, 'Chi tiêu']} />

          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            formatter={(value, entry, index) => (
              <span className="text-sm">
                {value} ({chartData[index].percentage.toFixed(0)}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
