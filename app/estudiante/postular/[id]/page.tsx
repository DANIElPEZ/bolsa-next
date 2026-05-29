import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import PostularForm from './PostularForm'
import { logout } from '@/src/lib/actions/auth'

export default async function EstudiantePostularPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const jobPostingId = parseInt(resolvedParams.id)

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

  // 1. Recuperar sesión activa del estudiante
  const { data: { session } } = await supabase.auth.getSession()

  // 2. Comprobar perfil del estudiante (para validar CV)
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('cv_url')
    .eq('user_id', session?.user.id)
    .maybeSingle()

  const hasCv = !!profile?.cv_url

  // 3. Consultar los detalles de la vacante y empresa
  const { data: vacante } = await supabase
    .from('job_postings')
    .select('*, companies(company_name, logo_url)')
    .eq('id', jobPostingId)
    .single()

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* BARRA LATERAL IZQUIERDA (Estudiante) */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col justify-between p-5 shadow-xl hidden md:flex">
        <div>
          <div className="mb-8 border-b border-emerald-700 pb-4 text-center">
            <h1 className="text-2xl font-black tracking-widest text-emerald-300">UNIPAZ</h1>
            <p className="text-[10px] uppercase tracking-wider text-emerald-100 mt-1">Panel de Estudiante</p>
          </div>

          <nav className="space-y-2">
            <Link href="/estudiante" className="flex items-center gap-3 text-emerald-100 hover:bg-emerald-700 hover:text-white px-4 py-3 rounded-lg font-medium text-sm transition-all">
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
          <h2 className="text-lg font-bold text-gray-700">Postulación a Convocatoria</h2>
          <div className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-full border border-emerald-200">
            {session?.user.email}
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-800">Proceso de Aplicación</h3>
            <Link 
              href="/" 
              className="text-xs font-bold text-gray-600 hover:text-black bg-white hover:bg-gray-100 px-3.5 py-2 rounded-lg border transition-colors shadow-sm"
            >
              ← Volver al Listado General
            </Link>
          </div>

          {/* Tarjeta de Información de la Vacante */}
          {vacante && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                    {vacante.modality === 'onsite' ? 'Presencial' : vacante.modality === 'hybrid' ? 'Híbrido' : 'Remoto'}
                  </span>
                  <h4 className="text-2xl font-black text-gray-900 pt-1">{vacante.title}</h4>
                  <p className="text-base font-bold text-emerald-700">{vacante.companies?.company_name}</p>
                </div>
                
                <div className="text-left md:text-right bg-red-50 border border-red-100 p-3 rounded-xl">
                  <span className="text-[9px] font-bold text-red-500 uppercase block tracking-wider">Fecha límite de aplicación</span>
                  <span className="text-sm text-red-600 font-black">{new Date(vacante.deadline).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción del Cargo</h5>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{vacante.description}</p>
              </div>
            </div>
          )}

          {/* Formulario de Aplicación */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-900 text-white px-6 py-4">
              <h4 className="font-bold text-sm uppercase tracking-wider">Confirmar Postulación</h4>
            </div>

            <div className="p-6">
              {!hasCv ? (
                <div className="p-6 text-center space-y-4 max-w-md mx-auto">
                  <span className="text-5xl block">⚠️</span>
                  <h5 className="text-lg font-bold text-amber-800">¡Hoja de Vida Requerida!</h5>
                  <p className="text-sm text-gray-500">No puedes postularte a las ofertas sin completar tu perfil académico y cargar tu currículum en formato PDF primero.</p>
                  <div className="pt-2">
                    <Link 
                      href="/estudiante/perfil" 
                      className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-sm"
                    >
                      👤 Completar Mi Perfil / Subir PDF
                    </Link>
                  </div>
                </div>
              ) : (
                <PostularForm 
                  userId={session?.user.id || ''} 
                  jobPostingId={jobPostingId} 
                />
              )}
            </div>
          </div>
        </main>
      </div>

    </div>
  )
}
