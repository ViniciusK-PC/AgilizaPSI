'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { MoreVertical, Plus, Download } from 'lucide-react'

const orders = [
  {
    id: 1,
    customer: 'Sarah Johnson',
    email: 'sarah@example.com',
    type: 'Sale',
    status: 'Fulfilled',
    date: '2023-06-23',
    amount: '$250.00',
  },
  {
    id: 2,
    customer: 'Mike Chen',
    email: 'mike@example.com',
    type: 'Refund',
    status: 'Pending',
    date: '2023-06-22',
    amount: '$125.00',
  },
  {
    id: 3,
    customer: 'Emma Wilson',
    email: 'emma@example.com',
    type: 'Sale',
    status: 'Fulfilled',
    date: '2023-06-21',
    amount: '$450.00',
  },
]

const orderDetails = {
  id: 'Oe31b70H',
  date: 'November 23, 2023',
  items: [
    { name: 'Glimmer Lamps x 2', price: '$250.00' },
    { name: 'Aqua Filters x 1', price: '$49.00' },
  ],
  subtotal: '$299.00',
  shipping: '$5.00',
  tax: '$25.00',
  total: '$329.00',
}

export default function Orders() {
  const [timeRange, setTimeRange] = useState('week')

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Section */}
            <Card className="border p-6">
              <h1 className="text-3xl font-bold tracking-tight">Your Orders</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Introducing Our Dynamic Orders Dashboard for Seamless Management
                and Insightful Analysis.
              </p>
              <Button className="mt-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Create New Order
              </Button>
            </Card>

            {/* Stats Section */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border p-6">
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="mt-2 text-3xl font-bold">$1329</p>
                <p className="mt-2 text-xs font-medium text-green-600">
                  +25% from last week
                </p>
                <div className="mt-4 h-1 w-12 rounded-full bg-primary"></div>
              </Card>
              <Card className="border p-6">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="mt-2 text-3xl font-bold">$5,329</p>
                <p className="mt-2 text-xs font-medium text-red-600">
                  -10% from last month
                </p>
                <div className="mt-4 h-1 w-12 rounded-full bg-destructive"></div>
              </Card>
            </div>

            {/* Time Range and Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                {['week', 'month', 'year'].map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className="capitalize"
                  >
                    {range}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Orders Table */}
            <Card className="border overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold">Orders</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recent orders from your store.
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-t">
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{order.type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === 'Fulfilled'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {order.date}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {order.amount}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View</DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Cancel</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          {/* Right Section - Order Details */}
          <div className="space-y-4">
            <Card className="border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID:</p>
                  <p className="text-2xl font-bold">{orderDetails.id}</p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Date: {orderDetails.date}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Track Order</DropdownMenuItem>
                    <DropdownMenuItem>Print</DropdownMenuItem>
                    <DropdownMenuItem>Cancel</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>

            <Card className="border p-6">
              <h3 className="font-semibold">Order Details</h3>
              <div className="mt-4 space-y-3 border-t pt-4">
                {orderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{orderDetails.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{orderDetails.shipping}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{orderDetails.tax}</span>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{orderDetails.total}</span>
                </div>
              </div>
            </Card>

            <Card className="border p-6">
              <h3 className="font-semibold">Shipping Information</h3>
              <Button className="mt-4 w-full" variant="outline">
                Mailing Information
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
