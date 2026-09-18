import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { FamilyMember } from "@/lib/types";

// Dashboard v1 (P0-Scope, Spec Abschnitt 3): zeigt Datum + Familienmitglieder
// statisch (das Wechselmodell-Widget kommt erst in P1) sowie 4
// Quick-Action-Buttons zu Platzhalter-Screens für spätere Phasen.
export default async function DashboardPage() {
  const supabase = createClient();
  const { data: members } = await supabase
    .from("family_members")
    .select("*")
    .order("type", { ascending: false });

  const today = new Date().toLocaleDateString("de-AT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{today}</p>
          <h1 className="text-2xl font-semibold">Familien-Dashboard</h1>
        </div>
        <Link
          href="/household/invite"
          className="text-sm text-blue-600 underline"
        >
          Partner einladen
        </Link>
      </header>

      <section>
        <h2 className="mb-2 text-sm font-medium uppercase text-slate-500">
          Familie
        </h2>
        {members && members.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {(members as FamilyMember[]).map((m) => (
              <li
                key={m.id}
                className="rounded-full bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-slate-200"
              >
                {m.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">
            Noch keine Familienmitglieder erfasst.{" "}
            <Link href="/family/new" className="text-blue-600 underline">
              Jetzt hinzufügen
            </Link>
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium uppercase text-slate-500">
          Schnellzugriff
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction href="/coming-soon/kalender" label="Kalender" />
          <QuickAction href="/coming-soon/einkaufsliste" label="Einkaufsliste" />
          <QuickAction href="/coming-soon/rezepte" label="Rezepte & Wochenplan" />
          <QuickAction href="/coming-soon/family-dates" label="Family Date Nights" />
        </div>
      </section>

      <section>
        <Link href="/family" className="text-sm text-blue-600 underline">
          Familienprofile verwalten →
        </Link>
      </section>
    </main>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg bg-white p-4 text-center font-medium shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
    >
      {label}
    </Link>
  );
}
