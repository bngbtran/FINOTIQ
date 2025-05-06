import TransactionForm from '@/components/forms/transaction-form'
import { Skeleton } from '@/components/ui/skeleton'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'

export default async function EditTransactionPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return notFound()
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!transaction) {
    return notFound()
  }

  const typedTransaction = {
    id: transaction.id,
    amount: transaction.amount,
    type: transaction.type as 'income' | 'expense',
    categoryId: transaction.categoryId,
    description: transaction.description,
    date: transaction.date,
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold tracking-tight text-[#003C45]">CẬP NHẬT GIAO DỊCH</h2>
        <Button
          className="flex items-center gap-2 bg-[#003C45] text-[#F4FAB9] font-bold px-4 py-2 rounded-md hover:bg-[#00262c] transition cursor-pointer"
          asChild
        >
          <a href="/transactions">
            <span className="mr-2">←</span> Quay lại
          </a>
        </Button>
      </div>

      <Suspense fallback={<FormSkeleton />}>
        <TransactionForm transaction={typedTransaction} />
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
