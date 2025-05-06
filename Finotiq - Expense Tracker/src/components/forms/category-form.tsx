'use client'

import { CategoryFormValues, categorySchema } from '@/types/form-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ColorOption {
  value: string
  label: string
  bg: string
}

const COLORS: ColorOption[] = [
  { value: '#FF5252', label: 'Đỏ', bg: 'bg-[#FF5252]' },
  { value: '#2196F3', label: 'Xanh dương', bg: 'bg-[#2196F3]' },
  { value: '#4CAF50', label: 'Xanh lá', bg: 'bg-[#4CAF50]' },
  { value: '#9C27B0', label: 'Tím', bg: 'bg-[#9C27B0]' },
  { value: '#FF9800', label: 'Cam', bg: 'bg-[#FF9800]' },
  { value: '#E91E63', label: 'Hồng', bg: 'bg-[#E91E63]' },
  { value: '#3F51B5', label: 'Chàm', bg: 'bg-[#3F51B5]' },
  { value: '#607D8B', label: 'Xám xanh', bg: 'bg-[#607D8B]' },
  { value: '#00BCD4', label: 'Xanh ngọc', bg: 'bg-[#00BCD4]' },
  { value: '#FFC107', label: 'Vàng', bg: 'bg-[#FFC107]' },
  { value: '#795548', label: 'Nâu', bg: 'bg-[#795548]' },
  { value: '#009688', label: 'Xanh lục', bg: 'bg-[#009688]' },
]

interface CategoryFormProps {
  category?: {
    id: string
    name: string
    type: 'income' | 'expense'
    color: string
  }
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      type: category?.type || 'expense',
      color: category?.color || COLORS[0].value,
      icon: '',
    },
  })

  const watchType = watch('type')
  const watchColor = watch('color')

  const onSubmit = async (data: CategoryFormValues) => {
    setLoading(true)
    setError(null)

    try {
      const url = category ? `/api/categories/${category.id}` : '/api/categories'
      const method = category ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Có lỗi xảy ra khi lưu danh mục')
      }

      router.refresh()

      if (!category) {
        reset({
          name: '',
          type: watchType,
          color: watchColor,
          icon: '',
        })
      }
    } catch (err) {
      setError((err as Error).message || 'Có lỗi xảy ra khi lưu danh mục')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue={category?.type || 'expense'}
        onValueChange={(value) => setValue('type', value as 'income' | 'expense')}
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="expense" className='tab-custom text-[#545454] data-[state=active]:text-[#545454]'>Chi tiêu</TabsTrigger>
          <TabsTrigger value="income" className='tab-custom text-[#545454] data-[state=active]:text-[#545454]'>Thu nhập</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2 mb-7">
        <Label htmlFor="name" className='text-[#003C45] mb-3'>Tên danh mục:</Label>
        <Input id="name" className='border border-[#003c45]/30 focus:border-[#003c45] focus:outline-none rounded-md bg-white' placeholder="Nhập tên danh mục" {...register('name')} />
        {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2 mb-7">
        <Label htmlFor="color" className='text-[#003C45] mb-3'>Màu sắc:</Label>
        <div className='border border-[#003c45]/30 focus:border-[#003c45] focus:outline-none rounded-md bg-white'><Select defaultValue={category?.color || COLORS[0].value} onValueChange={(value) => setValue('color', value)}>
          <SelectTrigger id="color" className="w-full">
            <SelectValue placeholder="Chọn màu sắc">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: watchColor }} />
                <span>{COLORS.find((c) => c.value === watchColor)?.label || 'Màu tùy chỉnh'}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <div className="grid grid-cols-3 gap-1 p-1">
              {COLORS.map((color) => (
                <Button
                  key={color.value}
                  type="button"
                  variant="outline"
                  className="w-full h-8 p-0 border-none"
                  onClick={() => setValue('color', color.value)}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${watchColor === color.value ? 'ring-2 ring-primary' : ''}`}
                    style={{ backgroundColor: color.value }}
                  />
                </Button>
              ))}
            </div>
          </SelectContent>
        </Select></div>
        {errors.color && <p className="text-sm font-medium text-destructive">{errors.color.message}</p>}
      </div>

      <input type="hidden" {...register('type')} />
      <input type="hidden" {...register('icon')} value="default" />

      <Button type="submit" disabled={loading} className="w-full bg-[#003C45] text-[#F4FAB9] hover:bg-[#003C45] cursor-pointer">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang lưu...
          </>
        ) : category ? (
          'CẬP NHẬT DANH MỤC'
        ) : (
          'TẠO DANH MỤC'
        )}
      </Button>
    </form>
  )
}
