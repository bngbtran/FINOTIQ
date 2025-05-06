'use client'

import { User } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileFormProps {
  user: User
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [name, setName] = useState<string>(user.user_metadata?.name || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Không thể cập nhật thông tin cá nhân')
      }

      setSuccess('Thông tin cá nhân đã được cập nhật thành công')
      router.refresh()
    } catch (err) {
      setError((err as Error).message || 'Đã xảy ra lỗi khi cập nhật thông tin cá nhân')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert
          variant="default"
          className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2 mb-7">
        <Label htmlFor="email" className='text-[#003c45] mb-3'>Email:</Label>
        <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">Email không thể thay đổi và được sử dụng để đăng nhập</p>
      </div>

      <div className="space-y-2 mb-7">
        <Label htmlFor="name" className='text-[#003c45] mb-3'>Họ và Tên:</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập họ tên của bạn" />
        <p className="text-xs text-muted-foreground">Họ tên của bạn sẽ được hiển thị trong ứng dụng</p>
      </div>

      <Button
  type="submit"
  disabled={loading}
  className="w-full bg-[#003C45] hover:bg-[#002d34] text-[#F4FAB9] font-semibold cursor-pointer"
>
  {loading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Đang lưu...
    </>
  ) : (
    'LƯU THAY ĐỔI'
  )}
</Button>

    </form>
  )
}
