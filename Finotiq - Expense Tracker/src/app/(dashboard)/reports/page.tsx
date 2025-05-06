'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MonthlyReport from '@/components/reports/monthly-report'
import CategoryBreakdown from '@/components/reports/category-breakdown'
import TrendChart from '@/components/reports/trend-chart'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold tracking-tight text-[#003C45]">BÁO CÁO</h2>
      </div>

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly" className='tab-custom text-[#545454] data-[state=active]:text-[#545454]'>Báo cáo tháng</TabsTrigger>
          <TabsTrigger value="categories" className='tab-custom text-[#545454] data-[state=active]:text-[#545454]'>Phân tích danh mục</TabsTrigger>
          <TabsTrigger value="trends" className='tab-custom text-[#545454] data-[state=active]:text-[#545454]'>Xu hướng</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <MonthlyReport />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryBreakdown />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <TrendChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}
