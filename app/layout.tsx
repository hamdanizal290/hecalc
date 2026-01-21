import "./globals.css";

export const metadata = {
  title: "HECalc - RE Mechanical",
  description: "Heat exchanger design calculator (Shell & Tube) — internal tool Rekayasa Engineering.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-[rgb(var(--re-ink))]">
        {children}
      </body>
    </html>
  );
}
