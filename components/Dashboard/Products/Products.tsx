
"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MoreVertical, Download, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Product {
  id: string
  name: string
  status: 'Active' | 'Draft' | 'Archived'
  price: number
  totalSales: number
  createdAt: string
  image: string
}

const products: Product[] = [
  {
    id: '1',
    name: 'Laser Lemonade Machine',
    status: 'Draft',
    price: 499.99,
    totalSales: 25,
    createdAt: '2023-07-12 10:42 AM',
    image: '/laser-lemonade-machine.jpg',
  },
  {
    id: '2',
    name: 'Hypernova Headphones',
    status: 'Active',
    price: 129.99,
    totalSales: 100,
    createdAt: '2023-10-18 03:21 PM',
    image: '/hypernova-headphones.jpg',
  },
  {
    id: '3',
    name: 'AeroGlow Desk Lamp',
    status: 'Active',
    price: 39.99,
    totalSales: 50,
    createdAt: '2023-11-29 08:15 AM',
    image: '/aeroglow-desk-lamp.jpg',
  },
]

const tabs = ['All', 'Active', 'Draft', 'Archived']

export default function Products() {
  const [activeTab, setActiveTab] = useState('All')

  const filteredProducts = products.filter((product) => {
    if (activeTab === 'All') return true
    return product.status === activeTab
  })

  return (
    <main className="flex-1 bg-background">
      <div className="space-y-6 p-8">
        {/* Header with tabs and actions */}
        <div className="space-y-4">
          {/* Tab navigation */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-foreground border-b-2 border-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Title and description */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground">
              Manage your products and view their sales performance.
            </p>
          </div>
        </div>

        {/* Products table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total Sales</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Created at</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'Draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{product.totalSales}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{product.createdAt}</td>
                  <td className="px-6 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-muted rounded transition-colors">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </div>
    </main>
  )
}
