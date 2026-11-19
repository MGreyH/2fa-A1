const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.detail ?? "Local authentication request failed.");
  return payload as T;
}

export const authApi = {
  register: (body: { name: string; email: string; password: string }) => request<{ message: string; qrSvg: string }>("/auth/register", body),
  login: (body: { email: string; password: string; method: "totp" | "hotp" | "fido2" }) => request<{ status: string; method: string }>("/auth/login", body),
  verify: (method: "totp" | "hotp", body: { email: string; code: string }) => request<{ token: string; message: string }>(`/auth/verify/${method}`, body),
  fido2Options: () => request("/auth/fido2/options", {}),
};
