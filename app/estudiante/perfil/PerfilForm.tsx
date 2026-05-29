'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { guardarPerfilEstudiante } from '@/src/lib/actions/actions'

interface Profile {
  id?: number
  student_code?: string
  program?: string
  semester?: string
  cv_url?: string
}

export default function PerfilForm({ 
  userId, 
  initialProfile 
}: { 
  userId: string
  initialProfile: Profile | null 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [studentCode, setStudentCode] = useState(initialProfile?.student_code || '')
  const [program, setProgram] = useState(initialProfile?.program || '')
  const [semester, setSemester] = useState(initialProfile?.semester || '')
  const [currentCvUrl, setCurrentCvUrl] = useState(initialProfile?.cv_url || '')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    formData.append('current_cv_url', currentCvUrl)

    const result = await guardarPerfilEstudiante(formData, userId)

    setLoading(false)
    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: '¡Perfil y Hoja de Vida guardados con éxito!' })
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {message && (
        <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{message.type === 'success' ? '✅' : '❌'}</span>
          <p>{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Código Estudiantil */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Código Estudiantil</label>
          <input 
            type="text" 
            name="student_code"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            required
            placeholder="Ej: 202611504" 
            className="text-black p-3 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all shadow-sm"
          />
        </div>

        {/* Semestre Actual */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Semestre Actual</label>
          <select 
            name="semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            required
            className="text-black p-3 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all shadow-sm"
          >
            <option value="">Selecciona semestre</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={`${i + 1}° Semestre`}>{i + 1}° Semestre</option>
            ))}
            <option value="Egresado">Egresado</option>
          </select>
        </div>
      </div>

      {/* Programa Académico */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Programa Académico</label>
        <select 
          name="program"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          required
          className="text-black p-3 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all shadow-sm"
        >
          <option value="">Selecciona tu programa académico</option>
          <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
          <option value="Ingeniería Agronómica">Ingeniería Agronómica</option>
          <option value="Ingeniería Ambiental">Ingeniería Ambiental</option>
          <option value="Medicina Veterinaria y Zootecnia">Medicina Veterinaria y Zootecnia</option>
          <option value="Administración de Empresas">Administración de Empresas</option>
          <option value="Licenciatura en Pedagogía Infantil">Licenciatura en Pedagogía Infantil</option>
          <option value="Tecnología en Gestión Agropecuaria">Tecnología en Gestión Agropecuaria</option>
        </select>
      </div>

      {/* Subir Hoja de Vida PDF */}
      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Documento de Hoja de Vida (PDF)
          </label>
          <p className="text-[11px] text-gray-400 mt-0.5">Sube tu currículum actualizado en formato PDF. Tamaño máximo recomendado: 5MB.</p>
        </div>

        {currentCvUrl && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-xs font-bold text-emerald-900">Hoja de Vida Cargada</p>
                <p className="text-[10px] text-emerald-700">Ya cuentas con un documento guardado en la nube.</p>
              </div>
            </div>
            <a 
              href={currentCvUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-100 px-3.5 py-1.5 rounded-lg border border-emerald-200 transition-colors shadow-sm"
            >
              📥 Ver PDF Actual
            </a>
          </div>
        )}

        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-emerald-50 hover:border-emerald-400 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <span className="text-3xl mb-2">📁</span>
              <p className="mb-1 text-xs text-gray-500 font-bold">
                {currentCvUrl ? 'Haga clic para reemplazar su PDF' : 'Haga clic para cargar su archivo PDF'}
              </p>
              <p className="text-[10px] text-gray-400">PDF estrictamente (Soporta múltiples revisiones)</p>
            </div>
            <input 
              id="cv"
              name="cv"
              type="file" 
              accept=".pdf"
              className="hidden" 
              required={!currentCvUrl}
            />
          </label>
        </div>
      </div>

      {/* Botón de Enviar */}
      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center gap-2 justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all ${
            loading 
              ? 'bg-emerald-900 cursor-not-allowed opacity-75' 
              : 'bg-emerald-800 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando Perfil...
            </>
          ) : (
            'Guardar Cambios de Perfil'
          )}
        </button>
      </div>

    </form>
  )
}
