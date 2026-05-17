import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  await supabase.auth.signOut();
  redirect("/login");
}
