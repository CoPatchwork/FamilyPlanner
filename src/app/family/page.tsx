import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { FamilyMember } from "@/lib/types";

// Übersicht aller Familienmitglieder (Erwachsene + Kinder) des Households.
export default async function FamilyPage() {
  const supabase = createClient();
  const { data: members } = await supabase
    .from("family_members")
    .select("*")
    .order("type", { ascending: false })
    .order("name");

  const adults = (members as FamilyMember[] | null)?.filter(
    (m) => m.type === "adult"
  );
  const children = (members as FamilyMember[] | null)?.filter(
    (m) => m.type === "child"
  );

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600">
            ← Zurück zum Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">Familienprofile</h1>
        </div>
        <Link
          href="/family/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          + Hinzufügen
        </Link>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-medium uppercase text-slate-500">
          Erwachsene
        </h2>
        <MemberList members={adults} emptyText="Noch keine Erwachsenen erfasst." />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium uppercase text-slate-500">
          Kinder
        </h2>
        <MemberList members={children} emptyText="Noch keine Kinder erfasst." />
      </section>
    </main>
  );
}

function MemberList({
  members,
  emptyText,
}: {
  members?: FamilyMember[];
  emptyText: string;
}) {
  if (!members || members.length === 0) {
    return <p className="text-sm text-slate-400">{emptyText}</p>;
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {members.map((m) => (
        <li key={m.id}>
          <Link
            href={`/family/${m.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
          >
            <span className="font-medium">{m.name}</span>
            {m.birth_date && (
              <span className="text-sm text-slate-400">
                {new Date(m.birth_date).toLocaleDateString("de-AT")}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
