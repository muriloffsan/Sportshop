import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://seu-projeto.supabase.co' // Substitua pela sua URL
const supabaseAnonKey = 'sua-chave-anon-publica' // Substitua pela sua chave anônima

export const supabase = createClient(supabaseUrl, supabaseAnonKey)