import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

let supabaseAdminInstance: ReturnType<typeof createClient<Database>> | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    supabaseAdminInstance = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminInstance;
}

interface LogActivityParams {
  userId: string;
  action: string;
  resourceId?: string | null;
  resourceType?: string | null;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  const {
    userId,
    action,
    resourceId = null,
    resourceType = null,
    metadata = {},
    ipAddress = null,
    userAgent = null,
  } = params;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from("AuditLog").insert({
      userId,
      action,
      resourceId,
      resourceType,
      metadata,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to insert audit log:", error.message);
    }
  } catch (err) {
    console.error("Error in logActivity:", err);
  }
}
