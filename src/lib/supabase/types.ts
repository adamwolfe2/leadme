// Temporary type helpers until Supabase types are properly generated

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export type TypedSupabaseClient = SupabaseClient<Database>
