import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import DashboardAdmin from './DashboardAdmin'

export default async function AdminPage() {
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

  // 1. Obtener la sesión activa
  const { data: { session } } = await supabase.auth.getSession()

  // 2. Obtener todas las empresas registradas
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('updated_at', { ascending: false })

  // 3. Obtener todos los usuarios registrados en el sistema
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  // 4. Obtener todas las vacantes publicadas
  const { data: jobPostings } = await supabase
    .from('job_postings')
    .select('*, companies(company_name)')
    .order('created_at', { ascending: false })

  return (
    <DashboardAdmin 
      email={session?.user.email || ''}
      companies={companies || []}
      users={users || []}
      jobPostings={jobPostings || []}
    />
  )
}
