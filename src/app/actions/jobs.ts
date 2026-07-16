//app/actions/jobs.ts

'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function markJobComplete(formData: FormData) {
  const jobId = formData.get('jobId') as string
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('jobs')
    .update({ status: 'closed' }) 
    .eq('id', jobId)
    .eq('employer_id', user.id)

  if (error) {
    console.error('Error closing job:', error)
    throw new Error('Failed to close job')
  }

  revalidatePath('/')
  revalidatePath(`/jobs/${jobId}`)
  redirect('/history')
}