import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/src/lib/supabase'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Si la URL contiene el código de intercambio de Supabase
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    
    // Intercambia el código por tokens de sesión reales
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Verificar si el usuario ya tiene fila en la tabla pública de users
      const { data: publicUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!publicUser) {
        const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Estudiante'
        
        // Crear fila de usuario estudiante de forma defensiva
        await supabaseAdmin
          .from('users')
          .insert({
            id: data.user.id,
            name: name,
            email: data.user.email,
            role: 'student',
            active: true
          })
      }

      // Redirige directo al dashboard del estudiante
      return NextResponse.redirect(`${origin}/estudiante`)
    }
  }

  // Si algo falla, lo bota al login con error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}