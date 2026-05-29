import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import PerfilForm from './PerfilForm'
import { logout } from '@/src/lib/actions/auth'

export default async function EstudiantePerfilPage() {
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
  
  // Consulta de perfil del estudiante logueado
  const { data: perfil } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', session?.user.id)
    .maybeSingle()

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
            <Link href="/estudiante/perfil" className="flex items-center gap-3 bg-emerald-900 text-white px-4 py-3 rounded-lg font-semibold text-sm shadow-sm">
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

      {/* CONTENIDO DEL PANEL */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white h-16 shadow-sm border-b px-6 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-700">Mi Perfil y Hoja de Vida</h2>
          <div className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-full border border-emerald-200">
            {session?.user.email}
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-800">Datos Profesionales</h3>
              <p className="text-xs text-gray-500 mt-1">Completa tu información académica y sube tu hoja de vida en PDF para poder postularte a las ofertas laborales.</p>
            </div>
            <Link 
              href="/estudiante" 
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-lg border border-emerald-200 transition-colors"
            >
              ← Volver a Mis Postulaciones
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-emerald-700 px-6 py-4 text-white">
              <h4 className="font-bold text-sm uppercase tracking-wider">Formulario de Hoja de Vida</h4>
            </div>
            
            <div className="p-6">
              <PerfilForm userId={session?.user.id || ''} initialProfile={perfil} />
            </div>
          </div>
        </main>
      </div>

    </div>
  )
}
