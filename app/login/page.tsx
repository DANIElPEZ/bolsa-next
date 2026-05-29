import Link from 'next/link'
import { loginWithGoogle, loginWithCredentials } from '@/src/lib/actions/auth'

interface SearchParams {
  error?: string
  message?: string
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const resolvedParams = await searchParams
  const message = resolvedParams?.message || ''
  const error = resolvedParams?.error || ''
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="text-3xl font-black tracking-widest text-emerald-800">
            UNIPAZ
          </Link>
          <h2 className="mt-6 text-center text-xl font-extrabold text-gray-900">
            Ingreso a la Bolsa de Empleo
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-xl sm:px-10 space-y-6">
          {message === 'registered_check_email' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
              ✅ ¡Registro exitoso! Por favor verifica tu correo antes de ingresar.
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg">
              ❌ Credenciales inválidas o error de conexión.
            </div>
          )}

            <form action={loginWithGoogle}>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="text-base">🌐</span> Ingresar con Correo UNIPAZ
              </button>
            </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-bold tracking-wider">O con tu cuenta tradicional</span>
            </div>
          </div>

          {/* 2. FORMULARIO PARA EMPRESAS Y ADMINISTRADORES */}
          <form action={loginWithCredentials} method="POST" className="space-y-4">
            <input type="hidden" name="action_type" value="login_credentials" />
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="text-black appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm bg-gray-50"
                />
              </div>
            </div>

            <div className="text-center pt-2 border-t border-gray-100">
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-colors"
              >
                Iniciar Sesión
              </button>
              <p className="text-xs text-gray-500">
              ¿Tu empresa no está registrada?{' '}
              <Link href="/registro" className="font-bold text-emerald-700 hover:text-emerald-900">
                Regístrala aquí
              </Link>
            </p>
            </div>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">
              ← Regresar a las ofertas de empleo
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}