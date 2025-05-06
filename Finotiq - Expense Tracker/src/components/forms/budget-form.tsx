'use client'

import { getCurrentMonthYear, getMonthName } from '@/lib/utils'
import { BudgetFormValues, budgetSchema } from '@/types/form-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CategoryOption {
  id: string
  name: string
  type: string
  color: string
}

export default function BudgetForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryOption[]>([])

  const { month, year } = getCurrentMonthYear()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      month,
      year,
    },
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?type=expense')

        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch categories')
        }

        setCategories(result.data)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Không thể tải danh mục. Vui lòng thử lại.')
      }
    }

    fetchCategories()
  }, [])

  const onSubmit = async (data: BudgetFormValues) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Có lỗi xảy ra khi lưu ngân sách')
      }

      router.refresh()

      setValue('categoryId', '')
      setValue('amount', 0)
    } catch (err) {
      console.error('Error saving budget:', err)
      setError((err as Error).message || 'Có lỗi xảy ra khi lưu ngân sách')
    } finally {
      setLoading(false)
    }
  }

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
  }))

  const currentYear = new Date().getFullYear()
  const yearOptions = [
    { value: currentYear - 1, label: (currentYear - 1).toString() },
    { value: currentYear, label: currentYear.toString() },
    { value: currentYear + 1, label: (currentYear + 1).toString() },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-7">
        <Label htmlFor="categoryId" className="text-[#003C45] font-semibold block mb-3">
          Danh sách danh mục:
        </Label>
        <div className="border border-[#003c45]/30 focus-within:border-[#003c45] rounded-md bg-white">
          <Select value={watch('categoryId')} onValueChange={(value) => setValue('categoryId', value)}>
            <SelectTrigger id="categoryId" className="w-full">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.length === 0 ? (
                <SelectItem value="none" disabled>
                  Không có danh mục chi tiêu.
                </SelectItem>
              ) : (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        {errors.categoryId && <p className="text-sm font-medium text-destructive mt-1">{errors.categoryId.message}</p>}
      </div>

      <div className="flex gap-4 mb-7">
        <div className="flex-1">
          <Label htmlFor="month" className="text-[#003C45] font-semibold block mb-3">
            Tháng:
          </Label>
          <div className="border border-[#003c45]/30 focus-within:border-[#003c45] rounded-md bg-white">
            <Select defaultValue={month.toString()} onValueChange={(value) => setValue('month', parseInt(value))}>
              <SelectTrigger id="month" className="w-full">
                <SelectValue placeholder="Chọn tháng" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1">
          <Label htmlFor="year" className="text-[#003C45] font-semibold block mb-3">
            Năm:
          </Label>
          <div className="border border-[#003c45]/30 focus-within:border-[#003c45] rounded-md bg-white">
            <Select defaultValue={year.toString()} onValueChange={(value) => setValue('year', parseInt(value))}>
              <SelectTrigger id="year" className="w-full">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-7">
        <Label htmlFor="amount" className="text-[#003C45] font-semibold mb-1 block mb-3">
          Số tiền ngân sách:
        </Label>
        <Input
          id="amount"
          type="text"
          placeholder="0"
          value={watch('amount')?.toLocaleString('en-US') || ''}
          onChange={(e) => {
            const raw = e.target.value.replace(/,/g, '').replace(/[^\d]/g, '')
            if (!isNaN(+raw)) setValue('amount', +raw)
          }}
          className="border border-[#003c45]/30 focus:border-[#003c45] focus:outline-none rounded-md bg-white w-full"
        />

        {errors.amount && <p className="text-sm font-medium text-destructive mt-1">{errors.amount.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={loading || categories.length === 0}
        className="w-full bg-[#003C45] text-[#F4FAB9] hover:bg-[#00262c] cursor-pointer mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang lưu...
          </>
        ) : (
          'TẠO NGÂN SÁCH'
        )}
      </Button>
    </form>
  )
}
