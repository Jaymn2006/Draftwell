import { supabase } from './supabase'

export type CloudChapter = {
  id: number
  title: string
  note: string
  body: string
  status: string
}

export type CloudSettings = {
  name: string
  role: string
  theme: 'light' | 'dark' | 'amber' | 'eye'
  accent: string
  font: 'serif' | 'sans'
  page: 'classic' | 'modern'
}

export type FeedbackPayload = {
  rating: number
  message: string
  kind: 'first-minute' | 'monthly' | 'quarterly'
}

export type UserSettings = CloudSettings

const projectKey = 'draftwell-cloud-project-id'

function getProjectId(userId: string) {
  const scopedKey = `${projectKey}:${userId}`
  const saved = localStorage.getItem(scopedKey)
  if (saved) return saved
  const id = crypto.randomUUID()
  localStorage.setItem(scopedKey, id)
  return id
}

export async function loadUserSettings() {
  if (!supabase) return null
  const { data, error } = await supabase.from('user_settings').select('*').maybeSingle()
  if (error) throw error
  return data as UserSettings | null
}

export async function saveUserSettings(settings: UserSettings) {
  if (!supabase) return
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  const userId = sessionData.session?.user.id
  if (!userId) throw new Error('You must be signed in to save settings.')
  const { error } = await supabase.from('user_settings').upsert({
    user_id: userId,
    ...settings,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function syncDraftToCloud(chapters: CloudChapter[], settings: CloudSettings) {
  if (!supabase) return { synced: false, reason: 'not-configured' as const }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError

  const user = sessionData.session?.user
  if (!user) throw new Error('Supabase did not return an authenticated user.')

  const projectId = getProjectId(user.id)
  const { error: projectError } = await supabase.from('projects').upsert({
    id: projectId,
    user_id: user.id,
    title: 'The Shape of Rain',
    settings,
    updated_at: new Date().toISOString(),
  })
  if (projectError) throw projectError

  const { error: deleteError } = await supabase.from('chapters').delete().eq('project_id', projectId)
  if (deleteError) throw deleteError

  const { error: chaptersError } = await supabase.from('chapters').insert(
    chapters.map((chapter, index) => ({
      project_id: projectId,
      chapter_number: index + 1,
      title: chapter.title,
      note: chapter.note,
      body: chapter.body,
      status: chapter.status,
    })),
  )
  if (chaptersError) throw chaptersError

  return { synced: true as const }
}

export async function submitFeedback(feedback: FeedbackPayload) {
  if (!supabase) return { synced: false, reason: 'not-configured' as const }
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  const user = sessionData.session?.user
  if (!user) throw new Error('Supabase did not return an authenticated user.')
  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    rating: feedback.rating,
    message: feedback.message,
    kind: feedback.kind,
  })
  if (error) throw error
  return { synced: true as const }
}
