import { Camera, Check, FileCheck, UserPlus } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'

const steps = [
  { title: 'Crear cuenta', icon: UserPlus },
  { title: 'Perfil profesional', icon: Camera },
  { title: 'Verificacion', icon: FileCheck },
  { title: 'Elegir plan', icon: Check },
]

export function JoinPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#166534]">Onboarding asesor</p>
        <h1 className="mt-2 text-4xl font-bold text-[#111827]">Crea tu presencia profesional</h1>
        <p className="mt-3 text-[#6B7280]">Flujo mock preparado para conectar Supabase Auth, Storage y aprobacion admin.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-[#E5E7EB] bg-white p-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="flex items-center gap-3 border-b border-[#E5E7EB] py-3 last:border-0">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-[#DCFCE7] text-[#166534]"><Icon className="h-4 w-4" /></span>
                <div>
                  <p className="text-xs text-[#6B7280]">Paso {index + 1}</p>
                  <p className="font-semibold text-[#111827]">{step.title}</p>
                </div>
              </div>
            )
          })}
        </aside>

        <form className="rounded-lg border border-[#E5E7EB] bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Nombre completo" />
            <Input placeholder="Email" type="email" />
            <Input placeholder="WhatsApp" />
            <Input placeholder="Contrasena" type="password" />
            <Input placeholder="Confirmar contrasena" type="password" />
            <Input placeholder="Nombre comercial opcional" />
            <Input placeholder="Bio profesional" className="md:col-span-2" />
            <Select defaultValue="Hermosillo">
              <option>Hermosillo</option>
            </Select>
            <Input placeholder="Zonas donde trabaja" />
            <Input placeholder="Anos de experiencia" type="number" />
            <Input placeholder="Instagram opcional" />
            <Input placeholder="Facebook opcional" />
            <Input placeholder="Sitio web opcional" />
            <Input placeholder="Subir identificacion (mock)" type="file" className="pt-2" />
            <Input placeholder="Subir selfie opcional (mock)" type="file" className="pt-2" />
          </div>
          <label className="mt-5 flex items-center gap-2 text-sm text-[#374151]">
            <input type="checkbox" />
            Acepto terminos y politicas de verificacion.
          </label>
          <Button type="button" className="mt-6">Continuar a crear primera propiedad</Button>
        </form>
      </div>
    </section>
  )
}
