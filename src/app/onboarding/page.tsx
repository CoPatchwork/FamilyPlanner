"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// P0-Onboarding: Der erste Nutzer erstellt ein Household, der zweite tritt
// per Einladungscode bei. Ein dritter Nutzer wird von redeem_invite()
// abgelehnt (Akzeptanzkriterium Abschnitt 8).
export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.rpc("create_household", {
      household_name: householdName,
    });

    setLoading(false);
    if (error) {
      setError(translateError(error.message));
      return;
    }
    router.push("/dashboard");
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.rpc("redeem_invite", {
      invite_code: inviteCode.trim(),
    });

    setLoading(false);
    if (error) {
      setError(translateError(error.message));
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-semibold">Willkommen!</h1>

        {mode === "choose" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white"
            >
              Neuen Familien-Haushalt erstellen
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 font-medium"
            >
              Einladungscode eingeben
            </button>
          </div>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              required
              placeholder="Name eures Haushalts, z. B. Familie Müller"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50"
            >
              {loading ? "Wird erstellt…" : "Haushalt erstellen"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}

        {mode === "join" && (
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              required
              placeholder="Einladungscode, z. B. A1B2C3D4"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 uppercase outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50"
            >
              {loading ? "Wird geprüft…" : "Haushalt beitreten"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}

function translateError(message: string): string {
  if (message.includes("household_full")) {
    return "Dieser Haushalt hat bereits 2 Mitglieder. Ein weiterer Beitritt ist nicht möglich.";
  }
  if (message.includes("invalid_or_expired_code")) {
    return "Der Einladungscode ist ungültig oder abgelaufen.";
  }
  if (message.includes("user_already_in_household")) {
    return "Du gehörst bereits einem Haushalt an.";
  }
  return message;
}
