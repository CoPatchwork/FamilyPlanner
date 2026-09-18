import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Root-Route entscheidet nur, wohin weitergeleitet wird:
// eingeloggt + Household vorhanden → Dashboard, sonst → Onboarding/Login.
export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("household_id")
    .eq("id", user.id)
    .single();

  if (!profile?.household_id) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
