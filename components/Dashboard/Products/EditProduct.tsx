'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, Plus, Share2, Trash2 } from 'lucide-react'

const mockProduct = {
  id: '1',
  name: 'Pro Controller',
  status: 'In stock',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies ultricies, nunc nisl ultricies nunc, nec ultricies nunc nunc.',
  variants: [
    { sku: 'GGPC-001', stock: 100, price: 99.99, sizes: ['S', 'M', 'L'] },
    { sku: 'GGPC-002', stock: 143, price: 99.99, sizes: ['S', 'M', 'L'] },
    { sku: 'GGPC-003', stock: 32, price: 99.99, sizes: ['S', 'M', 'L'] },
  ],
}

export default function EditProduct() {
  const [selectedStatus, setSelectedStatus] = useState('in-stock')
  const [productName, setProductName] = useState(mockProduct.name)
  const [description, setDescription] = useState(mockProduct.description)

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">{mockProduct.name}</h1>
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                {mockProduct.status}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Discard</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Product
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stock Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stock Table */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-2">Stock</h2>
              <p className="text-muted-foreground mb-6">
                Lipsum dolor sit amet, consectetur adipiscing elit
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 text-muted-foreground font-medium">SKU</th>
                      <th className="text-left py-4 px-4 text-muted-foreground font-medium">Stock</th>
                      <th className="text-left py-4 px-4 text-muted-foreground font-medium">Price</th>
                      <th className="text-left py-4 px-4 text-muted-foreground font-medium">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProduct.variants.map((variant) => (
                      <tr key={variant.sku} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4 font-semibold">{variant.sku}</td>
                        <td className="py-4 px-4">{variant.stock}</td>
                        <td className="py-4 px-4">${variant.price}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            {variant.sizes.map((size) => (
                              <button
                                key={size}
                                className="w-10 h-10 border border-border rounded hover:bg-muted transition-colors font-medium text-sm"
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mt-6 mx-auto">
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>

            {/* Product Details */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-2">Product Details</h2>
              <p className="text-muted-foreground mb-6">
                Lipsum dolor sit amet, consectetur adipiscing elit
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Product name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Product description"
                    className="w-full min-h-32 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status & Images */}
          <div className="space-y-6">
            {/* Product Status */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Product Status</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-2">Product Images</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Lipsum dolor sit amet, consectetur adipiscing elit
              </p>

              <div className="flex gap-4">
                <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50">
                  <img
                    src="/modern-tech-product.png"
                    alt="Product"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50">
                  <img
                    src="/modern-tech-product.png"
                    alt="Product"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              </div>

              <button className="mt-4 p-2 hover:bg-muted rounded transition-colors">
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Archive Product */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-2">Archive Product</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Lipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/5 transition-colors">
                <Trash2 className="w-4 h-4" />
                Archive Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
