'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Función interna para conectar con Supabase respetando las cookies
async function getSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
}

// 1. INICIAR SESIÓN O REGISTRARSE CON GOOGLE (Para Estudiantes)
export async function loginWithGoogle() {
  const supabase = await getSupabaseClient()
  
  // Solicitamos el flujo de Google Auth
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Url a la que volverá Supabase tras iniciar sesión en Google
      redirectTo: 'http://localhost:3000/auth/callback', 
    },
  })

  if (error) redirect('/login?error=oauth_failed')
  if (data.url) redirect(data.url) // Redirige al flujo seguro de Google
}

// 2. REGISTRO TRADICIONAL (Para Empresas Nuevas)
export async function registrarEmpresa(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const companyName = formData.get('company_name') as string
  const nit = formData.get('nit') as string

  if (!email || !password || !companyName || !nit) {
    redirect('/registro?error=missing_fields')
  }

  const supabase = await getSupabaseClient()

  // Guardamos los datos de la empresa en los metadatos para que el Trigger los pase a las tablas públicas
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: companyName,
        role: 'company',
        nit: nit
      }
    }
  })

  if (error) redirect(`/registro?error=${encodeURIComponent(error.message)}`)
  
  redirect('/login?message=registered_check_email')
}

export async function loginWithCredentials(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=missing_fields')
  }

  const supabase = await getSupabaseClient()

  // Intentamos iniciar sesión en Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Si las credenciales están mal o el correo no se ha verificado, volvemos con error
  if (error) {
    redirect('/login?error=invalid_credentials')
  }

  // Si todo está bien, revisamos su rol en la tabla pública para saber a dónde mandarlo
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const role = userData?.role

  // Redirección inteligente según el rol que tenga en la base de datos
  if (role === 'admin') {
    redirect('/admin')
  } else if (role === 'company') {
    redirect('/empresa')
  } else {
    redirect('/estudiante')
  }
}

// 3. CERRAR SESIÓN
export async function logout() {
  const supabase = await getSupabaseClient()
  await supabase.auth.signOut()
  redirect('/')
}