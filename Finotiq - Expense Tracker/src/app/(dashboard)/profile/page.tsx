import ProfileForm from '@/components/forms/profile-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const user = session.user

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold tracking-tight text-[#003C45]">HỒ SƠ</h2>
      </div>

      <Tabs defaultValue="profile">
        <TabsContent value="profile" className="space-y-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-2 border-[#003C454D]">
            <div>
              <h2 className="text-lg font-semibold text-[#003C45] mb-1">Thông tin cá nhân</h2>
              <p className="text-sm text-muted-foreground mb-5 italic">Quản lý thông tin cá nhân của bạn</p>
              <Suspense fallback={<ProfileFormSkeleton />}>
                <ProfileForm user={user} />
              </Suspense>
            </div>

            <div className="h-fit">
              <h2 className="text-lg font-semibold text-[#003C45] mb-1">Tài khoản</h2>
              <p className="text-sm text-muted-foreground mb-5 italic">Xem thông tin tài khoản của bạn</p>
              <div className="text-sm space-y-4">
                <div>
                  <span className="font-semibold text-[#003C45]">Email:</span>
                  <br />
                  <span className="italic text-[#545454]">{user.email}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#003C45] mb-3">Ngày tạo tài khoản:</span>
                  <br />
                  <span className="italic text-[#545454]">
                    {new Date(user.created_at!).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-[100px] mt-6" />
    </div>
  )
}
