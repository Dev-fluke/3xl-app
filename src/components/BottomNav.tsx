"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, CalendarDays, Calculator, Dumbbell, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: CheckSquare, label: 'Check-in' },
    { href: '/calendar', icon: CalendarDays, label: 'Stats' },
    { href: '/progress', icon: Camera, label: 'Photos' },
    { href: '/tdee', icon: Calculator, label: 'TDEE' },
    { href: '/workout', icon: Dumbbell, label: 'Workout' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors",
                isActive ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-indigo-50/50")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
