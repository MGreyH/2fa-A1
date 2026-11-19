import assert from "node:assert/strict";
import test from "node:test";

let assertMfaMethod;
try {
  ({ assertMfaMethod } = await import("../lib/mfa.js"));
} catch {
  assertMfaMethod = undefined;
}

test("accepts the three local authentication choices", () => {
  assert.ok(assertMfaMethod, "MFA method guard must be exported");
  for (const method of ["totp", "hotp", "fido2"]) {
    assert.equal(assertMfaMethod(method), method);
  }
});

test("rejects unrecognized authentication choices", () => {
  assert.ok(assertMfaMethod, "MFA method guard must be exported");
  assert.throws(() => assertMfaMethod("sms"), /Unsupported authentication method/);
});
