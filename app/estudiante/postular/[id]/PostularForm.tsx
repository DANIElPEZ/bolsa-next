'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { postularAVacante } from '@/src/lib/actions/actions'

export default function PostularForm({
  userId,
  jobPostingId,
}: {
  userId: string
  jobPostingId: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await postularAVacante(userId, jobPostingId, coverLetter)

    setLoading(false)
    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: '¡Te has postulado con éxito a esta vacante!' })
      // Redirigir al historial después de 2 segundos
      setTimeout(() => {
        router.push('/estudiante')
        router.refresh()
      }, 2000)
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

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Carta de Presentación / Motivación
        </label>
        <p className="text-[11px] text-gray-400">Cuéntale a la empresa brevemente por qué eres el candidato ideal para este cargo (máx. 1000 caracteres).</p>
        <textarea
          name="cover_letter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          required
          rows={5}
          maxLength={1000}
          placeholder="Escribe aquí tu carta de presentación... Ej: Estimado equipo, me postulo a esta vacante debido a mi experiencia previa desarrollando proyectos de software y mi formación en Ingeniería de Sistemas..."
          className="text-black p-3.5 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all shadow-sm resize-none leading-relaxed"
        />
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>🛡️</span>
          <span>Tu Hoja de Vida PDF actual se enviará de forma segura.</span>
        </div>

        <button
          type="submit"
          disabled={loading || !coverLetter.trim()}
          className={`flex items-center gap-2 justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all ${
            loading 
              ? 'bg-emerald-950 cursor-not-allowed opacity-75' 
              : 'bg-emerald-800 hover:bg-emerald-900 focus:outline-none'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando Aplicación...
            </>
          ) : (
            'Enviar Mi Postulación'
          )}
        </button>
      </div>
    </form>
  )
}
