'use client'

import { cn } from '@/lib/utils'
import { TransactionFormValues, transactionSchema } from '@/types/form-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { env } from 'process'

interface CategoryOption {
  id: string
  name: string
  type: string
  color: string
}

interface TransactionFormProps {
  transaction?: {
    id: string
    amount: number
    type: string
    categoryId: string
    description: string | null
    date: Date
  }
}

export default function TransactionForm({ transaction }: TransactionFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [transactionType, setTransactionType] = useState<string>(transaction?.type || 'expense')
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [billInfo, setBillInfo] = useState<{
    amount: string
    date: string
    description: string
    category: string
  } | null>(null)
  const [showBillModal, setShowBillModal] = useState(false)
  const [loadingBill, setLoadingBill] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: transaction?.amount || 0,
      type: transaction?.type || 'expense',
      categoryId: transaction?.categoryId || '',
      description: transaction?.description || '',
      date: transaction?.date ? new Date(transaction.date) : new Date(),
    },
  })

  const watchType = watch('type')

  useEffect(() => {
    setTransactionType(watchType)
    const currentCategoryId = watch('categoryId')
    if (currentCategoryId) {
      const category = categories.find((c) => c.id === currentCategoryId)
      if (category && category.type !== watchType) {
        setValue('categoryId', '')
      }
    }
  }, [watchType, categories, setValue, watch])

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [supabase])

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
        setError('Không thể tải danh mục. Vui lòng thử lại.')
      }
    }

    fetchCategories()
  }, [])

  const onSubmit = async (data: TransactionFormValues) => {
    setLoading(true)
    setError(null)

    try {
      if (!userId) {
        throw new Error('Bạn cần đăng nhập để thực hiện thao tác này')
      }

      const url = transaction ? `/api/transactions/${transaction.id}` : '/api/transactions'
      const method = transaction ? 'PATCH' : 'POST'

      const date = new Date(data.date)
      const isoDate = date.toISOString()

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(data.amount),
          type: data.type,
          categoryId: data.categoryId,
          date: isoDate,
          userId,
          description: data.description || null,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Có lỗi xảy ra khi lưu giao dịch')
      }

      router.push('/transactions')
      router.refresh()
    } catch (err) {
      setError((err as Error).message || 'Có lỗi xảy ra khi lưu giao dịch')
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter((category) => category.type === transactionType)

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string | null
        if (result) resolve(result.split(',')[1])
        else reject('No result')
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function recognizeBillWithGoogleVision(file: File): Promise<{ text: string; blocks: any[] }> {
    const apiKey = process.env.NEXT_PUBLIC_VISION_API_KEY
    if (!apiKey) {
      throw new Error('VISION_API_KEY is not defined in environment variables')
    }
    const base64 = await fileToBase64(file)

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      }),
    })
    const result = await response.json()
    const annotation = result.responses?.[0]?.fullTextAnnotation
    const text = annotation?.text || ''
    const blocks = result.responses?.[0]?.fullTextAnnotation?.pages?.[0]?.blocks || []
    return { text, blocks }
  }

  function extractBillInfo(text: string) {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const moneyKeywords = [
      'tổng dịch vụ',
      'tổng thanh toán',
      'tổng cộng',
      'thanh toán',
      'total',
      'cash',
      'tổng',
      'tổng:',
      'Tổng:',
      'Tổng',
    ]
    let amount = ''
    for (const kw of moneyKeywords) {
      const line = lines.find((l) => l.toLowerCase().includes(kw))
      if (line) {
        const matches = line.match(/([0-9][0-9.,]*)/g)
        if (matches) {
          amount = matches.reduce(
            (max, cur) =>
              Number(cur.replace(/[^0-9.]/g, '').replace(/,/g, '')) >
              Number(max.replace(/[^0-9.]/g, '').replace(/,/g, ''))
                ? cur
                : max,
            '0',
          )
          break
        }
      }
    }
    if (!amount) {
      const matches = text.match(/([0-9][0-9.,]{3,})/g)
      if (matches) {
        amount = matches[matches.length - 1]
      }
    }
    if (Number(amount.replace(/[^0-9.]/g, '').replace(/,/g, '')) <= 10000) {
      const matches = text.match(/([0-9][0-9.,]{3,})/g)
      if (matches) {
        for (let i = matches.length - 1; i >= 0; i--) {
          const num = Number(matches[i].replace(/[^0-9.]/g, '').replace(/,/g, ''))
          if (num > 10000) {
            amount = matches[i]
            break
          }
        }
      }
    }

    const foodKeywords = [
      'ăn uống',
      'restaurant',
      'rest',
      'food',
      'cafe',
      'coffee',
      'quán ăn',
      'RES',
      'res',
      'Cà phê',
      'CÀ PHÊ',
    ]
    let category = ''
    if (foodKeywords.some((k) => text.toLowerCase().includes(k))) {
      category = 'Ăn uống'
    }

    let content = lines[0] || ''
    for (const line of lines) {
      const upperCount = (line.match(/[A-Z]/g) || []).length
      if (upperCount > 0) {
        content = line
        break
      }
    }
    return {
      amount: amount.replace(/[^0-9.]/g, '').replace(/,/g, ''),
      category,
      description: content,
    }
  }

  const handleAnalyzeBill = async () => {
    if (!selectedFile) return
    setLoadingBill(true)
    const { text, blocks } = await recognizeBillWithGoogleVision(selectedFile)
    setLoadingBill(false)
    const extracted = extractBillInfo(text)
    setBillInfo({
      amount: extracted.amount,
      date: '',
      description: extracted.description,
      category: extracted.category,
    })
    setShowBillModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      const fileUrl = URL.createObjectURL(e.target.files[0])
      setPreviewUrl(fileUrl)
    }
  }

  return (
    <Card className="w-full max-w-none mx-auto border-2 border-[#003C454D]">
      <div className="px-6 pb-0">
        <h1 className="text-[#003C45] font-bold">{transaction ? 'Chỉnh sửa giao dịch' : 'Tạo giao dịch mới'}</h1>
        <span className="italic text-sm text-muted-foreground mt-0">
          {transaction ? 'Cập nhật thông tin giao dịch của bạn' : 'Nhập thông tin cho giao dịch mới'}
        </span>
      </div>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form id="transaction-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 min-w-[320px] space-y-4">
              <Tabs
                defaultValue={transaction?.type || 'expense'}
                onValueChange={(value) => setValue('type', value as 'income' | 'expense')}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expense" className="tab-custom text-[] data-[state=active]:text-[#545454]">
                    Chi tiêu
                  </TabsTrigger>
                  <TabsTrigger value="income" className="tab-custom text-[] data-[state=active]:text-[#545454]">
                    Thu nhập
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                <div className="space-y-2 mb-7">
                  <Label htmlFor="amount" className="text-[#003C45] font-semibold mb-3">
                    Số tiền:
                  </Label>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={watch('amount')?.toLocaleString('en-US') || ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, '')
                      if (!isNaN(+raw)) setValue('amount', +raw)
                    }}
                    className="border border-[#003c45]/30 focus:border-[#003c45] focus:outline-none rounded-md bg-white"
                  />

                  {errors.amount && <p className="text-sm font-medium text-destructive">{errors.amount.message}</p>}
                </div>

                <div className="space-y-2 mb-7">
                  <Label htmlFor="categoryId" className="text-[#003C45] font-semibold mb-3">
                    Danh mục:
                  </Label>
                  <Select
                    defaultValue={transaction?.categoryId || ''}
                    onValueChange={(value) => setValue('categoryId', value)}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.length === 0 ? (
                        <SelectItem value="no-category" disabled>
                          Không có danh mục phù hợp
                        </SelectItem>
                      ) : (
                        filteredCategories.map((category) => (
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
                  {errors.categoryId && (
                    <p className="text-sm font-medium text-destructive">{errors.categoryId.message}</p>
                  )}
                </div>

                <div className="space-y-2 mb-7">
                  <Label htmlFor="date" className="text-[#003C45] font-semibold mb-3">
                    Ngày:
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal border border-[#003c45]/30 focus:border-[#003c45] focus:outline-none rounded-md bg-white',
                          !watch('date') && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch('date') ? (
                          `Ngày ${String(watch('date').getDate()).padStart(2, '0')} Tháng ${String(watch('date').getMonth() + 1).padStart(2, '0')} Năm ${watch('date').getFullYear()}`
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={watch('date')}
                        onSelect={(date) => setValue('date', date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {errors.date && <p className="text-sm font-medium text-destructive">{errors.date.message}</p>}
                </div>

                <div className="space-y-2 mb-7">
                  <Label htmlFor="description" className="text-[#003C45] font-semibold mb-3">
                    Mô tả (tùy chọn):
                  </Label>
                  <Textarea
                    id="description"
                    className="border border-[#003c45]/30 focus:border-[#003c45] focus:outline-none rounded-md bg-white"
                    placeholder="Nhập mô tả cho giao dịch"
                    rows={3}
                    {...register('description')}
                  />
                </div>

                <input type="hidden" {...register('type')} />
              </div>
              <div className="pt-4">
                <Button
                  type="submit"
                  form="transaction-form"
                  disabled={loading}
                  className="w-full bg-[#003C45] hover:bg-[#00262c] text-[#f4fab9] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : transaction ? (
                    'Cập nhật'
                  ) : (
                    'Tạo giao dịch'
                  )}
                </Button>
              </div>
            </div>

            <div className="flex-1 min-w-[320px] flex flex-col items-center justify-center gap-4">
              <div className="w-full flex flex-col items-center">
                <span className="text-center text-muted-foreground mb-2">Hoặc Upload hóa đơn</span>
                <button
                  type="button"
                  className="w-56 h-56 rounded-lg border-2 border-dashed border-[#003C45] flex items-center justify-center text-7xl text-[#E6F2F3] bg-[#003C45] hover:bg-[#00262c] transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    '+'
                  )}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                {selectedFile && !previewUrl && (
                  <span className="mt-2 text-sm text-[#003C45] font-medium">{selectedFile.name}</span>
                )}
              </div>
              <Button
                type="button"
                className={`w-50 cursor-pointer ${selectedFile ? 'bg-[#003C45] text-[#f4fab9] hover:bg-[#00262c]' : 'bg-[#003c45] text-[#f4fab9]'}`}
                disabled={!selectedFile || loadingBill}
                onClick={handleAnalyzeBill}
              >
                {loadingBill ? 'Đang đọc...' : 'Xuất hóa đơn từ ảnh'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>

      <Dialog open={showBillModal} onOpenChange={setShowBillModal}>
        <DialogContent className="max-w-lg">
          <DialogTitle className="text-[#003C45] text-xl font-bold -mb-3">Xác nhận giao dịch mới</DialogTitle>
          <DialogDescription className="mb-4 italic">Đây có phải là giao dịch bạn vừa thêm không ?</DialogDescription>
          <div className="mb-2">
            <div className="font-semibold text-[#003C45] mb-3">Nội dung:</div>
            <div className="bg-[#F5F8F9] rounded px-3 py-2 text-sm text-gray-800 whitespace-pre-line">
              {billInfo?.category + ' tại ' + billInfo?.description || ''}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 mb-6">
            <div>
              <div className="text-xs mb-1 text-[#545454]">Số tiền:</div>
              <div className="font-semibold text-[#003C45]">
                {Number(billInfo?.amount || 0).toLocaleString('en-US')} VND
              </div>
            </div>
            <div>
              <div className="text-xs text-[#545454] mb-1">Loại:</div>
              <div className="font-semibold text-[#003C45]">Chi tiêu</div>
            </div>
            <div>
              <div className="text-xs text-[#545454] mb-1">Danh mục:</div>
              <div className="font-semibold text-[#003C45]">{billInfo?.category || 'Khác'}</div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowBillModal(false)
                setSelectedFile(null)
                setPreviewUrl(null)
              }}
              className="border-[#003C45] text-[#003c45] hover:bg-[#003c452d] hover:border-[#003c452d] cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                setValue('amount', Number(billInfo?.amount || 0))
                setValue('description', billInfo?.description || '')
                setValue('categoryId', billInfo?.category || '')
                setShowBillModal(false)
                setSelectedFile(null)
                setPreviewUrl(null)
              }}
              className="bg-[#003C45] text-[#f4fab9] hover:bg-[#00262c] cursor-pointer"
            >
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
