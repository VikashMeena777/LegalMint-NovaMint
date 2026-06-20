import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { logActivity } from "@/lib/activity-logger";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = createServerClient();
    
    // Get the current user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseServiceKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create service role client to delete the user
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Log the activity first
    await logActivity({
      userId: user.id,
      action: "auth.delete-account",
      metadata: { email: user.email },
    }).catch((err) => console.error("Logging delete-account failed:", err));

    // Delete BusinessProfile (cascade should handle mappings and documents if foreign keys are configured with ON DELETE CASCADE, but let's delete explicitly if needed)
    // Note: To be safe and avoid foreign key violations, we delete user business profiles first.
    const { error: profileError } = await supabaseAdmin
      .from("BusinessProfile")
      .delete()
      .eq("userId", user.id);

    if (profileError) {
      console.error("Error deleting business profile:", profileError);
      // Continue anyway, as we want to delete the auth user
    }

    // Delete the user from Supabase Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
