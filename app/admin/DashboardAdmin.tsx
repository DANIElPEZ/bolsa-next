'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/src/lib/actions/auth'
import { aprobarEmpresa, toggleActivarUsuario } from '@/src/lib/actions/actions'

interface Company {
  id: number
  user_id: string
  company_name: string
  nit: string
  status: 'pending' | 'approved' | 'rejected'
  logo_url?: string
  updated_at: string
}

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'student' | 'company'
  active: boolean
  created_at: string
}

interface JobPosting {
  id: number
  company_id: number
  title: string
  modality: string
  deadline: string
  status: string
  created_at: string
  companies?: { company_name: string }
}

export default function DashboardAdmin({
  email,
  companies,
  users,
  jobPostings
}: {
  email: string
  companies: Company[]
  users: User[]
  jobPostings: JobPosting[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'stats' | 'pendientes' | 'usuarios' | 'empresas'>('stats')
  const [loading, setLoading] = useState<number | string | null>(null)

  // Aprobación de empresa
  async function handleApproveCompany(companyId: number, status: 'approved' | 'rejected') {
    setLoading(companyId)
    const result = await aprobarEmpresa(companyId, status)
    setLoading(null)
    if (result?.error) {
      alert('Error: ' + result.error)
    } else {
      router.refresh()
    }
  }

  // Activar / Desactivar usuario
  async function handleToggleUser(userId: string, currentActive: boolean) {
    setLoading(userId)
    const result = await toggleActivarUsuario(userId, !currentActive)
    setLoading(null)
    if (result?.error) {
      alert('Error: ' + result.error)
    } else {
      router.refresh()
    }
  }

  // Contadores
  const totalUsuarios = users.length
  const totalEmpresas = companies.length
  const empresasPendientesList = companies.filter(c => c.status === 'pending')
  const totalPendientes = empresasPendientesList.length
  const vacantesActivas = jobPostings.filter(j => j.status === 'active').length

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* 1. BARRA LATERAL IZQUIERDA (Sidebar Verde UNIPAZ) */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col justify-between p-5 shadow-xl hidden md:flex">
        <div>
          <div className="mb-8 border-b border-emerald-700 pb-4 text-center">
            <h1 className="text-2xl font-black tracking-widest text-emerald-300">UNIPAZ</h1>
            <p className="text-[10px] uppercase tracking-wider text-emerald-100 mt-1">Panel de Administrador</p>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'stats' ? 'bg-emerald-900 text-white shadow-sm' : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
              }`}
            >
              <span>📊</span> Resumen / Métricas
            </button>
            <button 
              onClick={() => setActiveTab('pendientes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'pendientes' ? 'bg-emerald-900 text-white shadow-sm' : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
              }`}
            >
              <span>🏢</span> Empresas Pendientes
              {totalPendientes > 0 && (
                <span className="ml-auto bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                  {totalPendientes}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('usuarios')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'usuarios' ? 'bg-emerald-900 text-white shadow-sm' : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
              }`}
            >
              <span>👥</span> Control de Usuarios
            </button>
            <button 
              onClick={() => setActiveTab('empresas')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'empresas' ? 'bg-emerald-900 text-white shadow-sm' : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
              }`}
            >
              <span>🏢</span> Todas las Empresas
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
            <span>⚙️</span> Administración Central
          </h2>
          <div className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3.5 py-1.5 rounded-full border border-emerald-200">
            {email}
          </div>
        </header>

        {/* ÁREA DE CONTENIDO */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* TABLA DE METRICAS/STATS */}
          {activeTab === 'stats' && (
            <>
              {/* Tarjetas Estadísticas */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Usuarios Totales</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{totalUsuarios}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold">👥</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Empresas Aliadas</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{totalEmpresas}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold">🏢</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Empresas Pendientes</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{totalPendientes}</h3>
                  </div>
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl font-bold ${
                    totalPendientes > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-amber-50 text-amber-700'
                  }`}>⏳</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Convocatorias Activas</p>
                    <h3 className="text-2xl font-black text-gray-800 mt-1">{vacantesActivas}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-bold">📢</div>
                </div>
              </section>

              {/* Convocatorias Laborales Recientes */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-black text-gray-800 mb-4">Vacantes Recientes del Sistema</h3>
                
                {jobPostings.length === 0 ? (
                  <p className="text-gray-400 text-sm font-semibold text-center py-6">No hay ofertas de empleo registradas.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <th className="py-3 px-4">Oferta</th>
                          <th className="py-3 px-4">Empresa</th>
                          <th className="py-3 px-4">Modalidad</th>
                          <th className="py-3 px-4">Cierre</th>
                          <th className="py-3 px-4 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {jobPostings.slice(0, 5).map((job) => (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 font-bold text-gray-900">{job.title}</td>
                            <td className="py-4 px-4 font-medium text-emerald-800">{job.companies?.company_name}</td>
                            <td className="py-4 px-4 text-xs font-semibold capitalize">{job.modality === 'onsite' ? 'Presencial' : job.modality === 'hybrid' ? 'Híbrido' : 'Remoto'}</td>
                            <td className="py-4 px-4 text-xs text-red-600 font-bold">{new Date(job.deadline).toLocaleDateString()}</td>
                            <td className="py-4 px-4 text-right">
                              <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100">
                                Activo
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: EMPRESAS PENDIENTES */}
          {activeTab === 'pendientes' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-black text-gray-800">Solicitudes de Registro Pendientes</h3>
                <p className="text-xs text-gray-400 mt-1">Revisa el NIT y los datos de las empresas aliadas nuevas para autorizar o denegar su acceso.</p>
              </div>

              {empresasPendientesList.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="text-gray-400 text-sm font-semibold">¡No hay empresas esperando aprobación en este momento!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 pt-2">
                  {empresasPendientesList.map((company) => {
                    const linkedUser = users.find(u => u.id === company.user_id)
                    return (
                      <div 
                        key={company.id} 
                        className="p-5 border border-gray-200 rounded-xl bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-gray-900">{company.company_name}</h4>
                          <div className="flex items-center gap-2 text-xs flex-wrap font-medium">
                            <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">NIT: {company.nit}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-emerald-800 font-semibold">Email: {linkedUser?.email || 'No disponible'}</span>
                          </div>
                        </div>

                        {/* Botones de Aprobación */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveCompany(company.id, 'rejected')}
                            disabled={loading === company.id}
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-lg border border-red-200 transition-colors"
                          >
                            {loading === company.id ? 'Cargando...' : 'Rechazar'}
                          </button>
                          
                          <button
                            onClick={() => handleApproveCompany(company.id, 'approved')}
                            disabled={loading === company.id}
                            className="bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                          >
                            {loading === company.id ? 'Cargando...' : '✓ Aprobar Empresa'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTROL DE USUARIOS */}
          {activeTab === 'usuarios' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-black text-gray-800">Control de Usuarios Registrados</h3>
                <p className="text-xs text-gray-400 mt-1">Activa o desactiva de forma inmediata las cuentas para suspender o autorizar el acceso general al sistema.</p>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-sm text-gray-500 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Nombre completo</th>
                      <th className="py-3 px-4">Correo electrónico</th>
                      <th className="py-3 px-4">Rol en Sistema</th>
                      <th className="py-3 px-4">Acceso</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => {
                      // Traducir rol
                      let roleLabel = 'Estudiante'
                      let roleBg = 'bg-blue-50 text-blue-800 border-blue-100'
                      if (user.role === 'admin') {
                        roleLabel = 'Administrador'
                        roleBg = 'bg-purple-50 text-purple-800 border-purple-100'
                      } else if (user.role === 'company') {
                        roleLabel = 'Empresa'
                        roleBg = 'bg-emerald-50 text-emerald-800 border-emerald-100'
                      }

                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 font-bold text-gray-900">{user.name || 'Sin nombre'}</td>
                          <td className="py-4 px-4 font-medium text-gray-500">{user.email}</td>
                          <td className="py-4 px-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${roleBg}`}>
                              {roleLabel}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {user.active ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Activo</span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Suspendido</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            {user.role === 'admin' ? (
                              <span className="text-[10px] text-gray-400 font-semibold italic">Protegido</span>
                            ) : (
                              <button
                                onClick={() => handleToggleUser(user.id, user.active)}
                                disabled={loading === user.id}
                                className={`text-[10px] font-black px-3 py-1.5 rounded transition-all border ${
                                  user.active
                                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {loading === user.id ? 'Cargando...' : user.active ? 'Suspender' : 'Autorizar'}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TODAS LAS EMPRESAS */}
          {activeTab === 'empresas' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-black text-gray-800">Control de Empresas Aliadas</h3>
                <p className="text-xs text-gray-400 mt-1">Historial y estado de auditoría de todas las entidades empresariales registradas.</p>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-sm text-gray-500 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Nombre comercial</th>
                      <th className="py-3 px-4">NIT / Identificación</th>
                      <th className="py-3 px-4">Última actualización</th>
                      <th className="py-3 px-4 text-right">Estado Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {companies.map((comp) => {
                      let statusBadge = 'bg-amber-50 text-amber-800 border-amber-200'
                      let statusName = 'Pendiente'
                      
                      if (comp.status === 'approved') {
                        statusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        statusName = 'Aprobado'
                      } else if (comp.status === 'rejected') {
                        statusBadge = 'bg-red-50 text-red-800 border-red-200'
                        statusName = 'Rechazado'
                      }

                      return (
                        <tr key={comp.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 font-bold text-gray-900">{comp.company_name}</td>
                          <td className="py-4 px-4 font-medium text-gray-600">{comp.nit}</td>
                          <td className="py-4 px-4 text-xs text-gray-400">{new Date(comp.updated_at).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-right">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${statusBadge}`}>
                              {statusName}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  )
}
