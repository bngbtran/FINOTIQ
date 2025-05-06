import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, CreditCard, PieChart, Wallet } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const features = [
    {
      icon: CreditCard,
      title: 'Quản lý giao dịch',
      description: 'Theo dõi chi tiêu và thu nhập dễ dàng với giao diện trực quan',
    },
    {
      icon: PieChart,
      title: 'Báo cáo chi tiết',
      description: 'Hiểu rõ thói quen chi tiêu của bạn với biểu đồ và báo cáo',
    },
    {
      icon: BarChart,
      title: 'Thiết lập ngân sách',
      description: 'Thiết lập mục tiêu tiết kiệm và kiểm soát chi tiêu',
    },
    {
      icon: Wallet,
      title: 'Quản lý danh mục',
      description: 'Tùy chỉnh danh mục theo nhu cầu cá nhân',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center h-16 px-4 lg:px-6 border-b" style={{ backgroundColor: '#F4FAB9' }}>
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/logo_white.png" alt="Finotiq Logo" className="h-12 w-auto" style={{ filter: 'brightness(0) saturate(100%) invert(81%) sepia(100%) saturate(1000%) hue-rotate(10deg) brightness(1.2)' }} />
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Đăng nhập
          </Link>
          <Link href="/register" className="text-sm font-medium hover:underline underline-offset-4">
            Đăng ký
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Quản Lý Chi Tiêu Cá Nhân Thông Minh
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Theo dõi, phân tích và tối ưu hóa tài chính cá nhân một cách dễ dàng
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button>Bắt đầu miễn phí</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Đăng nhập</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Tính năng nổi bật</h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Những tính năng giúp bạn kiểm soát tài chính cá nhân hiệu quả
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 py-4">
                {features.map((feature, index) => (
                  <Card key={index} className="h-full">
                    <CardHeader>
                      <feature.icon className="h-10 w-10 mb-2 text-primary" />
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t items-center px-4 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Chi Tiêu App. Đã đăng ký bản quyền.
        </p>
      </footer>
    </div>
  )
}
