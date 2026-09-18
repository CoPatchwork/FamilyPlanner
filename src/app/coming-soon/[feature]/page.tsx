import Link from "next/link";

const FEATURES: Record<string, { title: string; phase: string }> = {
  kalender: { title: "Familienkalender", phase: "P1" },
  einkaufsliste: { title: "Einkaufsliste", phase: "P1" },
  rezepte: { title: "Rezepte & Wochenplan", phase: "P2" },
  "family-dates": { title: "Family Date Nights", phase: "P2" },
};

export default function ComingSoonPage({
  params,
}: {
  params: { feature: string };
}) {
  const feature = FEATURES[params.feature] ?? {
    title: "Feature",
    phase: "später",
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <Link href="/dashboard" className="self-start text-sm text-blue-600">
        ← Zurück zum Dashboard
      </Link>
      <h1 className="text-2xl font-semibold">{feature.title}</h1>
      <p className="text-slate-500">
        Dieser Bereich kommt in Phase {feature.phase}. Aktuell ist hier nur ein
        Platzhalter.
      </p>
    </main>
  );
}
