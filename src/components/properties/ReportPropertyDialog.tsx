import * as Dialog from '@radix-ui/react-dialog'
import { Flag, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { createPropertyReport } from '../../lib/reportService'
import { isUuid } from '../../lib/supabaseActions'
import type { Property } from '../../types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select } from '../ui/select'

export function ReportPropertyDialog({ property }: { property: Property }) {
  const [submitted, setSubmitted] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  return (
    <Dialog.Root onOpenChange={(open) => !open && setSubmitted(false)}>
      <Dialog.Trigger asChild>
        <Button variant="outline" className="flex-1">
          <Flag className="h-4 w-4" />
          Reportar
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[900] bg-[#111827]/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[901] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-[#111827]">Reportar propiedad</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-[#6B7280]">
                Ayudanos a revisar anuncios sospechosos o con informacion incorrecta.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Cerrar">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          {submitted ? (
            <div className="mt-6 rounded-lg border border-[#DCFCE7] bg-[#F0FDF4] p-4 text-sm text-[#166534]">
              Reporte registrado para: {property.title}. Gracias por ayudar a mantener la plataforma confiable.
            </div>
          ) : (
            <form
              className="mt-6 grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault()
                setMessage('')
                if (!isUuid(property.id)) {
                  setMessage('Esta propiedad es mock. Los reportes reales se guardan en propiedades de Supabase.')
                  return
                }
                setLoading(true)
                try {
                  await createPropertyReport({
                    propertyId: property.id,
                    userId: user?.id,
                    reason,
                    details,
                  })
                  setSubmitted(true)
                  setReason('')
                  setDetails('')
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : 'No se pudo enviar el reporte.')
                } finally {
                  setLoading(false)
                }
              }}
            >
              <Select required value={reason} onChange={(event) => setReason(event.target.value)}>
                <option value="" disabled>Motivo del reporte</option>
                <option>Informacion falsa</option>
                <option>Propiedad duplicada</option>
                <option>Precio incorrecto</option>
                <option>Posible fraude</option>
                <option>Otro</option>
              </Select>
              <Input placeholder="Detalles adicionales" value={details} onChange={(event) => setDetails(event.target.value)} />
              {message && <p className="rounded-md bg-[#FEE2E2] p-3 text-sm text-[#991B1B]">{message}</p>}
              <Button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar reporte'}</Button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
