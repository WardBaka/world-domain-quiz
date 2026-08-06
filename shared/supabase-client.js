import {
    createClient
} from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
    "https://ihigbizcbkzdmthbfqhc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_vASYkLUn0VpEZ4_l3gWoCQ_s-_zfFw2";

export const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );