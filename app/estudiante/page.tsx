import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { logout } from '@/src/lib/actions/auth'

export default async function EstudianteDashboard() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() }
      }
    }
  )

  // Recuperar sesión activa del estudiante
  const { data: { session } } = await supabase.auth.getSession()
  
  // Consulta de las postulaciones del estudiante logueado
  const { data: postulaciones } = await supabase
    .from('applications')
    .select('*, job_postings(*, companies(company_name))')
    .eq('user_id', session?.user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* BARRA LATERAL IZQUIERDA (Estudiante) */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col justify-between p-5 shadow-xl hidden md:flex">
        <div>
          <div className="mb-8 border-b border-emerald-700 pb-4 text-center">
            <h1 className="text-2xl font-black tracking-widest text-emerald-300">UNIPAZ</h1>
            <p className="text-[10px] uppercase tracking-wider text-emerald-100 mt-1">Panel de Estudiante</p>
          </div>

          <nav className="space-y-2">
            <Link href="/estudiante" className="flex items-center gap-3 bg-emerald-900 text-white px-4 py-3 rounded-lg font-semibold text-sm shadow-sm">
              <span>📋</span> Mis Postulaciones
            </Link>
            <Link href="/" className="flex items-center gap-3 text-emerald-100 hover:bg-emerald-700 hover:text-white px-4 py-3 rounded-lg font-medium text-sm transition-all">
              <span>🔍</span> Ver Nuevas Vacantes
            </Link>
            <Link href="/estudiante/perfil" className="flex items-center gap-3 text-emerald-100 hover:bg-emerald-700 hover:text-white px-4 py-3 rounded-lg font-medium text-sm transition-all">
              <span>👤</span> Mi Hoja de Vida
            </Link>
          </nav>
        </div>

        <form action={logout} className="border-t border-emerald-700 pt-4">
          <button type="submit" className="w-full text-left text-xs font-bold text-red-300 hover:text-red-400 px-4 py-2 transition-colors">
            🚪 Cerrar Sesión
          </button>
        </form>
      </aside>

      {/* CONTENIDO DEL DASHBOARD */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white h-16 shadow-sm border-b px-6 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-700">Historial de Aplicaciones Laborales</h2>
          <div className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-full border border-emerald-200">
            {session?.user.email}
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <h3 className="text-lg font-black text-gray-700 px-1">Tus Procesos Activos ({postulaciones?.length || 0})</h3>

          {!postulaciones || postulaciones.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-400 text-sm font-medium mb-3">Aún no te has postulado a ninguna vacante de empleo.</p>
              <Link href="/" className="bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-800">
                Explorar Convocatorias
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {postulaciones.map((postulacion) => {
                // Configurar etiquetas de colores dinámicas según el estado
                let statusLabel = 'Pendiente'
                let statusColor = 'text-amber-800 bg-amber-50 border-amber-200'

                if (postulacion.status === 'interview') {
                  statusLabel = 'En Entrevista'
                  statusColor = 'text-blue-800 bg-blue-50 border-blue-200'
                } else if (postulacion.status === 'approved') {
                  statusLabel = 'Seleccionado'
                  statusColor = 'text-emerald-800 bg-emerald-50 border-emerald-200'
                } else if (postulacion.status === 'rejected') {
                  statusLabel = 'Finalizado'
                  statusColor = 'text-red-800 bg-red-50 border-red-200'
                }

                return (
                  <div key={postulacion.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${statusColor}`}>
                        {statusLabel}
                      </span>
                      <h4 className="text-lg font-bold text-gray-900 pt-2">{postulacion.job_postings?.title}</h4>
                      <p className="text-sm font-semibold text-gray-500">{postulacion.job_postings?.companies?.company_name}</p>
                      <p className="text-xs text-gray-400">Te postulaste el: {new Date(postulacion.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="sm:text-right border-t sm:border-0 pt-3 sm:pt-0 border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Carta Adjunta</span>
                      <p className="text-xs text-gray-600 italic max-w-xs line-clamp-2">"{postulacion.cover_letter}"</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

    </div>
  )
}