import "./globals.css";

export const metadata = {
  title: "TankCalc Web App",
  description: "API 650 Tank Calculator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* JANGAN kasih bg-white di body, biar theme di globals.css kepake */}
      <body>{children}</body>
    </html>
  );
}
