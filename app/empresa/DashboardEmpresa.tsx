'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/src/lib/actions/auth'
import { crearVacante, cambiarEstadoPostulacion } from '@/src/lib/actions/actions'
import { supabase } from '@/src/lib/supabase'

interface Company {
  id: number
  company_name: string
  nit: string
  status: string
  logo_url?: string
}

interface Vacante {
  id: number
  company_id: number
  title: string
  description: string
  modality: string
  deadline: string
  status: string
  created_at: string
}

interface Application {
  id: number
  user_id: string
  job_posting_id: number
  cover_letter: string
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected'
  created_at: string
  job_postings?: { title: string }
  users?: { name: string; email: string }
  student_profile?: {
    student_code: string
    program: string
    semester: string
    cv_url: string
  } | null
}

export default function DashboardEmpresa({
  company,
  vacantes,
  applications,
  email
}: {
  company: Company
  vacantes: Vacante[]
  applications: Application[]
  email: string
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'vacantes' | 'publicar' | 'candidatos'>('vacantes')
  const [loading, setLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Realtime subscription: Escucha aplicaciones nuevas
  useEffect(() => {
    const channel = supabase
      .channel('empresa-realtime-applications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'applications'
        },
        (payload) => {
          // Actualiza los datos de la vista automáticamente
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications'
        },
        (payload) => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  // Contadores para las tarjetas
  const totalVacantes = vacantes.length
  const totalCandidatos = applications.length
  const candidatosPendientes = applications.filter(a => a.status === 'pending').length

  // Publicar vacante submit handler
  async function handlePublishVacancy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setActionMessage(null)

    const formData = new FormData(event.currentTarget)
    const result = await crearVacante(formData, company.id)

    setLoading(false)
    if (result?.error) {
      setActionMessage({ type: 'error', text: result.error })
    } else {
      setActionMessage({ type: 'success', text: '¡Convocatoria laboral publicada con éxito!' })
      event.currentTarget.reset()
      setTimeout(() => {
        setActionMessage(null)
        setActiveTab('vacantes')
        router.refresh()
      }, 1500)
    }
  }

  // Cambiar estado de postulación handler
  async function handleStatusChange(applicationId: number, status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected') {
    const result = await cambiarEstadoPostulacion(applicationId, status)
    if (result?.error) {
      alert('Error: ' + result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* 1. BARRA LATERAL IZQUIERDA */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col justify-between p-5 shadow-xl hidden md:flex">
        <div>
          <div className="mb-8 border-b border-emerald-700 pb-4 text-center">
            <h1 className="text-2xl font-black tracking-widest text-emerald-300">UNIPAZ</h1>
            <p className="text-[10px] uppercase tracking-wider text-emerald-100 mt-1">Panel de Empresa</p>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => { setActiveTab('vacantes'); setActionMessage(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'vacantes' ? 'bg-emerald-900 text-white shadow-sm' : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
              }`}
            >
              <span>💼</span> Vacantes Publicadas
            </button>
            <button 
              onClick={() => { setActiveTab('publicar'); setActionMessage(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'publicar' ? 'bg-emerald-900 text-white shadow-sm' : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
              }`}
            >
              <span>📢</span> Publicar Vacante
            </button>
            <button 
              onClick={() => { setActiveTab('candidatos'); setActionMessage(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'candidatos' ? 'bg-emerald-900 text-white shadow-sm' : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
              }`}
            >
              <span>👥</span> Candidatos Recibidos
              {candidatosPendientes > 0 && (
                <span className="ml-auto bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                  {candidatosPendientes}
                </span>
              )}
            </button>
          </nav>
        </div>

        <form action={logout} className="border-t border-emerald-700 pt-4">
          <button type="submit" className="w-full text-left text-xs font-bold text-red-300 hover:text-red-400 px-4 py-2 transition-colors">
            🚪 Cerrar Sesión
          </button>
        </form>
      </aside>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col">
        
        {/* BARRA SUPERIOR */}
        <header className="bg-white h-16 shadow-sm border-b px-6 flex justify-between items-center">
          <h2 className="text-lg font-black text-gray-700 flex items-center gap-2">
            <span>🏢</span> {company.company_name}
          </h2>
          <div className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3.5 py-1.5 rounded-full border border-emerald-200">
            {email}
          </div>
        </header>

        {/* ÁREA DE CONTENIDO */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* TAB 1: VACANTES PUBLICADAS (Vista Principal con Estadísticas) */}
          {activeTab === 'vacantes' && (
            <>
              {/* Tarjetas Estadísticas */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vacantes Activas</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{totalVacantes}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold">📂</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Candidaturas Recibidas</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{totalCandidatos}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold">👥</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Por Revisar</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{candidatosPendientes}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-bold">⚠️</div>
                </div>
              </section>

              {/* Botón Flotante / Llamado a la acción */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-700 px-1">Convocatorias Publicadas</h3>
                <button 
                  onClick={() => setActiveTab('publicar')}
                  className="bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  + Publicar Nueva Oferta
                </button>
              </div>

              {/* Grid de Vacantes */}
              {vacantes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                  <span className="text-5xl block mb-3">📢</span>
                  <p className="text-gray-400 text-sm font-semibold mb-4">Aún no has publicado ninguna convocatoria laboral.</p>
                  <button 
                    onClick={() => setActiveTab('publicar')}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-all"
                  >
                    Publica la primera oferta
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vacantes.map((vacante) => (
                    <div 
                      key={vacante.id} 
                      className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {vacante.modality === 'onsite' ? 'Presencial' : vacante.modality === 'hybrid' ? 'Híbrido' : 'Remoto'}
                          </span>
                          <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
                            Cierra: {new Date(vacante.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{vacante.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{vacante.description}</p>
                      </div>

                      <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-medium">Publicado: {new Date(vacante.created_at).toLocaleDateString()}</span>
                        <button
                          onClick={() => setActiveTab('candidatos')}
                          className="bg-gray-100 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-gray-200 hover:border-emerald-200"
                        >
                          Ver candidatos →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 2: PUBLICAR NUEVA VACANTE */}
          {activeTab === 'publicar' && (
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-emerald-800 px-6 py-4 text-white">
                <h4 className="font-bold text-sm uppercase tracking-wider">Formulario de Vacante Laboral</h4>
              </div>

              <form onSubmit={handlePublishVacancy} className="p-6 space-y-6">
                
                {actionMessage && (
                  <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-3 ${
                    actionMessage.type === 'success' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <span>{actionMessage.type === 'success' ? '✅' : '❌'}</span>
                    <p>{actionMessage.text}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Título de la Vacante */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título de la Vacante</label>
                    <input 
                      type="text" 
                      name="title"
                      required
                      placeholder="Ej: Desarrollador Backend, Pasante de Agronomía..." 
                      className="text-black p-3 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  {/* Modalidad */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Modalidad Laboral</label>
                    <select 
                      name="modality"
                      required
                      className="text-black p-3 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all shadow-sm"
                    >
                      <option value="">Selecciona modalidad</option>
                      <option value="onsite">Presencial (Barrancabermeja / Sede)</option>
                      <option value="remote">Remoto (100% Virtual)</option>
                      <option value="hybrid">Híbrido (Mixto)</option>
                    </select>
                  </div>
                </div>

                {/* Fecha Límite */}
                <div className="flex flex-col gap-1 md:w-1/2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cierre de Postulación</label>
                  <input 
                    type="date" 
                    name="deadline"
                    required
                    className="text-black p-3 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción y Requisitos</label>
                  <textarea 
                    name="description"
                    required
                    rows={6}
                    placeholder="Detalla las funciones del cargo, requisitos académicos (semestre, carrera), habilidades deseadas y beneficios que ofrece la empresa..." 
                    className="text-black p-3 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all shadow-sm resize-none leading-relaxed"
                  />
                </div>

                {/* Acciones */}
                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('vacantes')}
                    className="py-3 px-6 border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all ${
                      loading 
                        ? 'bg-emerald-950 cursor-not-allowed opacity-75' 
                        : 'bg-emerald-800 hover:bg-emerald-900'
                    }`}
                  >
                    {loading ? 'Publicando...' : 'Publicar Vacante'}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 3: CANDIDATOS RECIBIDOS */}
          {activeTab === 'candidatos' && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-gray-700 px-1">Postulaciones del Alumnado</h3>

              {applications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                  <span className="text-5xl block mb-3">👥</span>
                  <p className="text-gray-400 text-sm font-semibold">Aún no has recibido ninguna postulación de estudiantes de UNIPAZ.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {applications.map((app) => {
                    const profile = app.student_profile
                    
                    // Colores de los estados
                    let statusBg = 'bg-amber-50 text-amber-800 border-amber-200'
                    let statusText = 'Pendiente'
                    if (app.status === 'reviewed') {
                      statusBg = 'bg-purple-50 text-purple-800 border-purple-200'
                      statusText = 'Revisado'
                    } else if (app.status === 'interview') {
                      statusBg = 'bg-blue-50 text-blue-800 border-blue-200'
                      statusText = 'En Entrevista'
                    } else if (app.status === 'accepted') {
                      statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      statusText = 'Aceptado'
                    } else if (app.status === 'rejected') {
                      statusBg = 'bg-red-50 text-red-800 border-red-200'
                      statusText = 'Rechazado'
                    }

                    return (
                      <div 
                        key={app.id}
                        className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4 hover:border-emerald-200 transition-all"
                      >
                        {/* Cabecera del Candidato */}
                        <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gray-100 pb-4">
                          <div className="space-y-1">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${statusBg}`}>
                              {statusText}
                            </span>
                            <h4 className="text-lg font-black text-gray-900 pt-1">{app.users?.name || 'Estudiante Sin Nombre'}</h4>
                            <p className="text-xs text-gray-500 font-semibold">{app.users?.email}</p>
                            
                            {profile ? (
                              <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold bg-emerald-50/50 px-2.5 py-1 rounded-lg border border-emerald-100/50 w-fit mt-1.5 flex-wrap">
                                <span>🎓 {profile.program}</span>
                                <span className="text-gray-300">|</span>
                                <span>📈 {profile.semester}</span>
                                <span className="text-gray-300">|</span>
                                <span>🆔 Cód: {profile.student_code}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-600 block mt-1">⚠️ Perfil de estudiante no completo</span>
                            )}
                          </div>

                          <div className="bg-gray-50 border p-3 rounded-xl text-left md:text-right space-y-0.5">
                            <span className="text-[9px] font-bold text-gray-400 uppercase block">Cargo Postulado</span>
                            <span className="text-xs text-emerald-800 font-black">{app.job_postings?.title}</span>
                          </div>
                        </div>

                        {/* Carta de presentación */}
                        <div className="space-y-1.5">
                          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Carta de Presentación</h5>
                          <p className="text-xs text-gray-600 italic bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-line leading-relaxed">
                            "{app.cover_letter}"
                          </p>
                        </div>

                        {/* Acciones */}
                        <div className="flex justify-between items-center flex-wrap gap-4 pt-4 border-t border-gray-100">
                          {/* Descargar CV PDF */}
                          {profile?.cv_url ? (
                            <a 
                              href={profile.cv_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                            >
                              📥 Descargar Hoja de Vida (PDF)
                            </a>
                          ) : (
                            <button 
                              disabled 
                              className="bg-gray-100 text-gray-400 text-xs font-semibold px-4 py-2 rounded-lg cursor-not-allowed border"
                            >
                              PDF No Disponible
                            </button>
                          )}

                          {/* Control de Estados de Postulación */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Cambiar Estado:</span>
                            <button
                              onClick={() => handleStatusChange(app.id, 'reviewed')}
                              className={`text-[10px] font-black px-2.5 py-1.5 rounded transition-all ${
                                app.status === 'reviewed' ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Revisado
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'interview')}
                              className={`text-[10px] font-black px-2.5 py-1.5 rounded transition-all ${
                                app.status === 'interview' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Entrevista
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'accepted')}
                              className={`text-[10px] font-black px-2.5 py-1.5 rounded transition-all ${
                                app.status === 'accepted' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              className={`text-[10px] font-black px-2.5 py-1.5 rounded transition-all ${
                                app.status === 'rejected' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

    </div>
  )
}
