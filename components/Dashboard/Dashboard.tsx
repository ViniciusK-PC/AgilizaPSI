'use client'

import { DollarSign, Users, ShoppingCart, TrendingUp, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'





export default function Dashboard() {
  const metricsData = [
    {
      title: 'Total Revenue',
      icon: <DollarSign className="w-5 h-5" />,
      value: '$45,231.89',
      change: '+20.1% from last month',
    },
    {
      title: 'Subscriptions',
      icon: <Users className="w-5 h-5" />,
      value: '+2350',
      change: '+180.1% from last month',
    },
    {
      title: 'Sales',
      icon: <ShoppingCart className="w-5 h-5" />,
      value: '+12,234',
      change: '+19% from last month',
    },
    {
      title: 'Active Now',
      icon: <TrendingUp className="w-5 h-5" />,
      value: '+573',
      change: '+201 since last hour',
    },
  ]

  const transactions = [
    {
      id: 1,
      customer: 'Liam Johnson',
      email: 'liam@example.com',
      amount: '$250.00',
    },
    {
      id: 2,
      customer: 'Olivia Smith',
      email: 'olivia@example.com',
      amount: '$150.00',
    },
    {
      id: 3,
      customer: 'Noah Williams',
      email: 'noah@example.com',
      amount: '$350.00',
    },
    {
      id: 4,
      customer: 'Emma Brown',
      email: 'emma@example.com',
      amount: '$450.00',
    },
  ]

  const recentSales = [
    {
      id: 1,
      name: 'Olivia Martin',
      email: 'olivia.martin@email.com',
      amount: '+$1,999.00',
      initials: 'OM',
    },
    {
      id: 2,
      name: 'Jackson Lee',
      email: 'jackson.lee@email.com',
      amount: '+$39.00',
      initials: 'JL',
    },
    {
      id: 3,
      name: 'Isabella Nguyen',
      email: 'isabella.nguyen@email.com',
      amount: '+$299.00',
      initials: 'IN',
    },
    {
      id: 4,
      name: 'William Kim',
      email: 'william.kim@email.com',
      amount: '+$99.00',
      initials: 'WK',
    },
    {
      id: 5,
      name: 'Sofia Davis',
      email: 'sofia.davis@email.com',
      amount: '+$39.00',
      initials: 'SD',
    },
  ]

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        {/* <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div> */}
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsData.map((metric) => (
            <Card key={metric.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {metric.title}
                </CardTitle>
                <div className="text-muted-foreground">{metric.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-card-foreground">Transactions</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Recent transactions from your store.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  View All <ArrowUpRight className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-foreground">Customer</TableHead>
                      <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-card-foreground">{transaction.customer}</p>
                            <p className="text-sm text-muted-foreground">{transaction.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-card-foreground">
                          {transaction.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sales */}
          <div>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Sales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-primary/20">
                      <AvatarFallback className="text-sm font-semibold text-primary">
                        {sale.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{sale.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{sale.email}</p>
                    </div>
                    <p className="text-sm font-semibold text-card-foreground whitespace-nowrap">
                      {sale.amount}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
