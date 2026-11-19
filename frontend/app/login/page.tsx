"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";

type Method = "totp" | "hotp" | "fido2";
const methodCopy: Record<Method, { title: string; description: string }> = { totp: { title: "TOTP", description: "Six-digit code that changes every 30 seconds." }, hotp: { title: "HOTP", description: "Six-digit counter-based code from your authenticator." }, fido2: { title: "FIDO2", description: "Security key or platform passkey (requires local HTTPS)." } };

export default function LoginPage() {
  const router = useRouter(); const [method, setMethod] = useState<Method>("totp"); const [error, setError] = useState(""); const [working, setWorking] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setWorking(true); const values = new FormData(event.currentTarget); const email = String(values.get("email")); try { await authApi.login({ email, password: String(values.get("password")), method }); if (method === "fido2") await authApi.fido2Options(); router.push(`/verify?email=${encodeURIComponent(email)}&method=${method}`); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to start local sign-in."); } finally { setWorking(false); } }
  return <AuthShell title="Sign in" detail="Choose the offline verification method enrolled for your account."><form onSubmit={submit} className="mt-8 space-y-5"><div><label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label><Input id="email" name="email" type="email" autoComplete="email" required /></div><div><label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label><Input id="password" name="password" type="password" autoComplete="current-password" required /></div><fieldset><legend className="mb-3 text-sm font-medium">Verification method</legend><div className="grid gap-2">{(Object.keys(methodCopy) as Method[]).map((key) => <label key={key} className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${method === key ? "border-sky-600 bg-sky-50" : "border-slate-200"}`}><input className="mt-1 h-4 w-4 accent-sky-700" type="radio" name="method" value={key} checked={method === key} onChange={() => setMethod(key)} /><span><span className="block font-semibold">{methodCopy[key].title}</span><span className="block text-sm text-slate-600">{methodCopy[key].description}</span></span></label>)}</div></fieldset>{error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>}<Button className="w-full" disabled={working}>{working ? "Checking…" : "Continue securely"}</Button><p className="text-center text-sm text-slate-600">New here? <Link className="font-semibold text-sky-700 underline" href="/register">Create an account</Link></p></form></AuthShell>;
}
