import type { Metadata } from "next";

// Standalone, unlisted utility page. Not linked anywhere internally and kept
// out of search indexes — shared by direct link only.
export const metadata: Metadata = {
  title: "Companies",
  robots: { index: false, follow: false },
};

// `note` is optional so entries can gain a short note later without a refactor.
const COMPANIES: { name: string; note?: string }[] = [
  { name: "NExT Co-op Consulting" },
  { name: "Crestron" },
  { name: "Charles River Analytics" },
  { name: "Teradyne" },
  { name: "Stage Zero Health" },
  { name: "Ahold Delhaize USA" },
  { name: "FluidAI Medical" },
  { name: "Boeing Canada" },
  { name: "Delsys, Inc" },
  { name: "Mob" },
  { name: "Intuitive Motion.AI" },
  { name: "SlicPix" },
];

export default function InterestedPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Companies I&apos;m Interested In
        </h1>
        <ul className="mt-8 divide-y divide-gray-200">
          {COMPANIES.map((company) => (
            <li key={company.name} className="py-3">
              <span className="font-medium">{company.name}</span>
              {company.note && (
                <span className="text-gray-500"> — {company.note}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
