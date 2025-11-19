'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SettingsSectionProps {
  title: string
  description: string
  children: React.ReactNode
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default function GeneralSettings() {
  const [storeName, setStoreName] = useState('Your Store Name')

  return (
    <>
      <SettingsSection
        title="Store Name"
        description="Used to identify your store in the marketplace."
      >
        <div className="space-y-4">
          <Input
            placeholder="Store Name"
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            className="max-w-md"
          />
          <Button className="bg-primary text-primary-foreground hover:opacity-90">
            Save
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Plugins Directory"
        description="The directory within your project, in which your plugins are located."
      >
        <div className="space-y-4 text-muted-foreground">
          <p>Configure your plugins directory settings here.</p>
          <Input placeholder="/plugins" className="max-w-md" />
        </div>
      </SettingsSection>
    </>
  )
}
