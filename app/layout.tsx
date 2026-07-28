import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "Word Rally — Classroom English Game",
    description: "A fast, friendly team game for learning English together.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Word Rally — Classroom English Game",
      description: "Build a team, pick a number, and win points with your English.",
      type: "website",
      images: [{ url: "/og.png", width: 1734, height: 948, alt: "Word Rally — Ready, set, speak!" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Word Rally — Classroom English Game",
      description: "Build a team, pick a number, and win points with your English.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
