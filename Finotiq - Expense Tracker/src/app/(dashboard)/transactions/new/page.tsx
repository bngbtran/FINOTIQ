'use client'

import TransactionForm from '@/components/forms/transaction-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function NewTransactionPage() {
  const router = useRouter()
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
      <h2 className="text-4xl font-bold tracking-tight text-[#003C45]">TẠO GIAO DỊCH</h2>
        <Button
          className="flex items-center gap-2 bg-[#003C45] text-[#F4FAB9] font-bold px-4 py-2 rounded-md hover:bg-[#00262c] transition cursor-pointer"
          onClick={() => router.back()}
        >
          <span className="mr-2">←</span> Quay lại
        </Button>
      </div>
      <Suspense fallback={<FormSkeleton />}>
        <TransactionForm />
      </Suspense>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-4 border rounded-lg p-6">
      <Skeleton className="h-8 w-[250px]" />
      <Skeleton className="h-4 w-[350px]" />
      <div className="pt-4 space-y-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="flex justify-between pt-4">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
    </div>
  )
}
