'use client'

import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Category {
  id: string
  name: string
  type: string
  color: string
}

export default function TransactionFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [type, setType] = useState<string | undefined>(searchParams.get('type') || undefined)
  const [categoryId, setCategoryId] = useState<string | undefined>(searchParams.get('categoryId') || undefined)
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
  )

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')

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
      }
    }

    fetchCategories()
  }, [])

  const applyFilters = () => {
    setIsLoading(true)

    const params = new URLSearchParams()
    params.append('page', '1')

    if (type) params.append('type', type)
    if (categoryId) params.append('categoryId', categoryId)
    if (startDate) params.append('startDate', startDate.toISOString())
    if (endDate) params.append('endDate', endDate.toISOString())

    router.push(`/transactions?${params.toString()}`)
    setIsLoading(false)
  }

  const resetFilters = () => {
    setType(undefined)
    setCategoryId(undefined)
    setStartDate(undefined)
    setEndDate(undefined)

    router.push('/transactions')
  }

  const filteredCategories = type ? categories.filter((category) => category.type === type) : categories

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <div className="flex items-center gap-2 flex-">
            <label className="text-sm font-medium text-[#003C45] min-w-[70px]">Loại:</label>
            <div className='border border-[#003c45]/30 focus:border-[#003c45] focus:outline-none rounded-md bg-white'><Select
              value={type || 'all'}
              onValueChange={(value) => {
                setType(value || undefined)
                setCategoryId(undefined)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Loại giao dịch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="expense">Chi tiêu</SelectItem>
                <SelectItem value="income">Thu nhập</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-nowrap">
            <label className="text-sm font-medium text-[#003C45] min-w-[70px]">Danh mục</label>
            <div className='border border-[#003c45]/30 focus:border-[#003c45] focus:outline-none rounded-md bg-white'>
            <Select value={categoryId || 'all'} onValueChange={(value) => setCategoryId(value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-nowrap pl-4 md:pl-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left border border-[#003c45]/30 focus:border-[#003c45] focus:outline-none rounded-md bg-white', !startDate && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP', { locale: vi }) : <span>Từ ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-nowrap pl-4 md:pl-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left border border-[#003c45]/30 focus:border-[#003c45] focus:outline-none rounded-md bg-white', !endDate && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP', { locale: vi }) : <span>Đến ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={applyFilters} disabled={isLoading} className="bg-[#003C45] text-[#F4FAB9] hover:bg-[#00262c] cursor-pointer">
          Áp dụng bộ lọc
        </Button>
        <Button onClick={resetFilters} disabled={isLoading} className="bg-[#003C45] text-[#F4FAB9] hover:bg-[#00262c] cursor-pointer">
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  )
}
