import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-11 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-sm text-[#111827] outline-none transition focus:border-[#166534] focus:ring-2 focus:ring-[#DCFCE7]',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
