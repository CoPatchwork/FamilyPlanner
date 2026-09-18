"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { FamilyMember } from "@/lib/types";

// Ein Formular für Erstellen UND Bearbeiten eines Familienmitglieds.
// `existing` gesetzt = Edit-Modus (inkl. Löschen-Button).
export default function FamilyMemberForm({
  existing,
}: {
  existing?: FamilyMember;
}) {
  const router = useRouter();
  const [type, setType] = useState<"adult" | "child">(
    existing?.type ?? "child"
  );
  const [name, setName] = useState(existing?.name ?? "");
  const [birthDate, setBirthDate] = useState(existing?.birth_date ?? "");
  const [interests, setInterests] = useState(
    existing?.interests?.join(", ") ?? ""
  );
  const [clothingSize, setClothingSize] = useState(
    existing?.clothing_size ?? ""
  );
  const [shoeSize, setShoeSize] = useState(existing?.shoe_size ?? "");
  const [giftIdeas, setGiftIdeas] = useState(existing?.gift_ideas ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      type,
      name,
      birth_date: birthDate || null,
      interests: interests
        ? interests.split(",").map((s) => s.trim()).filter(Boolean)
        : null,
      clothing_size: clothingSize || null,
      shoe_size: shoeSize || null,
      gift_ideas: giftIdeas || null,
      notes: notes || null,
    };

    const { error } = existing
      ? await supabase
          .from("family_members")
          .update(payload)
          .eq("id", existing.id)
      : await supabase.from("family_members").insert({
          ...payload,
          household_id: (
            await supabase
              .from("profiles")
              .select("household_id")
              .single()
          ).data?.household_id,
        });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/family");
    router.refresh();
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm(`${existing.name} wirklich löschen?`)) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("family_members")
      .delete()
      .eq("id", existing.id);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/family");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("adult")}
          className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${
            type === "adult"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-300"
          }`}
        >
          Erwachsene*r
        </button>
        <button
          type="button"
          onClick={() => setType("child")}
          className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${
            type === "child"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-300"
          }`}
        >
          Kind
        </button>
      </div>

      <Field label="Name">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
        />
      </Field>

      <Field label="Geburtsdatum">
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
        />
      </Field>

      <Field label="Interessen (Komma-getrennt)">
        <input
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="Dinosaurier, Fußball, Malen"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
        />
      </Field>

      {type === "child" && (
        <>
          <Field label="Kleidergröße">
            <input
              value={clothingSize}
              onChange={(e) => setClothingSize(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
            />
          </Field>
          <Field label="Schuhgröße">
            <input
              value={shoeSize}
              onChange={(e) => setShoeSize(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
            />
          </Field>
          <Field label="Geschenkideen">
            <textarea
              value={giftIdeas}
              onChange={(e) => setGiftIdeas(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
              rows={2}
            />
          </Field>
        </>
      )}

      <Field label="Notizen">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
          rows={2}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Wird gespeichert…" : "Speichern"}
        </button>
        {existing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg border border-red-300 px-4 py-3 font-medium text-red-600"
          >
            Löschen
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}
