import { cookies } from 'next/headers'
import SalesSidebar from '@/components/sales/SalesSidebar'

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get('sales_token')?.value ?? ''
  const [, name] = token.split('|')

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <SalesSidebar employeeName={name ?? 'Sales'} />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
