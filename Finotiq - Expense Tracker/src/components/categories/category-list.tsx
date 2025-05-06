'use client'

import { ArrowDownCircle, ArrowUpCircle, Edit, Loader2, MoreHorizontal, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import CategoryForm from '@/components/forms/category-form'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon?: string
}

export default function CategoryList() {
  const router = useRouter()
  const [data, setData] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/categories')

        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch categories')
        }

        setData(result.data)
      } catch (err) {
        setError((err as Error).message)
        console.error('Error fetching categories:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete category')
      }

      setData(data.filter((category) => category.id !== id))
      router.refresh()
    } catch (err) {
      setDeleteError((err as Error).message)
      console.error('Error deleting category:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditClick = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setEditingCategory(null)
    setIsDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg">
        <p>Không thể tải danh sách danh mục. Vui lòng thử lại sau.</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    )
  }

  const filteredCategories = data.filter((category) => category.type === activeTab)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="expense" onValueChange={(value) => setActiveTab(value as 'expense' | 'income')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expense" className='tab-custom text-[#545454] data-[state=active]:text-[#545454]'>Chi tiêu</TabsTrigger>
          <TabsTrigger value="income" className='tab-custom text-[#545454] data-[state=active]:text-[#545454]'>Thu nhập</TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="mt-4">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">Không có danh mục chi tiêu nào.</div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    <ArrowDownCircle className="h-3 w-3 text-white" />
                  </div>
                  <span className="ml-3 flex-1 font-medium">{category.name}</span>
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
                      <DropdownMenuItem onClick={() => handleEditClick(category)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
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
                                Bạn có chắc muốn xóa danh mục "{category.name}"? Điều này có thể ảnh hưởng đến các giao
                                dịch đã được gán cho danh mục này.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            {deleteError && <div className="text-sm text-red-500 mt-2">{deleteError}</div>}
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleDelete(category.id)
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
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="income" className="mt-4">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">Không có danh mục thu nhập nào.</div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    <ArrowUpCircle className="h-3 w-3 text-white" />
                  </div>
                  <span className="ml-3 flex-1 font-medium">{category.name}</span>
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
                      <DropdownMenuItem onClick={() => handleEditClick(category)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
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
                                Bạn có chắc muốn xóa danh mục "{category.name}"? Điều này có thể ảnh hưởng đến các giao
                                dịch đã được gán cho danh mục này.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            {deleteError && <div className="text-sm text-red-500 mt-2">{deleteError}</div>}
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleDelete(category.id)
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
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-[#003c45]'>Chỉnh sửa danh mục</DialogTitle>
            <DialogDescription className='italic'>Chỉnh sửa thông tin danh mục</DialogDescription>
          </DialogHeader>
          {editingCategory && <CategoryForm category={editingCategory} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
