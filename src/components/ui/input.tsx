import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#166534] focus:ring-2 focus:ring-[#DCFCE7]',
        className,
      )}
      {...props}
    />
  )
}
