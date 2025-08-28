import { createClient } from '@supabase/supabase-js'

// Substitua pelos dados do seu projeto Supabase
const SUPABASE_URL = "https://gyxojmactnrjlrlqhehx.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eG9qbWFjdG5yamxybHFoZWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzOTkwOTIsImV4cCI6MjA3MTk3NTA5Mn0.6Um-8GzmaXc8wtkuxuzzI7RFyJlStfy53WUVKEot2dg"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
