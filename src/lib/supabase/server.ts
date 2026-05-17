import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createServerClient() {
  const cookieStore = cookies();
  const token = cookieStore.get("supabase-auth-token");

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token.value}` } : {},
    },
  });
}
