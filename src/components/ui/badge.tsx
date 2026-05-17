import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'green' | 'gold' | 'gray' | 'red'
}

const tones = {
  green: 'bg-[#DCFCE7] text-[#166534]',
  gold: 'bg-[#FEF3C7] text-[#92400E]',
  gray: 'bg-[#F3F4F6] text-[#374151]',
  red: 'bg-[#FEE2E2] text-[#991B1B]',
}

export function Badge({ className, tone = 'gray', ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone], className)}
      {...props}
    />
  )
}
