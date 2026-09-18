import Link from "next/link";
import FamilyMemberForm from "@/components/FamilyMemberForm";

export default function NewFamilyMemberPage() {
  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-10">
      <Link href="/family" className="text-sm text-blue-600">
        ← Zurück zur Übersicht
      </Link>
      <h1 className="text-2xl font-semibold">Familienmitglied hinzufügen</h1>
      <FamilyMemberForm />
    </main>
  );
}
