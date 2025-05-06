'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface Transaction {
  id: string
  amount: number
  type: string
  description: string | null
  date: string
  category: {
    id: string
    name: string
    color: string
  }
}

interface CategoryData {
  id: string
  name: string
  color: string
  amount: number
  percentage: number
  transactions: Array<{
    id: string
    amount: number
    description: string | null
    date: string
  }>
}

export default function CategoryBreakdown() {
  const [data, setData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/transactions')
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch transactions')
        }

        const transactions: Transaction[] = Array.isArray(result.data) ? result.data : []

        if (transactions.length === 0) {
          setData([])
          setLoading(false)
          return
        }

        const expenseTransactions = transactions.filter(t => t.type === 'expense')

        if (expenseTransactions.length === 0) {
          setData([])
          setLoading(false)
          return
        }

        const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

        const categoryMap = new Map<string, CategoryData>()

        expenseTransactions.forEach(transaction => {
          const category = transaction.category
          const existingCategory = categoryMap.get(category.id)

          if (existingCategory) {
            existingCategory.amount += transaction.amount
            existingCategory.transactions.push({
              id: transaction.id,
              amount: transaction.amount,
              description: transaction.description,
              date: transaction.date
            })
          } else {
            categoryMap.set(category.id, {
              id: category.id,
              name: category.name,
              color: category.color,
              amount: transaction.amount,
              percentage: 0,
              transactions: [{
                id: transaction.id,
                amount: transaction.amount,
                description: transaction.description,
                date: transaction.date
              }]
            })
          }
        })

        const categories = Array.from(categoryMap.values())
          .map(category => ({
            ...category,
            percentage: (category.amount / totalExpense) * 100
          }))
          .sort((a, b) => b.amount - a.amount)

        setData(categories)
      } catch (err) {
        console.error('Error calculating category breakdown:', err)
        setError('Không thể tính toán dữ liệu phân tích danh mục')
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
    return <p className="text-muted-foreground mb-4">Không có dữ liệu chi tiêu.</p>
  }

  return (
    <div className="space-y-6">
      {data.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
              <CardTitle className="text-[#003C45]">{category.name}</CardTitle>
            </div>
            <CardDescription className="italic">
              Tổng chi tiêu: {formatCurrency(category.amount)} ({category.percentage.toFixed(1)}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={category.percentage} className="h-2" />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Giao dịch gần đây</h4>
              {category.transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{transaction.description || 'Không có mô tả'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-red-600 font-medium">{formatCurrency(transaction.amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
