import { Images } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/utils'
import { Badge } from '../ui/badge'

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedImage = images[selectedIndex] ?? images[0]

  return (
    <div className="grid gap-3 lg:grid-cols-[1.45fr_0.55fr]">
      <div className="relative overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <img src={selectedImage} alt={title} className="h-80 w-full object-cover sm:h-[460px] lg:h-[520px]" />
        <Badge tone="gray" className="absolute bottom-4 left-4 gap-1 bg-white/95">
          <Images className="h-3.5 w-3.5" />
          {selectedIndex + 1} / {images.length}
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-3 lg:grid-cols-1">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'overflow-hidden rounded-md border bg-white text-left transition',
              selectedIndex === index ? 'border-[#166534] ring-2 ring-[#DCFCE7]' : 'border-[#E5E7EB] hover:border-[#166534]',
            )}
            aria-label={`Ver foto ${index + 1}`}
          >
            <img src={image} alt="" className="h-20 w-full object-cover sm:h-24 lg:h-[124px]" />
          </button>
        ))}
      </div>
    </div>
  )
}
