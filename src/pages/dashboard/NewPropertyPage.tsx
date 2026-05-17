import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { useAuth } from '../../contexts/AuthContext'
import { propertyTypes } from '../../data/mockData'
import { fetchMyAdvisorProfile } from '../../lib/propertyService'
import { supabase } from '../../lib/supabase'
import { slugify } from '../../lib/utils'

const defaultImage =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'

type SelectedImage = {
  file: File
  previewUrl: string
}

export function NewPropertyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [currentStep, setCurrentStep] = useState('')
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [form, setForm] = useState({
    title: '',
    operationType: 'venta',
    propertyType: 'Casa',
    price: '',
    currency: 'MXN',
    city: 'Hermosillo',
    neighborhood: '',
    zone: '',
    addressApprox: '',
    lat: '29.0892',
    lng: '-110.9613',
    description: '',
    whatsapp: '',
    bedrooms: '',
    bathrooms: '',
    halfBathrooms: '',
    parkingSpaces: '',
    landM2: '',
    constructionM2: '',
    ageYears: '',
    amenities: '',
  })

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [selectedImages])

  const handleImages = (files: FileList | null) => {
    if (!files) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024
    const incoming = Array.from(files)
    const invalid = incoming.find((file) => !allowedTypes.includes(file.type) || file.size > maxSize)

    if (invalid) {
      setMessage(`La foto "${invalid.name}" debe ser JPG, PNG o WebP y pesar maximo 5 MB.`)
      return
    }

    const nextImages = incoming
      .slice(0, 10)
      .map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }))

    selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    setSelectedImages(nextImages)
  }

  const removeImage = (index: number) => {
    setSelectedImages((current) => {
      current[index] && URL.revokeObjectURL(current[index].previewUrl)
      return current.filter((_, currentIndex) => currentIndex !== index)
    })
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    setCurrentStep('')

    if (!supabase || !user) {
      setMessage('No hay sesion o Supabase no esta configurado.')
      return
    }

    if (!selectedImages.length) {
      setMessage('Agrega al menos una foto de la propiedad.')
      return
    }

    setLoading(true)
    let step = ''
    const setStep = (nextStep: string) => {
      step = nextStep
      setCurrentStep(nextStep)
    }
    try {
      setStep('Buscando tu perfil de asesor...')
      const advisor = await fetchMyAdvisorProfile(user.id)
      if (!advisor) throw new Error('No encontramos tu perfil de asesor.')

      setStep('Creando propiedad en Supabase...')
      const slug = `${slugify(form.title)}-${Date.now().toString(36)}`
      const { data, error } = await supabase
        .from('properties')
        .insert({
          advisor_id: advisor.id,
          title: form.title,
          slug,
          description: form.description,
          operation_type: form.operationType,
          property_type: form.propertyType,
          price: Number(form.price),
          currency: form.currency,
          city: form.city,
          neighborhood: form.neighborhood,
          zone: form.zone,
          address_approx: form.addressApprox,
          lat: Number(form.lat),
          lng: Number(form.lng),
          bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
          bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
          half_bathrooms: form.halfBathrooms ? Number(form.halfBathrooms) : null,
          parking_spaces: form.parkingSpaces ? Number(form.parkingSpaces) : null,
          land_m2: form.landM2 ? Number(form.landM2) : null,
          construction_m2: form.constructionM2 ? Number(form.constructionM2) : null,
          age_years: form.ageYears ? Number(form.ageYears) : null,
          amenities: form.amenities
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          status: 'pending',
        })
        .select('id')
        .single()

      if (error) throw new Error(`No se pudo crear la propiedad: ${error.message}`)

      const imageRows = []
      for (const [index, image] of selectedImages.entries()) {
        setStep(`Subiendo foto ${index + 1} de ${selectedImages.length}...`)
        const extension = image.file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
        const path = `${advisor.id}/${data.id}/${Date.now()}-${index}.${extension}`
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(path, image.file, {
            cacheControl: '3600',
            upsert: false,
            contentType: image.file.type,
          })

        if (uploadError) throw new Error(`No se pudo subir "${image.file.name}": ${uploadError.message}`)

        const { data: publicUrlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(path)

        imageRows.push({
          property_id: data.id,
          image_url: publicUrlData.publicUrl,
          sort_order: index,
          is_cover: index === 0,
        })
      }

      setStep('Guardando referencias de fotos...')
      const { error: imageError } = await supabase.from('property_images').insert(imageRows)

      if (imageError) throw new Error(`No se pudieron guardar las fotos: ${imageError.message}`)

      navigate('/dashboard/propiedades')
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'No se pudo crear la propiedad.'
      setMessage(step ? `${step} ${detail}` : detail)
    } finally {
      setLoading(false)
      setCurrentStep('')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#111827]">Nueva propiedad</h1>
        <p className="mt-2 text-[#6B7280]">Se guardara en Supabase con estado pending hasta que admin la apruebe.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 rounded-lg border border-[#E5E7EB] bg-white p-6">
        <Section title="Datos principales">
          <Input required placeholder="Titulo" value={form.title} onChange={(event) => update('title', event.target.value)} />
          <Select value={form.operationType} onChange={(event) => update('operationType', event.target.value)}>
            <option value="venta">Venta</option>
            <option value="renta">Renta</option>
          </Select>
          <Select value={form.propertyType} onChange={(event) => update('propertyType', event.target.value)}>
            {propertyTypes.filter((type) => type !== 'Todos').map((type) => <option key={type}>{type}</option>)}
          </Select>
          <Input required type="number" placeholder="Precio" value={form.price} onChange={(event) => update('price', event.target.value)} />
          <Select value={form.currency} onChange={(event) => update('currency', event.target.value)}>
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </Select>
          <Input placeholder="WhatsApp de contacto" value={form.whatsapp} onChange={(event) => update('whatsapp', event.target.value)} />
        </Section>

        <Section title="Ubicacion">
          <Input required placeholder="Ciudad" value={form.city} onChange={(event) => update('city', event.target.value)} />
          <Input required placeholder="Colonia" value={form.neighborhood} onChange={(event) => update('neighborhood', event.target.value)} />
          <Input required placeholder="Zona" value={form.zone} onChange={(event) => update('zone', event.target.value)} />
          <Input required placeholder="Direccion aproximada" value={form.addressApprox} onChange={(event) => update('addressApprox', event.target.value)} />
          <Input required type="number" step="any" placeholder="Latitud" value={form.lat} onChange={(event) => update('lat', event.target.value)} />
          <Input required type="number" step="any" placeholder="Longitud" value={form.lng} onChange={(event) => update('lng', event.target.value)} />
        </Section>

        <Section title="Caracteristicas">
          <Input type="number" placeholder="Recamaras" value={form.bedrooms} onChange={(event) => update('bedrooms', event.target.value)} />
          <Input type="number" step="0.5" placeholder="Banos" value={form.bathrooms} onChange={(event) => update('bathrooms', event.target.value)} />
          <Input type="number" placeholder="Medios banos" value={form.halfBathrooms} onChange={(event) => update('halfBathrooms', event.target.value)} />
          <Input type="number" placeholder="Estacionamientos" value={form.parkingSpaces} onChange={(event) => update('parkingSpaces', event.target.value)} />
          <Input type="number" placeholder="Terreno m2" value={form.landM2} onChange={(event) => update('landM2', event.target.value)} />
          <Input type="number" placeholder="Construccion m2" value={form.constructionM2} onChange={(event) => update('constructionM2', event.target.value)} />
          <Input type="number" placeholder="Antiguedad" value={form.ageYears} onChange={(event) => update('ageYears', event.target.value)} />
          <Input placeholder="Amenidades separadas por coma" value={form.amenities} onChange={(event) => update('amenities', event.target.value)} />
        </Section>

        <div className="grid gap-4">
          <div className="rounded-lg border border-dashed border-[#D1D5DB] bg-[#F8FAF7] p-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#111827]">Fotos de la propiedad</span>
              <span className="mt-1 block text-xs text-[#6B7280]">Sube de 1 a 10 imagenes JPG, PNG o WebP. Maximo 5 MB por archivo.</span>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="mt-3 pt-2"
                onChange={(event) => handleImages(event.target.files)}
              />
            </label>

            {selectedImages.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {selectedImages.map((image, index) => (
                  <div key={image.previewUrl} className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
                    <img src={image.previewUrl} alt="" className="h-32 w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 p-2 text-xs text-[#6B7280]">
                      <span>{index === 0 ? 'Portada' : `Foto ${index + 1}`}</span>
                      <button type="button" className="font-semibold text-[#991B1B]" onClick={() => removeImage(index)}>Quitar</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
                <img src={defaultImage} alt="" className="h-40 w-full object-cover opacity-60" />
                <p className="p-3 text-xs text-[#6B7280]">Vista de referencia. Selecciona fotos reales antes de guardar.</p>
              </div>
            )}
          </div>

          <textarea
            required
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            placeholder="Descripcion"
            className="min-h-36 rounded-md border border-[#D1D5DB] bg-white px-3 py-3 text-sm outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#DCFCE7]"
          />
        </div>

        {currentStep && <p className="rounded-md bg-[#DCFCE7] p-3 text-sm text-[#166534]">{currentStep}</p>}
        {message && <p className="rounded-md bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">{message}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/propiedades')}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Crear propiedad pendiente'}</Button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 font-bold text-[#111827]">{title}</legend>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </fieldset>
  )
}
