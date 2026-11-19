"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => { if (!sessionStorage.getItem("offline-auth-token")) router.replace("/login"); }, [router]);
  return <main className="mx-auto flex min-h-screen max-w-5xl items-center p-4 sm:p-8"><section className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-12"><ShieldCheck className="h-12 w-12 text-emerald-600" aria-hidden="true"/><p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Local verification complete</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Welcome to your intranet workspace.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Your second factor was calculated in your authenticator and verified by this local server. No external verification service was used.</p><Button className="mt-8" onClick={() => { sessionStorage.removeItem("offline-auth-token"); router.push("/login"); }}>Sign out</Button></section></main>;
}
