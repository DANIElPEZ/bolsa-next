import { registrarEmpresa } from '@/src/lib/actions/auth'
import Link from 'next/link'

interface SearchParams {
  error?: string
}

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedParams = await searchParams
  const error = resolvedParams?.error || ''

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto w-full max-w-md text-center">
        <h1 className="text-3xl font-black tracking-widest text-emerald-800">UNIPAZ</h1>
        <h2 className="mt-4 text-xl font-bold text-gray-900">Registro de Empresas Aliadas</h2>
        <p className="text-xs text-gray-500 mt-1">Crea una cuenta para empezar a publicar tus ofertas</p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-xl sm:px-10">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg">
              ❌ Error: {error}
            </div>
          )}

          <form action={registrarEmpresa} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Nombre de la Empresa</label>
              <input
                name="company_name"
                type="text"
                required
                placeholder="Ej: Tech Solutions S.A.S"
                className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">NIT / Identificación Fiscal</label>
              <input
                name="nit"
                type="text"
                required
                placeholder="Ej: 901.234.567-1"
                className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Correo Electrónico Corporativo</label>
              <input
                name="email"
                type="email"
                required
                placeholder="contacto@empresa.com"
                className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none text-sm bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Contraseña de Acceso</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none text-sm bg-gray-50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-colors"
            >
              Registrar Empresa
            </button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100 mt-4">
            <p className="text-xs text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="font-bold text-emerald-700 hover:text-emerald-900">
                Inicia sesión aquí
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}