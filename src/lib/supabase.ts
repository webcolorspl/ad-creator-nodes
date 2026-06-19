import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface TemplateEntry {
  id: string
  name: string
  description: string
  tags: string[]
  sel_fmts: string[]
  created_at: string
  is_public: boolean
}

export async function fetchTemplates(): Promise<TemplateEntry[]> {
  const { data, error } = await supabase
    .from('banner_templates')
    .select('id, name, description, tags, sel_fmts, created_at, is_public')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as TemplateEntry[]
}

export async function fetchTemplateProject(id: string): Promise<unknown> {
  const { data, error } = await supabase
    .from('banner_templates')
    .select('project')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data.project
}
