'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Search } from 'lucide-react'

type CommandItemType = {
  label: string
  href: string
  icon?: React.ReactNode
  group: string
}

interface CommandMenuProps {
  items?: CommandItemType[]
}

export function CommandMenu({ items = [] }: CommandMenuProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const defaultItems: CommandItemType[] = [
    { group: 'Documentation', label: 'Docs', href: '/docs' },
    { group: 'Documentation', label: 'Components', href: '/components' },
    { group: 'Documentation', label: 'Themes', href: '/themes' },
    { group: 'Documentation', label: 'Examples', href: '/examples' },
    { group: 'Documentation', label: 'Blocks', href: '/blocks' },
    { group: 'Links', label: 'GitHub', href: 'https://github.com' },
  ]

  const commandItems = items.length > 0 ? items : defaultItems

  const groupedItems = commandItems.reduce(
    (acc, item) => {
      const group = item.group || 'General'
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(item)
      return acc
    },
    {} as Record<string, typeof commandItems>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-left gap-2 bg-muted rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-muted/80 transition-colors"
      >
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {/* <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          /> */}
        </svg>
        <span className="text-muted-foreground">Search documentation...</span>
        <kbd className=" ">
          <Search className='w-4 h-4'/>
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search documentation..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {Object.entries(groupedItems).map(([group, groupItems]) => (
            <React.Fragment key={group}>
              <CommandGroup heading={group}>
                {groupItems.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={item.label}
                    onSelect={() => {
                      if (item.href.startsWith('http')) {
                        window.open(item.href, '_blank')
                      } else {
                        router.push(item.href)
                      }
                      setOpen(false)
                    }}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
