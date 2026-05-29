'use server'

import { supabaseAdmin } from '../supabase'
import { revalidatePath } from 'next/cache'

// 1. Acción para que una Empresa publique una vacante
export async function crearVacante(formData: FormData, companyId: number) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const modality = formData.get('modality') as string
  const deadline = formData.get('deadline') as string

  if (!title || !description || !modality || !deadline) {
    return { error: 'Todos los campos son obligatorios.' }
  }

  const { error } = await supabaseAdmin
    .from('job_postings')
    .insert([
      { 
        company_id: companyId, 
        title, 
        description, 
        modality, 
        deadline, 
        status: 'active' 
      }
    ])

  if (error) return { error: error.message }

  // Limpia la caché de la página principal para que aparezca la nueva vacante al instante
  revalidatePath('/')
  revalidatePath('/empresa')
  return { success: true }
}

// 2. Acción para que un Estudiante se postule a una vacante
export async function postularAVacante(userId: string, jobPostingId: number, coverLetter: string) {
  if (!coverLetter) {
    return { error: 'Por favor, escribe una breve carta de presentación.' }
  }

  const { error } = await supabaseAdmin
    .from('applications')
    .insert([
      {
        user_id: userId,
        job_posting_id: jobPostingId,
        cover_letter: coverLetter,
        status: 'pending'
      }
    ])

  if (error) {
    if (error.code === '23505') {
      return { error: 'Ya te has postulado previamente a esta oferta laboral.' }
    }
    return { error: error.message }
  }

  revalidatePath('/estudiante')
  revalidatePath('/empresa')
  return { success: true }
}

// 3. Acción para guardar/actualizar el Perfil del Estudiante (incluye subir PDF CV a Supabase Storage)
export async function guardarPerfilEstudiante(formData: FormData, userId: string) {
  const studentCode = formData.get('student_code') as string
  const program = formData.get('program') as string
  const semester = formData.get('semester') as string
  const cvFile = formData.get('cv') as File | null

  if (!studentCode || !program || !semester) {
    return { error: 'Todos los campos de texto son obligatorios.' }
  }

  let cvUrl = formData.get('current_cv_url') as string || ''

  // Subir el PDF si se proporcionó uno nuevo
  if (cvFile && cvFile.size > 0 && cvFile.name) {
    try {
      const bytes = await cvFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `${userId}/${Date.now()}_${cvFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`

      // Subimos a un bucket llamado 'cvs' (crear en Supabase si no existe)
      const { data, error: uploadError } = await supabaseAdmin.storage
        .from('cvs')
        .upload(fileName, buffer, {
          contentType: 'application/pdf',
          upsert: true
        })

      if (uploadError) {
        // Intentar crear el bucket por si no está creado
        await supabaseAdmin.storage.createBucket('cvs', { public: true })
        
        // Reintentar subida
        const { data: retryData, error: retryError } = await supabaseAdmin.storage
          .from('cvs')
          .upload(fileName, buffer, {
            contentType: 'application/pdf',
            upsert: true
          })
          
        if (retryError) {
          return { error: 'Error al subir la hoja de vida: ' + retryError.message }
        }
        
        const { data: { publicUrl } } = supabaseAdmin.storage.from('cvs').getPublicUrl(fileName)
        cvUrl = publicUrl
      } else {
        const { data: { publicUrl } } = supabaseAdmin.storage.from('cvs').getPublicUrl(fileName)
        cvUrl = publicUrl
      }
    } catch (e: any) {
      return { error: 'Error procesando el archivo PDF: ' + e.message }
    }
  }

  if (!cvUrl) {
    return { error: 'Debes subir una hoja de vida en PDF.' }
  }

  // Guardar en student_profiles (upsert por user_id)
  const { error: dbError } = await supabaseAdmin
    .from('student_profiles')
    .upsert({
      user_id: userId,
      student_code: studentCode,
      program,
      semester,
      cv_url: cvUrl,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

  if (dbError) {
    return { error: 'Error al guardar el perfil: ' + dbError.message }
  }

  revalidatePath('/estudiante')
  revalidatePath('/estudiante/perfil')
  return { success: true }
}

// 4. Acción para cambiar el estado de postulación de un candidato (Empresa)
export async function cambiarEstadoPostulacion(applicationId: number, status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected') {
  const { error } = await supabaseAdmin
    .from('applications')
    .update({ status })
    .eq('id', applicationId)

  if (error) return { error: error.message }

  revalidatePath('/empresa')
  revalidatePath('/estudiante')
  return { success: true }
}

// 5. Acción para aprobar/rechazar una Empresa (Administrador)
export async function aprobarEmpresa(companyId: number, status: 'approved' | 'rejected' | 'pending') {
  const { error } = await supabaseAdmin
    .from('companies')
    .update({ status })
    .eq('id', companyId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

// 6. Acción para activar/desactivar un Usuario (Administrador)
export async function toggleActivarUsuario(userId: string, active: boolean) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ active })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}