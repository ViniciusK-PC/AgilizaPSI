'use client'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GeneralSettings from './GeneralSettings'


// const menuItems = ['General', 'Security', 'Integrations', 'Support', 'Organizations', 'Advanced']

enum MenuItems {
  General = 'General',
  Security = 'Security',
  Integrations = 'Integrations',
  Support = 'Support',
  Organizations = 'Organizations',
  Advanced = 'Advanced',
  notselect = 'notselect',
}

const menuItems = Object.values(MenuItems)
menuItems.pop()

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

export default function Settings() {
 
  const [selectedMenu, setSelectedMenu] = useState <MenuItems>(MenuItems.notselect)
   
  const [checkboxes, setCheckboxes] = useState({
    notifications: true,
    emailUpdates: false,
    analytics: true,
  })

  const handleCheckboxChange = (key: keyof typeof checkboxes) => {
    setCheckboxes(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

 let Selectmenu 
  return (
    <div className="flex gap-0">
      {/* Sidebar */}
      <aside className="w-48 border-r border-border bg-card p-6">
        <h2 className="mb-6 text-2xl font-bold">Settings</h2>
        
        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item}
              onClick={() =>{
                setSelectedMenu(item)
                switch(selectedMenu){
                  case MenuItems.General:{
                  Selectmenu = GeneralSettings()
                  }
                  case MenuItems.Security:{
                    Selectmenu = GeneralSettings()
                
                  }
                  case MenuItems.Integrations:{
                    Selectmenu = GeneralSettings()
                    
                  }
                  case MenuItems.Support:{
                  Selectmenu = GeneralSettings()
                   
                  }
                  case MenuItems.Organizations:{
                  Selectmenu = GeneralSettings()
                  
                  }
                  case MenuItems.Advanced:
                }
              }
            }
              

              className={`block w-full text-left px-4 py-2 rounded-md transition-colors ${
                selectedMenu === item
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* <div className='mt-6'>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">Faça alterações na sua conta aqui.</TabsContent>
            <TabsContent value="password">Altere sua senha aqui.</TabsContent>
          </Tabs>
        </div> */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {selectedMenu === 'General' && (
          
          <GeneralSettings />
        )}
      {Selectmenu === "notSelect" && (0)}
        {selectedMenu === 'Security' && (
          <SettingsSection
            title="Security Settings"
            description="Manage your security preferences and options."
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="two-factor"
                  checked={checkboxes.analytics}
                  onCheckedChange={() => handleCheckboxChange('analytics')}
                />
                <Label htmlFor="two-factor" className="cursor-pointer">
                  Enable Two-Factor Authentication
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notifications"
                  checked={checkboxes.notifications}
                  onCheckedChange={() => handleCheckboxChange('notifications')}
                />
                <Label htmlFor="notifications" className="cursor-pointer">
                  Receive security notifications
                </Label>
              </div>
            </div>
          </SettingsSection>
        )}

        {selectedMenu === 'Integrations' && (
          <SettingsSection
            title="Third-Party Integrations"
            description="Connect and manage your integrations."
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="stripe" defaultChecked />
                <Label htmlFor="stripe" className="cursor-pointer">
                  Stripe Integration
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analytics-int"
                  checked={checkboxes.emailUpdates}
                  onCheckedChange={() => handleCheckboxChange('emailUpdates')}
                />
                <Label htmlFor="analytics-int" className="cursor-pointer">
                  Analytics Integration
                </Label>
              </div>
            </div>
          </SettingsSection>
        )}

        {selectedMenu !== 'General' && selectedMenu !== 'Security' && 
        selectedMenu !== 'Integrations' && selectedMenu !== MenuItems.notselect &&(
         <SettingsSection
            title={`${selectedMenu} Settings`}
            description={`Manage your ${selectedMenu.toLowerCase()} preferences.`}
          >
            <p className="text-muted-foreground">Settings for {selectedMenu} section coming soon.</p>
          </SettingsSection>
        )}
      </main>
    </div>
  )
}
