import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const newHero = localFont({
  variable: "--font-new-hero",
  display: "swap",
  src: [
    { path: "./fonts/New_Hero_Medium.otf", weight: "400 500", style: "normal" },
    { path: "./fonts/New_Hero_SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/New_Hero_Bold.otf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Lucky Dreams - Streamer's Wager Race", 
  description: "Exclusive prizes to be won.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${newHero.variable} ${newHero.className} antialiased min-h-screen flex flex-col overflow-x-hidden`}>
        <div className="flex-grow flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}