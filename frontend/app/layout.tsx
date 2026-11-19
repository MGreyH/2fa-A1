import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Offline Auth", description: "Local-only multi-factor authentication demo" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
