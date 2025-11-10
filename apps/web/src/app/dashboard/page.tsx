export const dynamic = "force-dynamic";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { InvoiceTrends } from "@/components/dashboard/invoice-trends";
import { VendorSpend } from "@/components/dashboard/vendor-spend";
import { CategorySpend } from "@/components/dashboard/category-spend";
import { CashOutflow } from "@/components/dashboard/cash-outflow";
import { InvoicesTable } from "@/components/dashboard/invoices-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Flowbit Analytics</h1>
            <nav className="flex gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-primary">
                Dashboard
              </Link>
              <Link href="/chat" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Chat with Data
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsCards />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InvoiceTrends />
              <VendorSpend />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategorySpend />
              <CashOutflow />
            </div>
          </TabsContent>

          <TabsContent value="invoices">
            <InvoicesTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
