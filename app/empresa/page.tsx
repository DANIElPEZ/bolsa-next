import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import DashboardEmpresa from './DashboardEmpresa'
import { logout } from '@/src/lib/actions/auth'

export default async function EmpresaPage() {
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

  // 1. Obtener sesión
  const { data: { session } } = await supabase.auth.getSession()

  // 2. Obtener perfil de la empresa
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', session?.user.id)
    .maybeSingle()

  // Si no está registrada la empresa en absoluto
  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200 space-y-6">
          <span className="text-6xl block">🏢</span>
          <h1 className="text-2xl font-black text-gray-800">Perfil No Encontrado</h1>
          <p className="text-sm text-gray-500 leading-relaxed">Tu cuenta no tiene una empresa asociada en el sistema de UNIPAZ.</p>
          <form action={logout}>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 3. Bloqueo si está en estado 'pending' o 'rejected'
  if (company.status === 'pending' || company.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 space-y-6">
          {company.status === 'pending' ? (
            <>
              <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-4xl font-bold mx-auto border border-amber-200">⏳</div>
              <h1 className="text-2xl font-black text-gray-800">Empresa en Revisión</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                ¡Gracias por registrar tu empresa <strong>"{company.company_name}"</strong>! 
                Tu solicitud con NIT <strong>{company.nit}</strong> se encuentra en estado <strong>Pendiente de Aprobación</strong> por el Administrador de UNIPAZ.
              </p>
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 font-semibold">
                Te notificaremos por correo electrónico una vez que tu cuenta sea aprobada para publicar vacantes.
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-4xl font-bold mx-auto border border-red-200">❌</div>
              <h1 className="text-2xl font-black text-gray-800">Solicitud Rechazada</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                Tu solicitud de registro para la empresa <strong>"{company.company_name}"</strong> ha sido rechazada por la administración de UNIPAZ.
              </p>
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-semibold">
                Si consideras que esto es un error, por favor ponte en contacto directo con soporte institucional.
              </p>
            </>
          )}

          <div className="pt-4 border-t border-gray-100">
            <form action={logout}>
              <button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm">
                🚪 Salir / Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // 4. Si está aprobada, cargar los datos de vacantes y postulaciones
  // Consultar vacantes de la empresa
  const { data: vacantes } = await supabase
    .from('job_postings')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  const vacanteIds = vacantes?.map(v => v.id) || []

  // Consultar postulaciones de las vacantes de esta empresa
  let applications: any[] = []
  let studentProfiles: any[] = []

  if (vacanteIds.length > 0) {
    const { data: apps } = await supabase
      .from('applications')
      .select('*, job_postings(title), users(name, email)')
      .in('job_posting_id', vacanteIds)
      .order('created_at', { ascending: false })

    if (apps) {
      applications = apps
      const studentIds = apps.map(a => a.user_id)
      
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from('student_profiles')
          .select('*')
          .in('user_id', studentIds)
        
        if (profiles) {
          studentProfiles = profiles
        }
      }
    }
  }

  // Combinar postulaciones con perfiles de estudiantes en memoria de forma segura
  const applicationsWithProfiles = applications.map(app => {
    const profile = studentProfiles.find(p => p.user_id === app.user_id)
    return {
      ...app,
      student_profile: profile || null
    }
  })

  return (
    <DashboardEmpresa 
      company={company}
      vacantes={vacantes || []}
      applications={applicationsWithProfiles}
      email={session?.user.email || ''}
    />
  )
}
