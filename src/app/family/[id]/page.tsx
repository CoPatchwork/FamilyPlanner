import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FamilyMemberForm from "@/components/FamilyMemberForm";
import type { FamilyMember } from "@/lib/types";

export default async function EditFamilyMemberPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: member } = await supabase
    .from("family_members")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!member) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-10">
      <Link href="/family" className="text-sm text-blue-600">
        ← Zurück zur Übersicht
      </Link>
      <h1 className="text-2xl font-semibold">{(member as FamilyMember).name} bearbeiten</h1>
      <FamilyMemberForm existing={member as FamilyMember} />
    </main>
  );
}
