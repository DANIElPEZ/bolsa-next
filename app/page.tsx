import { supabase } from '@/src/lib/supabase'
import Link from 'next/link'

interface SearchParams {
  search?: string
  modality?: string
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedParams = await searchParams
  const query = resolvedParams?.search || ''
  const modality = resolvedParams?.modality || ''

  // Consulta a Supabase trayendo la vacante y la empresa vinculada
  let dbQuery = supabase
    .from('job_postings')
    .select('*, companies(company_name, logo_url)')
    .eq('status', 'active')

  if (query) dbQuery = dbQuery.ilike('title', `%${query}%`)
  if (modality) dbQuery = dbQuery.eq('modality', modality)

  const { data: vacantes } = await dbQuery

  // Contadores para las tarjetas informativas superiores
  const totalVacantes = vacantes?.length || 0
  const totalRemotas = vacantes?.filter(v => v.modality === 'remote').length || 0
  const totalPresenciales = vacantes?.filter(v => v.modality === 'onsite').length || 0

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* 1. BARRA LATERAL IZQUIERDA (Sidebar Verde UNIPAZ) */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col justify-between p-5 shadow-xl hidden md:flex">
        <div>
          {/* Logo / Sigla */}
          <div className="mb-8 border-b border-emerald-700 pb-4 text-center">
            <h1 className="text-2xl font-black tracking-widest text-emerald-300">UNIPAZ</h1>
            <p className="text-[10px] uppercase tracking-wider text-emerald-100 mt-1">Bolsa de Empleo</p>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-2">
            <Link href="/" className="flex items-center gap-3 bg-emerald-900 text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all shadow-sm">
              <span>💼</span> Inicio / Vacantes
            </Link>
            <Link href="/login" className="flex items-center gap-3 text-emerald-100 hover:bg-emerald-700 hover:text-white px-4 py-3 rounded-lg font-medium text-sm transition-all">
              <span>🔑</span> Iniciar Sesión
            </Link>
          </nav>
        </div>

        {/* Footer de la Barra Lateral */}
        <div className="text-[11px] text-emerald-200 text-center border-t border-emerald-700 pt-4">
          © {new Date().getFullYear()} - UNIPAZ IT
        </div>
      </aside>

      {/* 2. CONTENIDO PRINCIPAL DERECHO */}
      <div className="flex-1 flex flex-col">
        
        {/* BARRA SUPERIOR (Navbar Móvil / Usuario anónimo) */}
        <header className="bg-white h-16 shadow-sm border-b px-6 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-700 md:block hidden">Panel de Convocatorias Laborales</h2>
          <h2 className="text-lg font-bold text-emerald-800 md:hidden block">UNIPAZ Bolsa</h2>
          
          <Link 
            href="/login" 
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Acceder al Sistema
          </Link>
        </header>

        {/* ÁREA DE CONTENIDO */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* TARJETAS DE ESTADÍSTICAS SUPERIORES (Verde según la captura) */}
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
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opciones Remotas</p>
                <h3 className="text-2xl font-black text-gray-800 mt-1">{totalRemotas}</h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold">💻</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Presenciales / Sede</p>
                <h3 className="text-2xl font-black text-gray-800 mt-1">{totalPresenciales}</h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-bold">🏢</div>
            </div>
          </section>

          {/* FORMULARIO FILTRADO / BUSCADOR */}
          <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">¿Qué cargo buscas?</label>
                <input 
                  type="text" 
                  name="search" 
                  defaultValue={query}
                  placeholder="Ej: Desarrollador, Analista, Pasante..." 
                  className="p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Modalidad laboral</label>
                <select 
                  name="modality" 
                  defaultValue={modality} 
                  className="p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-all"
                >
                  <option value="">Todas las opciones</option>
                  <option value="onsite">Presencial</option>
                  <option value="remote">Remoto</option>
                  <option value="hybrid">Híbrido</option>
                </select>
              </div>

              <div className="flex items-end">
                <button 
                  type="submit" 
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white p-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
                >
                  Aplicar Filtros de Búsqueda
                </button>
              </div>
            </form>
          </section>

          {/* LISTADO DE CONVOCATORIAS ESTILO TABLA/TARJETA LIMPIA */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-gray-700 px-1">Convocatorias Disponibles</h3>

            {!vacantes || vacantes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-sm font-medium">No hay ofertas de empleo disponibles en este momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {vacantes.map((vacante) => (
                  <div 
                    key={vacante.id} 
                    className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center hover:border-emerald-300 transition-all gap-4"
                  >
                    {/* Información Izquierda */}
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                          {vacante.modality === 'onsite' ? 'Presencial' : vacante.modality === 'hybrid' ? 'Híbrido' : 'Remoto'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Publicado el {new Date(vacante.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-bold text-gray-900">{vacante.title}</h4>
                      <p className="text-sm font-semibold text-emerald-700">{vacante.companies?.company_name}</p>
                      <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{vacante.description}</p>
                    </div>

                    {/* Acciones e Información Derecha */}
                    <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-gray-100 gap-2">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Cierre de postulación</span>
                        <span className="text-xs text-red-600 font-bold">{vacante.deadline}</span>
                      </div>

                      <Link 
                        href={`/estudiante/postular/${vacante.id}`} 
                        className="bg-gray-900 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                      >
                        Aplicar Vacante
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  )
}