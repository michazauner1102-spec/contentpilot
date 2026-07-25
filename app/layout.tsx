import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DemoModeBanner } from "@/components/shell/DemoModeBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContentPilot — 30-Tage Content Demo",
  description:
    "Öffentliche Demo: Plan-Setup, Kalender, Metriken, Monats-Feedback und Plan v2 (Mock-Daten).",
  openGraph: {
    title: "ContentPilot Demo",
    description: "30-Tage Social-Video-Loop — live ausprobieren.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("contentpilot.theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <DemoModeBanner />
        {children}
      </body>
    </html>
  );
}
