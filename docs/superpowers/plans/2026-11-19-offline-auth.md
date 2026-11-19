# Offline Authentication Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Next.js/Python/MariaDB demo where a registered user selects TOTP, HOTP, or FIDO2 at login.

**Architecture:** The Next.js frontend hosts accessible register, login, verification, and home pages. A FastAPI service creates and verifies offline TOTP/HOTP values, returns a QR SVG for enrollment, and presents a FIDO2/WebAuthn-ready challenge boundary. Prisma defines MariaDB tables for users and each credential type.

**Tech Stack:** Next.js, TypeScript, Tailwind, shadcn-style components, FastAPI, Python standard-library HMAC, Prisma, MariaDB.

**Spec:** User-approved conversation request, 2026-11-19.

## Global Constraints

- Keep TOTP/HOTP secret generation and verification in `backend/`; never persist a secret in the browser.
- The frontend calls only the local Python API configured with `NEXT_PUBLIC_API_URL`.
- TOTP uses six digits and 30-second SHA-1 steps; HOTP advances its counter only after a valid code.
- FIDO2 is represented by an explicit local WebAuthn-ready endpoint and database model, not a fake success path.

## Review Focus

- Reject malformed or expired one-time passwords without leaking which digits were correct.
- Reject an invalid HOTP value without advancing its server-side counter.
- Display QR SVG from a backend enrollment payload only after successful registration.
- Keep keyboard labels, errors, and focus states visible on every auth form.
- Ensure a user cannot access the home route without an authenticated session token.

### Task 1: Offline Python authentication module

**Files:**
- Create: `backend/app/totp.py`, `backend/app/main.py`, `backend/tests/test_totp.py`

**Interfaces:**
- Produces: `generate_secret() -> str`, `totp_code(secret, timestamp) -> str`, `verify_totp(secret, code, timestamp) -> bool`, `hotp_code(secret, counter) -> str`.

- [ ] Write failing TOTP/HOTP tests for RFC-style deterministic code generation and invalid-code rejection.
- [ ] Run `pytest backend/tests/test_totp.py -q` and observe the missing-module failure.
- [ ] Implement the base32/HMAC calculation and FastAPI local endpoints.
- [ ] Run the Python tests and record passing output.

### Task 2: MariaDB/Prisma data contract

**Files:**
- Create: `database/prisma/schema.prisma`, `database/.env.example`, `database/README.md`

**Interfaces:**
- Produces: `User`, `TotpCredential`, `HotpCredential`, `Fido2Credential`, and `AuthSession` models.

- [ ] Create the schema containing encrypted-secret fields, HOTP counter, and FIDO2 credential metadata.
- [ ] Validate the Prisma schema with `prisma validate` when dependencies are installed.

### Task 3: Next.js/shadcn local authentication UI

**Files:**
- Create: `frontend/app/*`, `frontend/components/*`, `frontend/lib/api.ts`, `frontend/package.json`, `frontend/components.json`

**Interfaces:**
- Consumes: Python API routes `/auth/register`, `/auth/login`, `/auth/verify/totp`, `/auth/verify/hotp`, `/auth/fido2/options`.
- Produces: register, login, MFA verification, and protected home screens.

- [ ] Write a failing UI/API-client test for selecting TOTP/HOTP/FIDO2 and rejecting unsupported values.
- [ ] Implement focused shadcn-style controls and pages with client-side local API calls.
- [ ] Build the Next.js app and verify no TypeScript errors.

### Task 4: Setup and operator documentation

**Files:**
- Create: `README.md`, `backend/requirements.txt`, `frontend/.env.local.example`

- [ ] Document MariaDB migration, local API startup, frontend setup, and FIDO2 secure-origin requirement.
- [ ] Run the Python tests, frontend test, Prisma validation, and frontend build.
