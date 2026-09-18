"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Erzeugt einen Einladungscode für den Partner. create_invite() lehnt ab,
// wenn der Haushalt bereits 2 Mitglieder hat.
export default function InvitePage() {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateCode() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_invite");
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("household_full")
          ? "Euer Haushalt hat bereits 2 Mitglieder – ein weiterer Code ist nicht nötig."
          : error.message
      );
      return;
    }
    setCode(data as string);
  }

  return (
    <main className="mx-auto max-w-sm space-y-6 px-4 py-10">
      <Link href="/dashboard" className="text-sm text-blue-600">
        ← Zurück zum Dashboard
      </Link>
      <h1 className="text-2xl font-semibold">Partner einladen</h1>
      <p className="text-slate-500">
        Erzeuge einen Code und teile ihn mit deinem Partner / deiner Partnerin.
        Er/sie gibt ihn beim Onboarding unter „Einladungscode eingeben“ ein.
      </p>

      {code ? (
        <div className="rounded-lg bg-blue-50 p-6 text-center">
          <p className="text-sm text-slate-500">Euer Einladungscode</p>
          <p className="mt-2 text-3xl font-mono font-bold tracking-widest">
            {code}
          </p>
          <p className="mt-2 text-xs text-slate-500">Gültig für 14 Tage</p>
        </div>
      ) : (
        <button
          onClick={generateCode}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Wird erstellt…" : "Code generieren"}
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}
