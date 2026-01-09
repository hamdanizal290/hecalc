import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-black/20 p-8">
        <div className="text-sm opacity-70">API 650 Tank Calculator</div>
        <h1 className="text-3xl font-semibold mt-2">
          TankCalc <span className="opacity-70">Web App</span>
        </h1>
        <p className="mt-3 opacity-80 leading-relaxed">
          Web app interaktif untuk perhitungan tangki (SI/US), hasil tabel course, dan export report.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/calculator"
            className="px-4 py-2 rounded-xl bg-white text-black font-medium"
          >
            Buka Kalkulator
          </Link>
          <Link
            href="/about"
            className="px-4 py-2 rounded-xl border border-white/15"
          >
            Info
          </Link>
        </div>
      </div>
    </main>
  );
}
