"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";

function VerifyForm() {
  const router = useRouter(); const search = useSearchParams(); const email = search.get("email") ?? ""; const method = search.get("method"); const [error, setError] = useState(""); const [working, setWorking] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (method !== "totp" && method !== "hotp") { setError("FIDO2 is ready for local WebAuthn configuration but is not enabled yet."); return; } setWorking(true); setError(""); try { const form = new FormData(event.currentTarget); const result = await authApi.verify(method, { email, code: String(form.get("code")) }); sessionStorage.setItem("offline-auth-token", result.token); router.push("/home"); } catch (reason) { setError(reason instanceof Error ? reason.message : "Code verification failed."); } finally { setWorking(false); } }
  return <AuthShell title="Verify locally" detail={method === "hotp" ? "Enter the next unused counter-based code from your authenticator." : method === "fido2" ? "FIDO2 local WebAuthn setup is pending." : "Enter the current six-digit code from your authenticator."}><form onSubmit={submit} className="mt-8 space-y-5"><div><label htmlFor="code" className="mb-2 block text-sm font-medium">Six-digit verification code</label><Input id="code" name="code" inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" maxLength={6} required /></div>{error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>}<Button className="w-full" disabled={working || method === "fido2"}>{working ? "Verifying…" : "Verify on this server"}</Button></form></AuthShell>;
}

export default function VerifyPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center text-slate-600">Loading verification…</main>}><VerifyForm /></Suspense>;
}
