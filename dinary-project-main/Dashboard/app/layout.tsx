// app/layout.tsx
import "./globals.css"; // Gardez vos styles globaux
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: "Dinary App",
  description: "Espace administrateur Dinary",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <title>Dinary App</title>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
