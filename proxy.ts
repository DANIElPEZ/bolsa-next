import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Inicializar cliente temporal de Supabase dentro de las cookies del Middleware
  let response = NextResponse.next({ request })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // 2. Comprobar si hay una sesión activa de Supabase Auth
  const { data: { session } } = await supabase.auth.getSession()

  // Si no está logueado y quiere entrar a paneles privados, va directo a /login
  if (!session && (pathname.startsWith('/estudiante') || pathname.startsWith('/empresa') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session) {
    // 3. Consultar el rol del usuario en tu tabla pública
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const userRole = userData?.role

    // Redirigir si ya está logueado e intenta volver a entrar al Login
    if (pathname === '/login') {
      if (userRole === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
      if (userRole === 'company') return NextResponse.redirect(new URL('/empresa', request.url))
      return NextResponse.redirect(new URL('/estudiante', request.url))
    }

    // 4. Protección estricta de rutas por roles
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (pathname.startsWith('/empresa') && userRole !== 'company') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    if (pathname.startsWith('/estudiante') && userRole !== 'student') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

// Configurar sobre qué rutas se ejecutará el Middleware automáticamente
export const config = {
  matcher: ['/login', '/estudiante/:path*', '/empresa/:path*', '/admin/:path*'],
}
