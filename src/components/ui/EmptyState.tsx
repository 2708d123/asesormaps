import { SearchX } from 'lucide-react'

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-[#D1D5DB] bg-white p-8 text-center">
      <div>
        <SearchX className="mx-auto mb-3 h-10 w-10 text-[#6B7280]" />
        <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-[#6B7280]">{description}</p>
      </div>
    </div>
  )
}
