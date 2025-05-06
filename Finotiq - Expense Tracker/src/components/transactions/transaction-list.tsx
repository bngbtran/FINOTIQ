'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TransactionWithCategory } from '@/types'
import { ArrowDownCircle, ArrowUpCircle, Edit, Loader2, MoreHorizontal, Trash } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface TransactionListResponse {
  transactions: TransactionWithCategory[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function TransactionList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<TransactionListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
  const type = searchParams.get('type') || undefined
  const categoryId = searchParams.get('categoryId') || undefined
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.append('page', page.toString())

        if (type) params.append('type', type)
        if (categoryId) params.append('categoryId', categoryId)
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await fetch(`/api/transactions?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch transactions')
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch transactions')
        }

        setData(result.data)
      } catch (err) {
        setError((err as Error).message)
        console.error('Error fetching transactions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [page, type, categoryId, startDate, endDate])

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete transaction')
      }

      router.refresh()

      if (data) {
        setData({
          ...data,
          transactions: data.transactions.filter((t) => t.id !== id),
          pagination: {
            ...data.pagination,
            total: data.pagination.total - 1,
          },
        })
      }
    } catch (err) {
      setDeleteError((err as Error).message)
      console.error('Error deleting transaction:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg">
        <p>Không thể tải danh sách giao dịch. Vui lòng thử lại sau.</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    )
  }

  if (!data || data.transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-4">Không có giao dịch nào phù hợp với bộ lọc của bạn.</p>
        <Button className="bg-[#003C45] text-[#F4FAB9] hover:bg-[#00262c]" asChild>
          <Link href="/transactions/new">Thêm giao dịch mới</Link>
        </Button>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='text-[#003c45]'>NGÀY</TableHead>
            <TableHead className='text-[#003c45]'>DANH MỤC</TableHead>
            <TableHead className='text-[#003c45]'>MÔ TẢ</TableHead>
            <TableHead className="text-right text-[#003c45]">SỐ TIỀN</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.transactions.map((transaction) => (
            <TableRow key={transaction.id} className='text-[#545454]'>
              <TableCell className="font-medium">{formatDate(new Date(transaction.date))}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: transaction.category.color }} />
                  {transaction.category.name}
                </div>
              </TableCell>
              <TableCell>{transaction.description || '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {transaction.type === 'income' ? (
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-500 font-bold'
                        : 'text-red-600 dark:text-red-500 font-bold'
                    }
                  >
                    {Number(transaction.amount).toLocaleString('en-EN') + ' VNĐ'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Mở menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className='text-[#003c45]'>Hành động</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/transactions/${transaction.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <AlertDialog>
                        <AlertDialogTrigger className="w-full flex items-center text-left px-2 py-1.5 text-sm text-red-600 dark:text-red-400">
                          <Trash className="h-4 w-4 mr-2" />
                          Xóa
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc muốn xóa giao dịch này? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          {deleteError && <div className="text-sm text-red-500 mt-2">{deleteError}</div>}
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e: any) => {
                                e.preventDefault()
                                handleDelete(transaction.id)
                              }}
                              disabled={isDeleting}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Đang xóa...
                                </>
                              ) : (
                                'Xóa'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/transactions?page=${Math.max(1, page - 1)}${
                  type ? `&type=${type}` : ''
                }${categoryId ? `&categoryId=${categoryId}` : ''}${
                  startDate ? `&startDate=${startDate}` : ''
                }${endDate ? `&endDate=${endDate}` : ''}`}
                className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, data.pagination.totalPages) }).map((_, i) => {
              let pageNumber

              if (data.pagination.totalPages <= 5) {
                pageNumber = i + 1
              } else if (page <= 3) {
                pageNumber = i + 1
                if (i === 4) pageNumber = data.pagination.totalPages
              } else if (page >= data.pagination.totalPages - 2) {
                pageNumber = data.pagination.totalPages - 4 + i
                if (i === 0) pageNumber = 1
              } else {
                pageNumber = page - 2 + i
                if (i === 0) pageNumber = 1
                if (i === 4) pageNumber = data.pagination.totalPages
              }

              return (
                <PaginationItem key={pageNumber}>
                  {(i === 0 && pageNumber > 1 && pageNumber !== 1) ||
                  (i === 4 && pageNumber < data.pagination.totalPages && pageNumber !== data.pagination.totalPages) ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href={`/transactions?page=${pageNumber}${
                        type ? `&type=${type}` : ''
                      }${categoryId ? `&categoryId=${categoryId}` : ''}${
                        startDate ? `&startDate=${startDate}` : ''
                      }${endDate ? `&endDate=${endDate}` : ''}`}
                      isActive={pageNumber === page}
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                href={`/transactions?page=${Math.min(data.pagination.totalPages, page + 1)}${
                  type ? `&type=${type}` : ''
                }${categoryId ? `&categoryId=${categoryId}` : ''}${
                  startDate ? `&startDate=${startDate}` : ''
                }${endDate ? `&endDate=${endDate}` : ''}`}
                className={page >= data.pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
