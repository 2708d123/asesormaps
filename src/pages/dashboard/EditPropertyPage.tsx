import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { useAuth } from '../../contexts/AuthContext'
import { propertyTypes } from '../../data/mockData'
import { fetchMyPropertyById } from '../../lib/propertyService'
import { supabase } from '../../lib/supabase'
import type { Property } from '../../types'

type SelectedImage = {
  file: File
  previewUrl: string
}

const emptyForm = {
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
  bedrooms: '',
  bathrooms: '',
  halfBathrooms: '',
  parkingSpaces: '',
  landM2: '',
  constructionM2: '',
  ageYears: '',
  amenities: '',
}

export function EditPropertyPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageSaving, setImageSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [imageMessage, setImageMessage] = useState('')
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])

  const loadProperty = async () => {
    if (!user) return
    setLoading(true)
    setMessage('')
    try {
      const result = await fetchMyPropertyById(user.id, id)
      setProperty(result)
      if (!result) {
        setMessage('No encontramos esta propiedad en tu inventario.')
        return
      }
      setForm({
        title: result.title,
        operationType: result.operationType,
        propertyType: result.propertyType,
        price: String(result.price),
        currency: result.currency,
        city: result.city,
        neighborhood: result.neighborhood,
        zone: result.zone,
        addressApprox: result.addressApprox,
        lat: String(result.lat),
        lng: String(result.lng),
        description: result.description,
        bedrooms: result.bedrooms ? String(result.bedrooms) : '',
        bathrooms: result.bathrooms ? String(result.bathrooms) : '',
        halfBathrooms: result.halfBathrooms ? String(result.halfBathrooms) : '',
        parkingSpaces: result.parkingSpaces ? String(result.parkingSpaces) : '',
        landM2: result.landM2 ? String(result.landM2) : '',
        constructionM2: result.constructionM2 ? String(result.constructionM2) : '',
        ageYears: result.ageYears ? String(result.ageYears) : '',
        amenities: result.amenities.join(', '),
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cargar la propiedad.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    void loadProperty().finally(() => {
      if (cancelled) return
    })
    return () => {
      cancelled = true
    }
  }, [user, id])

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [selectedImages])

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const markPropertyForReview = async () => {
    if (!supabase || !property || property.status !== 'active') return
    await supabase.from('properties').update({ status: 'pending', updated_at: new Date().toISOString() }).eq('id', property.id)
  }

  const setCoverImage = async (imageId: string) => {
    if (!supabase || !property) return
    setImageSaving(true)
    setImageMessage('')
    try {
      await markPropertyForReview()
      const { error: clearError } = await supabase.from('property_images').update({ is_cover: false }).eq('property_id', property.id)
      if (clearError) throw clearError
      const { error: coverError } = await supabase.from('property_images').update({ is_cover: true, sort_order: 0 }).eq('id', imageId)
      if (coverError) throw coverError
      await loadProperty()
    } catch (error) {
      setImageMessage(error instanceof Error ? error.message : 'No se pudo cambiar la portada.')
    } finally {
      setImageSaving(false)
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!supabase || !property) return
    const records = property.imageRecords ?? []
    if (records.length <= 1) {
      setImageMessage('La propiedad debe conservar al menos una foto.')
      return
    }

    setImageSaving(true)
    setImageMessage('')
    try {
      await markPropertyForReview()
      const deleting = records.find((image) => image.id === imageId)
      const { error } = await supabase.from('property_images').delete().eq('id', imageId)
      if (error) throw error

      if (deleting?.isCover) {
        const nextCover = records.find((image) => image.id !== imageId)
        if (nextCover) {
          const { error: coverError } = await supabase.from('property_images').update({ is_cover: true, sort_order: 0 }).eq('id', nextCover.id)
          if (coverError) throw coverError
        }
      }

      await loadProperty()
    } catch (error) {
      setImageMessage(error instanceof Error ? error.message : 'No se pudo eliminar la foto.')
    } finally {
      setImageSaving(false)
    }
  }

  const handleImages = (files: FileList | null) => {
    if (!files) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024
    const incoming = Array.from(files)
    const invalid = incoming.find((file) => !allowedTypes.includes(file.type) || file.size > maxSize)

    if (invalid) {
      setImageMessage(`La foto "${invalid.name}" debe ser JPG, PNG o WebP y pesar maximo 5 MB.`)
      return
    }

    selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    setSelectedImages(
      incoming.slice(0, Math.max(0, 10 - (property?.imageRecords?.length ?? property?.images.length ?? 0))).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    )
  }

  const uploadNewImages = async () => {
    if (!supabase || !property || !selectedImages.length) return
    const currentCount = property.imageRecords?.length ?? property.images.length
    if (currentCount + selectedImages.length > 10) {
      setImageMessage('Maximo 10 fotos por propiedad.')
      return
    }

    setImageSaving(true)
    setImageMessage('')
    try {
      await markPropertyForReview()
      const imageRows = []
      for (const [index, image] of selectedImages.entries()) {
        const extension = image.file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
        const path = `${property.advisorId}/${property.id}/${Date.now()}-${index}.${extension}`
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(path, image.file, {
            cacheControl: '3600',
            upsert: false,
            contentType: image.file.type,
          })
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('property-images').getPublicUrl(path)
        imageRows.push({
          property_id: property.id,
          image_url: data.publicUrl,
          sort_order: currentCount + index,
          is_cover: currentCount === 0 && index === 0,
        })
      }
      const { error } = await supabase.from('property_images').insert(imageRows)
      if (error) throw error
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
      setSelectedImages([])
      await loadProperty()
    } catch (error) {
      setImageMessage(error instanceof Error ? error.message : 'No se pudieron subir las fotos.')
    } finally {
      setImageSaving(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    if (!supabase || !property) return

    setSaving(true)
    try {
      const nextStatus = property.status === 'active' ? 'pending' : property.status
      const { error } = await supabase
        .from('properties')
        .update({
          title: form.title,
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
          amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', property.id)

      if (error) throw error
      navigate('/dashboard/propiedades')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar la propiedad.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 text-[#6B7280]">Cargando propiedad...</div>
  }

  if (!property) {
    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-6">
        <p className="font-semibold text-[#111827]">{message || 'Propiedad no encontrada.'}</p>
        <Button asChild className="mt-4" variant="outline"><Link to="/dashboard/propiedades">Volver</Link></Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Editar propiedad</h1>
          <p className="mt-2 text-[#6B7280]">Si editas una propiedad activa, volvera a pending para revision admin.</p>
        </div>
        <Button asChild variant="outline"><Link to="/dashboard/propiedades">Volver</Link></Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 rounded-lg border border-[#E5E7EB] bg-white p-6">
        <Section title="Fotos actuales">
          <div className="col-span-full grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(property.imageRecords?.length ? property.imageRecords : property.images.map((image, index) => ({ id: `${image}-${index}`, imageUrl: image, sortOrder: index, isCover: index === 0 }))).map((image, index) => (
              <div key={image.id} className="overflow-hidden rounded-md border border-[#E5E7EB]">
                <img src={image.imageUrl} alt="" className="h-32 w-full object-cover" />
                <div className="grid gap-2 p-2 text-xs text-[#6B7280]">
                  <span>{image.isCover ? 'Portada actual' : `Foto ${index + 1}`}</span>
                  {property.imageRecords?.length ? (
                    <div className="flex gap-2">
                      {!image.isCover && (
                        <button type="button" className="font-semibold text-[#166534]" disabled={imageSaving} onClick={() => void setCoverImage(image.id)}>
                          Hacer portada
                        </button>
                      )}
                      <button type="button" className="font-semibold text-[#991B1B]" disabled={imageSaving} onClick={() => void deleteImage(image.id)}>
                        Eliminar
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div className="col-span-full rounded-lg border border-dashed border-[#D1D5DB] bg-[#F8FAF7] p-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#111827]">Agregar fotos</span>
              <span className="mt-1 block text-xs text-[#6B7280]">JPG, PNG o WebP. Maximo 5 MB por archivo y 10 fotos por propiedad.</span>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="mt-3 pt-2"
                onChange={(event) => handleImages(event.target.files)}
              />
            </label>
            {selectedImages.length > 0 && (
              <div className="mt-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {selectedImages.map((image, index) => (
                    <div key={image.previewUrl} className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
                      <img src={image.previewUrl} alt="" className="h-28 w-full object-cover" />
                      <p className="p-2 text-xs text-[#6B7280]">Nueva foto {index + 1}</p>
                    </div>
                  ))}
                </div>
                <Button type="button" className="mt-4" disabled={imageSaving} onClick={() => void uploadNewImages()}>
                  {imageSaving ? 'Subiendo...' : 'Subir fotos nuevas'}
                </Button>
              </div>
            )}
            {imageMessage && <p className="mt-3 rounded-md bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">{imageMessage}</p>}
          </div>
        </Section>

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

        <textarea
          required
          value={form.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="Descripcion"
          className="min-h-36 rounded-md border border-[#D1D5DB] bg-white px-3 py-3 text-sm outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#DCFCE7]"
        />

        {message && <p className="rounded-md bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">{message}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/propiedades')}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
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
