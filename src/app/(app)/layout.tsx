"use client"

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wrench,
  Users,
  Menu,
  X,
  Package,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/auth/UserProfile';

const navigation = [
  { name: 'Órdenes de Servicio', href: '/ordenes', icon: Wrench },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Inventario', href: '/inventario', icon: Package },
];

const secondaryNavigation = [
    { name: 'Configuración', href: '/configuracion', icon: Settings },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavLinks = ({onClick}: {onClick?: () => void}) => (
    <>
    <nav className="flex-1 space-y-1 px-2 pb-4">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          onClick={onClick}
          className={cn(
            pathname.startsWith(item.href) && item.href !== '/' || pathname === item.href
              ? 'bg-accent text-accent-foreground'
              : 'text-card-foreground hover:bg-accent/50',
            'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
          )}
        >
          <item.icon
            className="mr-3 h-6 w-6 flex-shrink-0"
            aria-hidden="true"
          />
          {item.name}
        </Link>
      ))}
    </nav>
    <div>
        <nav className="space-y-1 px-2 pb-4">
        {secondaryNavigation.map((item) => (
            <Link
            key={item.name}
            href={item.href}
            onClick={onClick}
            className={cn(
                pathname.startsWith(item.href)
                ? 'bg-accent text-accent-foreground'
                : 'text-card-foreground hover:bg-accent/50',
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
            )}
            >
            <item.icon
                className="mr-3 h-6 w-6 flex-shrink-0"
                aria-hidden="true"
            />
            {item.name}
            </Link>
        ))}
        </nav>
    </div>
    </>
  )


  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Static sidebar for desktop */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <div className="flex flex-grow flex-col overflow-y-auto border-r border-border bg-card pt-5">
            <div className="flex flex-shrink-0 items-center px-4">
              <Wrench className="h-8 w-auto text-primary" />
              <span className="ml-2 text-xl font-semibold font-headline">TecniControl</span>
            </div>
            <div className="mt-5 flex flex-1 flex-col justify-between">
              <NavLinks />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile menu button */}
        <div className="relative z-10 flex h-16 flex-shrink-0 bg-card shadow md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-foreground"
          >
            <span className="sr-only">Abrir barra lateral</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <Wrench className="h-8 w-auto text-primary" />
              <span className="ml-2 text-xl font-semibold font-headline">TecniControl</span>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
                <UserProfile />
            </div>
          </div>
        </div>
        
        {/* Header for desktop */}
        <header className="hidden md:flex md:items-center md:justify-end md:h-16 md:px-6 bg-card border-b">
            <UserProfile />
        </header>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/30"
              aria-hidden="true"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card pt-5 pb-4">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full"
                >
                  <span className="sr-only">Cerrar barra lateral</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </Button>
              </div>
              <div className="flex flex-shrink-0 items-center px-4">
                 <Wrench className="h-8 w-auto text-primary" />
                 <span className="ml-2 text-xl font-semibold font-headline">TecniControl</span>
              </div>
              <div className="mt-5 h-0 flex-1 overflow-y-auto justify-between flex flex-col">
                <NavLinks onClick={() => setSidebarOpen(false)}/>
              </div>
            </div>
            <div className="w-14 flex-shrink-0" aria-hidden="true" />
          </div>
        )}

        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
