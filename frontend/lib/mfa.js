const methods = new Set(["totp", "hotp", "fido2"]);

export function assertMfaMethod(method) {
  if (!methods.has(method)) {
    throw new Error("Unsupported authentication method");
  }
  return method;
}
